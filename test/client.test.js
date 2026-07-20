import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { YolfiClient, normalizeYolfiError } from '../src/client.js';
import {
  readWebhookSigningSecret,
  saveCredential,
  saveWebhookSigningSecret,
} from '../src/config.js';
import { signWebhookPayload, verifyWebhookSignature } from '../src/webhooks.js';
import { callMcpTool, createMcpCapabilities } from '../src/mcp.js';

function jsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    async json() {
      return body;
    },
    async text() {
      return JSON.stringify(body);
    },
  };
}

test('explicit and environment credentials take precedence over protected stored credentials', (t) => {
  const previousConfigHome = process.env.YOLFI_CONFIG_HOME;
  const previousApiKey = process.env.YOLFI_API_KEY;
  const configHome = mkdtempSync(path.join(os.tmpdir(), 'yolfi-client-'));
  process.env.YOLFI_CONFIG_HOME = configHome;
  delete process.env.YOLFI_API_KEY;
  t.after(() => {
    if (previousConfigHome === undefined) delete process.env.YOLFI_CONFIG_HOME;
    else process.env.YOLFI_CONFIG_HOME = previousConfigHome;
    if (previousApiKey === undefined) delete process.env.YOLFI_API_KEY;
    else process.env.YOLFI_API_KEY = previousApiKey;
    rmSync(configHome, { recursive: true, force: true });
  });

  saveCredential({ apiKey: 'yolfi_agent_stored' });
  assert.equal(new YolfiClient({ fetcher: async () => {} }).apiKey, 'yolfi_agent_stored');

  process.env.YOLFI_API_KEY = 'yolfi_agent_environment';
  assert.equal(new YolfiClient({ fetcher: async () => {} }).apiKey, 'yolfi_agent_environment');
  assert.equal(new YolfiClient({ apiKey: 'yolfi_agent_explicit', fetcher: async () => {} }).apiKey, 'yolfi_agent_explicit');
});

test('YolfiClient maps paylink creation to the existing private endpoint with bearer auth', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiKey: 'agent-api-key',
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true, data: { id: 'paylink-1' } });
    },
  });

  const result = await client.createPaylink({ name: 'Premium', price: '19', currency: 'USD' });

  assert.equal(result.data.id, 'paylink-1');
  assert.equal(calls[0].url, 'https://app.local/api/private/paylinks/create');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer agent-api-key');
  assert.equal(calls[0].options.body, JSON.stringify({ name: 'Premium', price: '19', currency: 'USD' }));
});

test('YolfiClient calls agent registration with idempotency key and without bearer auth', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true, data: { apiKey: 'one-time-key' } });
    },
  });

  const result = await client.registerAgent(
    {
      email: 'owner@example.com',
      agentName: 'Codex',
      projectName: 'Space Shop',
      integrationIntent: 'accept_payments',
    },
    { idempotencyKey: 'registration-retry-key-001' },
  );

  assert.equal(result.data.apiKey, 'one-time-key');
  assert.equal(calls[0].url, 'https://app.local/api/auth/agent/register');
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(calls[0].options.headers['Idempotency-Key'], 'registration-retry-key-001');
});

test('YolfiClient checks in a confirmed registration without bearer auth', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true, data: { status: 'pending' } });
    },
  });

  await client.checkinAgentRegistration('yolfi_checkin_pending-secret');

  assert.equal(calls[0].url, 'https://app.local/api/agent/setup/checkin');
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    checkinToken: 'yolfi_checkin_pending-secret',
  });
});

