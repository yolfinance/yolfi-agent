import assert from 'node:assert/strict';
import test from 'node:test';
import { YolfiClient, normalizeYolfiError } from '../src/client.js';
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

test('YolfiClient calls agent registration without bearer auth', async () => {
  const calls = [];
  const client = new YolfiClient({
    apiBaseUrl: 'https://app.local/api',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ success: true, data: { apiKey: 'one-time-key' } });
    },
  });

  const result = await client.registerAgent({
    agentName: 'Codex',
    projectName: 'Space Shop',
    integrationIntent: 'accept_payments',
  });

  assert.equal(result.data.apiKey, 'one-time-key');
  assert.equal(calls[0].url, 'https://app.local/api/auth/agent/register');
  assert.equal(calls[0].options.headers.Authorization, undefined);
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
    name: 'Talivia',
    url: 'https://talivia.local/webhook',
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

test('webhook helper signs and verifies current Yolfi base64 HMAC signatures', () => {
  const payload = JSON.stringify({ id: 'evt_1', type: 'payment.confirmed' });
  const signature = signWebhookPayload(payload, 'agent-api-key');

  assert.equal(verifyWebhookSignature(payload, signature, 'agent-api-key'), true);
  assert.equal(verifyWebhookSignature(payload, signature, 'wrong-secret'), false);
});

test('MCP webhook verification requires a webhook secret and never falls back to the API key', async () => {
  const payload = JSON.stringify({ id: 'evt_1', type: 'payment.confirmed' });
  const previousApiKey = process.env.YOLFI_API_KEY;
  const previousWebhookSecret = process.env.YOLFI_WEBHOOK_SECRET;
  process.env.YOLFI_API_KEY = 'organization-api-key';
  delete process.env.YOLFI_WEBHOOK_SECRET;

  try {
    const result = await callMcpTool('yolfi_webhooks_verify', {
      payload,
      signature: signWebhookPayload(payload, 'organization-api-key'),
    });
    assert.equal(result.isError, true);
    assert.match(result.structuredContent.message, /webhook signing secret is required/i);
  } finally {
    if (previousApiKey === undefined) delete process.env.YOLFI_API_KEY;
    else process.env.YOLFI_API_KEY = previousApiKey;
    if (previousWebhookSecret === undefined) delete process.env.YOLFI_WEBHOOK_SECRET;
    else process.env.YOLFI_WEBHOOK_SECRET = previousWebhookSecret;
  }
});

test('MCP webhook rotation and deletion require explicit confirmation', async () => {
  const calls = [];
  const client = {
    rotateWebhookEndpointSecret: async id => calls.push(['rotate', id]),
    deleteWebhookEndpoint: async id => calls.push(['delete', id]),
  };

  assert.equal((await callMcpTool('yolfi_webhooks_rotate_secret', { id: 'endpoint-1' }, { client })).isError, true);
  assert.equal((await callMcpTool('yolfi_webhooks_delete', { id: 'endpoint-1' }, { client })).isError, true);
  assert.deepEqual(calls, []);

  await callMcpTool('yolfi_webhooks_rotate_secret', { id: 'endpoint-1', confirm: true }, { client });
  await callMcpTool('yolfi_webhooks_delete', { id: 'endpoint-1', confirm: true }, { client });
  assert.deepEqual(calls, [['rotate', 'endpoint-1'], ['delete', 'endpoint-1']]);

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