test('YolfiClient generates a fresh UUID idempotency key for each registration invocation', async () => {
  const keys = [];
  const client = new YolfiClient({
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (_url, options) => {
      keys.push(options.headers['Idempotency-Key']);
      return jsonResponse({ success: true });
    },
  });
  const payload = { email: 'owner@example.com', agentName: 'Codex', projectName: 'Space Shop' };

  await client.registerAgent(payload);
  await client.registerAgent(payload);

  assert.match(keys[0], /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.match(keys[1], /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.notEqual(keys[0], keys[1]);
});

test('YolfiClient rejects idempotency keys outside the backend length contract', () => {
  const client = new YolfiClient({ fetcher: async () => jsonResponse({ success: true }) });

  assert.throws(
    () => client.registerAgent({ email: 'owner@example.com', agentName: 'Codex', projectName: 'Space Shop' }, { idempotencyKey: 'too-short' }),
    /between 16 and 200 characters/,
  );
});

test('YolfiClient maps public payment creation to the public payments endpoint', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiKey: 'agent-api-key',
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true, data: { id: 'payment-1' } });
    },
  });

  await client.createPayment({ paylinkId: 'paylink-1', network: 'ARB', symbol: 'USDC' });

  assert.equal(calls[0].url, 'https://app.local/api/public/payments');
  assert.equal(calls[0].options.headers.Authorization, undefined);
});

test('YolfiClient manages independent webhook endpoints', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiKey: 'agent-api-key',
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true });
    },
  });

  await client.listWebhookEndpoints();
  await client.configureWebhooks({
    name: 'Analytics',
    url: 'https://analytics.local/webhook',
    adapter: 'NONE',
    metadataFilters: { website_id: 'website-1' },
  });
  await client.updateWebhookEndpoint('endpoint-1', {
    enabled: false,
    metadataFilters: { website_id: 'website-1' },
  });
  await client.rotateWebhookEndpointSecret('endpoint-1');
  await client.deleteWebhookEndpoint('endpoint-1');

  assert.deepEqual(calls.map(call => [call.options.method, call.url]), [
    ['GET', 'https://app.local/api/private/organization/webhook-endpoints'],
    ['POST', 'https://app.local/api/private/organization/webhook-endpoints'],
    ['PUT', 'https://app.local/api/private/organization/webhook-endpoints/endpoint-1'],
    ['POST', 'https://app.local/api/private/organization/webhook-endpoints/endpoint-1/rotate-secret'],
    ['DELETE', 'https://app.local/api/private/organization/webhook-endpoints/endpoint-1'],
  ]);
  assert.deepEqual(JSON.parse(calls[1].options.body).metadataFilters, {
    website_id: 'website-1',
  });
  assert.deepEqual(JSON.parse(calls[2].options.body).metadataFilters, {
    website_id: 'website-1',
  });
});

test('normalizeYolfiError keeps backend code, message, details, and raw response', () => {
  const normalized = normalizeYolfiError({ success: false, code: 11002, message: 'missing price' });

  assert.deepEqual(normalized, {
    success: false,
    code: 11002,
    message: 'missing price',
    details: undefined,
    raw: { success: false, code: 11002, message: 'missing price' },
  });
});

test('YolfiClient reads an invalid JSON response body only once and preserves its text', async () => {
  let textReads = 0;
  const client = new YolfiClient({
    apiKey: 'agent-api-key',
    fetcher: async () => ({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      async text() {
        textReads += 1;
        return 'upstream unavailable';
      },
    }),
  });

  await assert.rejects(
    client.authStatus(),
    error => error.normalized?.message === 'upstream unavailable',
  );
  assert.equal(textReads, 1);
});

test('webhook helper signs and verifies current Yolfi base64 HMAC signatures', () => {
  const payload = JSON.stringify({ id: 'evt_1', type: 'payment.confirmed' });
  const signature = signWebhookPayload(payload, 'agent-api-key');

  assert.equal(verifyWebhookSignature(payload, signature, 'agent-api-key'), true);
  assert.equal(verifyWebhookSignature(payload, signature, 'wrong-secret'), false);
});

test('MCP webhook verification uses protected endpoint secrets and never accepts plaintext secret arguments', async (t) => {
  const payload = JSON.stringify({ id: 'evt_1', type: 'payment.confirmed' });
  const previousApiKey = process.env.YOLFI_API_KEY;
  const previousWebhookSecret = process.env.YOLFI_WEBHOOK_SECRET;
  const previousConfigHome = process.env.YOLFI_CONFIG_HOME;
  const configHome = mkdtempSync(path.join(os.tmpdir(), 'yolfi-webhook-verify-'));
  process.env.YOLFI_CONFIG_HOME = configHome;
  process.env.YOLFI_API_KEY = 'organization-api-key';
  delete process.env.YOLFI_WEBHOOK_SECRET;
  t.after(() => rmSync(configHome, { recursive: true, force: true }));

  try {
    saveWebhookSigningSecret('endpoint-1', 'endpoint-signing-secret');
    const valid = await callMcpTool('yolfi_webhooks_verify', {
      payload,
      signature: signWebhookPayload(payload, 'endpoint-signing-secret'),
      endpointId: 'endpoint-1',
    });
    assert.equal(valid.structuredContent.data.valid, true);

    const missing = await callMcpTool('yolfi_webhooks_verify', {
      payload,
      signature: signWebhookPayload(payload, 'organization-api-key'),
    });
    assert.equal(missing.isError, true);
    assert.match(missing.structuredContent.message, /webhook signing secret is required/i);

    const schema = createMcpCapabilities().tools
      .find(tool => tool.name === 'yolfi_webhooks_verify').inputSchema;
    assert.equal(schema.properties.secret, undefined);
    assert.ok(schema.properties.endpointId);
  } finally {
    if (previousApiKey === undefined) delete process.env.YOLFI_API_KEY;
    else process.env.YOLFI_API_KEY = previousApiKey;
    if (previousWebhookSecret === undefined) delete process.env.YOLFI_WEBHOOK_SECRET;
    else process.env.YOLFI_WEBHOOK_SECRET = previousWebhookSecret;
    if (previousConfigHome === undefined) delete process.env.YOLFI_CONFIG_HOME;
    else process.env.YOLFI_CONFIG_HOME = previousConfigHome;
  }
});

test('MCP webhook rotation stores and redacts the secret before deletion clears it', async (t) => {
  const previousConfigHome = process.env.YOLFI_CONFIG_HOME;
  const configHome = mkdtempSync(path.join(os.tmpdir(), 'yolfi-webhook-rotate-'));
  process.env.YOLFI_CONFIG_HOME = configHome;
  t.after(() => {
    if (previousConfigHome === undefined) delete process.env.YOLFI_CONFIG_HOME;
    else process.env.YOLFI_CONFIG_HOME = previousConfigHome;
    rmSync(configHome, { recursive: true, force: true });
  });

  const calls = [];
  const rotatedSecret = 'b'.repeat(64);
  const client = {
    rotateWebhookEndpointSecret: async (id) => {
      calls.push(['rotate', id]);
      return { success: true, data: { signingSecret: rotatedSecret } };
    },
    deleteWebhookEndpoint: async (id) => {
      calls.push(['delete', id]);
      return { success: true };
    },
  };

  assert.equal((await callMcpTool('yolfi_webhooks_rotate_secret', { id: 'endpoint-1' }, { client })).isError, true);
  assert.equal((await callMcpTool('yolfi_webhooks_delete', { id: 'endpoint-1' }, { client })).isError, true);
  assert.deepEqual(calls, []);

  const rotated = await callMcpTool('yolfi_webhooks_rotate_secret', { id: 'endpoint-1', confirm: true }, { client });
  assert.equal(readWebhookSigningSecret('endpoint-1'), rotatedSecret);
  assert.equal(rotated.structuredContent.data.data.signingSecret, undefined);
  assert.ok(!JSON.stringify(rotated).includes(rotatedSecret));
  await callMcpTool('yolfi_webhooks_delete', { id: 'endpoint-1', confirm: true }, { client });
  assert.deepEqual(calls, [['rotate', 'endpoint-1'], ['delete', 'endpoint-1']]);
  assert.equal(readWebhookSigningSecret('endpoint-1'), undefined);

  const tools = createMcpCapabilities().tools;
  for (const name of ['yolfi_webhooks_rotate_secret', 'yolfi_webhooks_delete']) {
    const schema = tools.find(tool => tool.name === name).inputSchema;
    assert.deepEqual(schema.properties.confirm, {
      const: true,
      description: 'Must be true only after explicit user confirmation.',
    });
    assert.ok(schema.required.includes('confirm'));
  }
});
