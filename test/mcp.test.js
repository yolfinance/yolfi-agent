import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { callMcpTool, createMcpCapabilities, handleMcpRequest, mcp } from '../src/mcp.js';
import { readStoredCredential, readWebhookSigningSecret, saveCredential } from '../src/config.js';
import { signWebhookPayload } from '../src/webhooks.js';

function useTemporaryConfig(t) {
  const previous = process.env.YOLFI_CONFIG_HOME;
  const configHome = mkdtempSync(path.join(os.tmpdir(), 'yolfi-mcp-registration-'));
  process.env.YOLFI_CONFIG_HOME = configHome;
  t.after(() => {
    if (previous === undefined) delete process.env.YOLFI_CONFIG_HOME;
    else process.env.YOLFI_CONFIG_HOME = previous;
    rmSync(configHome, { recursive: true, force: true });
  });
}

test('one MCP server exposes payment tools and knowledge resources', () => {
  const capabilities = createMcpCapabilities();

  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_paylinks_create'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_agent_register'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_agent_setup_start'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_agent_checkin'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_webhooks_verify'));
  assert.ok(capabilities.resources.some((resource) => resource.uri === 'yolfi://docs/agent-quickstart'));
  assert.ok(capabilities.prompts.some((prompt) => prompt.name === 'integrate_yolfi_payments'));
});

test('authorized local MCP uses its stored agent credential without YOLFI_API_KEY', async (t) => {
  useTemporaryConfig(t);
  const previousApiKey = process.env.YOLFI_API_KEY;
  delete process.env.YOLFI_API_KEY;
  t.after(() => {
    if (previousApiKey === undefined) delete process.env.YOLFI_API_KEY;
    else process.env.YOLFI_API_KEY = previousApiKey;
  });
  const credential = `yolfi_agent_${'a'.repeat(64)}`;
  saveCredential({ apiKey: credential });
  const requests = [];
  const options = {
    apiBaseUrl: 'https://yolfi.invalid/api',
    fetcher: async (url, request) => {
      requests.push({ url, request });
      return { ok: true, text: async () => JSON.stringify({ success: true, data: { organizationId: 'org-1' } }) };
    },
  };
  for (const name of ['yolfi_auth_status', 'yolfi_paylinks_list']) {
    const result = await callMcpTool(name, {}, options);
    assert.ok(!result.isError);
    assert.ok(!JSON.stringify(result).includes(credential));
  }
  assert.equal(requests.length, 2);
  assert.ok(requests.every(({ request }) => request.headers.Authorization === `Bearer ${credential}`));
  assert.ok(requests.every(({ url }) => !url.includes('/api-key')));
});

test('MCP setup and check-in tools forward compatible agent identifiers', async () => {
  const calls = [];
  const started = await callMcpTool('yolfi_agent_setup_start', { agentId: 'codex' }, {
    setupAgent: async args => {
      calls.push(['start', args]);
      return { success: true, loginUrl: 'https://app.yolfi.com/login' };
    },
  });
  const checked = await callMcpTool('yolfi_agent_checkin', { agent: 'codex' }, {
    checkinAgent: async args => {
      calls.push(['checkin', args]);
      return { success: true, connected: true };
    },
  });

  assert.equal(started.structuredContent.data.loginUrl, 'https://app.yolfi.com/login');
  assert.equal(checked.structuredContent.data.connected, true);
  assert.deepEqual(calls, [
    ['start', { agentId: 'codex' }],
    ['checkin', { agent: 'codex' }],
  ]);
});

test('MCP schemas match current paylink and payment DTO requirements', () => {
  const tools = createMcpCapabilities().tools;
  const paylink = tools.find(tool => tool.name === 'yolfi_paylinks_create').inputSchema;
  const payment = tools.find(tool => tool.name === 'yolfi_payments_create').inputSchema;

  assert.deepEqual(paylink.required, ['name', 'price']);
  for (const field of ['imageUrl', 'collectName', 'collectDateOfBirth', 'collectAddress', 'collectPhoneNumber']) {
    assert.ok(paylink.properties[field], field);
  }
  assert.ok(!payment.required.includes('customerEmail'));
  assert.ok(payment.properties.checkoutSessionId);
  assert.ok(paylink.properties.paymentMetadata);
  assert.equal(paylink.properties.recurringIntervalCount.type, 'integer');
  assert.ok(payment.properties.language);
});

test('MCP runtime validation rejects missing and unknown arguments before API calls', async () => {
  let calls = 0;
  const client = {
    createPayment: async () => {
      calls += 1;
    },
    authStatus: async () => {
      calls += 1;
    },
  };

  const missing = await callMcpTool('yolfi_payments_create', {
    paylinkId: 'paylink-1',
    symbol: 'USDC',
  }, { client });
  const unknown = await callMcpTool('yolfi_auth_status', { surprise: true }, { client });

  assert.equal(missing.isError, true);
  assert.match(missing.structuredContent.message, /network is required/);
  assert.equal(unknown.isError, true);
  assert.match(unknown.structuredContent.message, /surprise is not allowed/);
  assert.equal(calls, 0);
});

test('MCP prompt and resource protocol handlers resolve by name and reject unknown values', async () => {
  const createPrompt = await handleMcpRequest({
    jsonrpc: '2.0', id: 1, method: 'prompts/get', params: { name: 'create_yolfi_paylink' },
  });
  const webhookPrompt = await handleMcpRequest({
    jsonrpc: '2.0', id: 2, method: 'prompts/get', params: { name: 'add_yolfi_webhook_handler' },
  });
  const missingPrompt = await handleMcpRequest({
    jsonrpc: '2.0', id: 3, method: 'prompts/get', params: { name: 'missing' },
  });
  const missingResource = await handleMcpRequest({
    jsonrpc: '2.0', id: 4, method: 'resources/read', params: { uri: 'yolfi://missing' },
  });

  assert.notEqual(createPrompt.result.messages[0].content.text, webhookPrompt.result.messages[0].content.text);
  assert.ok(createPrompt.result.messages[0].content.text.includes('https://docs.yolfi.com/ai'));
  assert.equal(missingPrompt.error.code, -32602);
  assert.equal(missingResource.error.code, -32602);
});

test('MCP protocol initializes as 2025-06-18 and rejects removed JSON-RPC batching', async () => {
  const initialized = await handleMcpRequest({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-06-18' },
  });
  const batched = await handleMcpRequest([
    { jsonrpc: '2.0', id: 2, method: 'ping' },
    { jsonrpc: '2.0', id: 3, method: 'ping' },
  ]);

  assert.equal(initialized.result.protocolVersion, '2025-06-18');
  assert.equal(initialized.result.serverInfo.version, '0.2.1');
  assert.match(initialized.result.instructions, /Yolfi tools/);
  assert.ok(initialized.result.instructions.includes('https://docs.yolfi.com/ai'));
  assert.equal(batched.id, null);
  assert.equal(batched.error.code, -32600);
  assert.match(batched.error.message, /batching is not supported/);
});

test('local stdio MCP rejects a JSON-RPC batch instead of silently treating it as a notification', () => {
  const cliPath = fileURLToPath(new URL('../src/cli.js', import.meta.url));
  const child = spawnSync(process.execPath, [cliPath, 'mcp'], {
    input: `${JSON.stringify([{ jsonrpc: '2.0', id: 1, method: 'ping' }])}\n`,
    encoding: 'utf8',
  });

  assert.equal(child.status, 0, child.stderr);
  const response = JSON.parse(child.stdout.trim());
  assert.equal(response.id, null);
  assert.equal(response.error.code, -32600);
});

test('MCP agent registration reports confirmation pending, then stores the credential', async (t) => {
  useTemporaryConfig(t);
  const apiKey = `yolfi_agent_${'b'.repeat(64)}`;
  const payload = {
    email: 'Owner@Example.com',
    agentName: 'Codex',
    projectName: 'Space Shop',
  };
  let registrationCall;
  const client = {
    registerAgent: async (received, options) => {
      registrationCall = { received, options };
      return {
        success: true,
        data: {
          status: 'pending',
          email: received.email,
          checkinToken: 'yolfi_checkin_mcp-secret',
        },
      };
    },
    checkinAgentRegistration: async checkinToken => {
      assert.equal(checkinToken, 'yolfi_checkin_mcp-secret');
      return {
        success: true,
        data: { status: 'connected', organizationId: 'org-1', apiKey },
      };
    },
  };
  const pending = await callMcpTool('yolfi_agent_register', payload, { client });

  assert.equal(pending.structuredContent.success, true);
  assert.deepEqual(registrationCall.received, {
    ...payload,
    email: 'owner@example.com',
    projectUrl: undefined,
    integrationIntent: 'accept_payments',
    language: undefined,
    ref: undefined,
  });
  assert.match(registrationCall.options.idempotencyKey, /^[0-9a-f-]{36}$/i);
  assert.equal(pending.structuredContent.data.data.status, 'pending');
  assert.equal(pending.structuredContent.data.data.confirmationRequired, true);
  assert.match(pending.structuredContent.summary, /confirmation link was sent/i);
  assert.ok(!JSON.stringify(pending).includes('yolfi_checkin_mcp-secret'));
  assert.equal(readStoredCredential().apiKey, undefined);

  const result = await callMcpTool('yolfi_agent_register', payload, { client });

  assert.equal(readStoredCredential().apiKey, apiKey);
  assert.ok(!JSON.stringify(result).includes(apiKey));
  assert.equal(result.structuredContent.data.data.connected, true);
  assert.match(result.structuredContent.summary, /registration confirmed/i);
});

test('MCP agent registration forwards an explicit retry key outside the request body', async (t) => {
  useTemporaryConfig(t);
  let registrationCall;
  const result = await callMcpTool('yolfi_agent_register', {
    email: 'owner@example.com',
    agentName: 'Codex',
    projectName: 'Space Shop',
    idempotencyKey: 'registration-retry-key-001',
  }, {
    client: {
      registerAgent: async (payload, options) => {
        registrationCall = { payload, options };
        return {
          success: true,
          data: { status: 'pending', checkinToken: 'yolfi_checkin_explicit-secret' },
        };
      },
    },
  });

  assert.equal(result.structuredContent.success, true);
  assert.equal(result.structuredContent.data.data.status, 'pending');
  assert.equal(registrationCall.payload.idempotencyKey, undefined);
  assert.equal(registrationCall.options.idempotencyKey, 'registration-retry-key-001');

  const invalid = await callMcpTool('yolfi_agent_register', {
    email: 'other@example.com',
    agentName: 'Codex',
    projectName: 'Space Shop',
    idempotencyKey: 'short',
  }, { client: { registerAgent: async () => assert.fail('invalid key reached client') } });
  assert.equal(invalid.isError, true);
  assert.match(invalid.structuredContent.message, /at least 16 characters/);
});

test('destructive MCP tools are clearly marked', () => {
  const capabilities = createMcpCapabilities();
  const disableTool = capabilities.tools.find((tool) => tool.name === 'yolfi_paylinks_disable');

  assert.ok(disableTool.description.includes('destructive'));
  assert.equal(disableTool.inputSchema.properties.confirm.const, true);
});

test('organization update does not advertise removed organization webhook fields', () => {
  const tool = createMcpCapabilities().tools.find(({ name }) => name === 'yolfi_organization_update');

  assert.deepEqual(Object.keys(tool.inputSchema.properties).sort(), ['disableAllEmailNotifications', 'email', 'feePayer', 'logoUrl', 'name']);
});

test('webhook MCP tools expose and forward flat metadata filters without returning signing secrets', async (t) => {
  useTemporaryConfig(t);
  const capabilities = createMcpCapabilities();
  for (const name of ['yolfi_webhooks_configure', 'yolfi_webhooks_update']) {
    const schema = capabilities.tools.find(tool => tool.name === name).inputSchema.properties.metadataFilters;
    assert.equal(schema.type, 'object');
    assert.deepEqual(schema.additionalProperties, { type: 'string', maxLength: 255 });
    assert.equal(schema.maxProperties, 10);
    assert.equal(schema.propertyNames.maxLength, 100);
  }

  const calls = [];
  const signingSecret = 'c'.repeat(64);
  const client = {
    configureWebhooks: async (payload) => {
      calls.push(['create', payload]);
      return { success: true, data: { id: 'endpoint-1', signingSecret } };
    },
    updateWebhookEndpoint: async (id, payload) => calls.push(['update', id, payload]),
  };
  const metadataFilters = { website_id: 'website-1' };
  const created = await callMcpTool('yolfi_webhooks_configure', { url: 'https://analytics.test/webhook', metadataFilters }, { client });
  await callMcpTool('yolfi_webhooks_update', { id: 'endpoint-1', metadataFilters }, { client });
  assert.deepEqual(calls[0][1].metadataFilters, metadataFilters);
  assert.deepEqual(calls[1][2].metadataFilters, metadataFilters);
  assert.ok(!JSON.stringify(created).includes(signingSecret));
  assert.equal(created.structuredContent.data.data.signingSecretStored, true);
});

test('MCP tools expose titles and argument descriptions for registry scanners', () => {
  const capabilities = createMcpCapabilities();

  for (const tool of capabilities.tools) {
    assert.equal(typeof tool.title, 'string', `${tool.name} title`);
    assert.ok(tool.title.length > 0, `${tool.name} title`);
    assert.ok(tool.description.length > 40, `${tool.name} description`);

    for (const [propertyName, propertySchema] of Object.entries(tool.inputSchema.properties)) {
      assert.equal(typeof propertySchema.description, 'string', `${tool.name}.${propertyName} description`);
      assert.ok(propertySchema.description.length > 0, `${tool.name}.${propertyName} description`);
    }
  }
});

test('MCP tools expose safety annotations for registry scanners', () => {
  const capabilities = createMcpCapabilities();
  const disableTool = capabilities.tools.find((tool) => tool.name === 'yolfi_paylinks_disable');
  const listTool = capabilities.tools.find((tool) => tool.name === 'yolfi_paylinks_list');

  assert.equal(disableTool.annotations.destructiveHint, true);
  assert.equal(disableTool.annotations.readOnlyHint, false);
  assert.equal(listTool.annotations.readOnlyHint, true);
  assert.equal(listTool.annotations.destructiveHint, false);
});

test('MCP static export exposes server metadata for scanners', () => {
  assert.equal(mcp.protocolVersion, '2025-06-18');
  assert.equal(mcp.serverName, 'yolfi-agent-kit');
  assert.equal(mcp.serverTitle, 'Yolfi Payments MCP');
  assert.equal(mcp.serverVersion, '0.2.1');
  assert.ok(mcp.tools.some((tool) => tool.name === 'yolfi_paylinks_create'));
  assert.equal(mcp.outputSchema.type, 'object');
});

test('local MCP stores and redacts endpoint secrets, verifies by id, rotates, and clears removed endpoints', async (t) => {
  useTemporaryConfig(t);
  const oldSecret = process.env.YOLFI_WEBHOOK_SECRET;
  delete process.env.YOLFI_WEBHOOK_SECRET;
  t.after(() => {
    if (oldSecret === undefined) delete process.env.YOLFI_WEBHOOK_SECRET;
    else process.env.YOLFI_WEBHOOK_SECRET = oldSecret;
  });
  const initialSecret = 'created-fixture-secret';
  const rotatedSecret = 'rotated-fixture-secret';
  const client = {
    configureWebhooks: async () => ({ success: true, data: { id: 'endpoint-1', signingSecret: initialSecret } }),
    rotateWebhookEndpointSecret: async () => ({ success: true, data: { signingSecret: rotatedSecret } }),
    deleteWebhookEndpoint: async () => ({ success: true }),
  };
  const created = await callMcpTool('yolfi_webhooks_configure', { url: 'https://example.test/webhook' }, { client });
  assert.equal(created.isError, undefined);
  assert.equal(created.structuredContent.data.data.signingSecretStored, true);
  assert.ok(!JSON.stringify(created).includes(initialSecret));
  assert.equal(readWebhookSigningSecret('endpoint-1'), initialSecret);
  const payload = '{"id":"event-1"}';
  const verified = await callMcpTool('yolfi_webhooks_verify', {
    endpointId: 'endpoint-1', payload, signature: signWebhookPayload(payload, initialSecret),
  }, { client });
  assert.equal(verified.structuredContent.data.valid, true);
  const rotated = await callMcpTool('yolfi_webhooks_rotate_secret', { id: 'endpoint-1', confirm: true }, { client });
  assert.ok(!JSON.stringify(rotated).includes(rotatedSecret));
  assert.equal(readWebhookSigningSecret('endpoint-1'), rotatedSecret);
  const obsolete = await callMcpTool('yolfi_webhooks_verify', {
    endpointId: 'endpoint-1', payload, signature: signWebhookPayload(payload, initialSecret),
  }, { client });
  assert.equal(obsolete.structuredContent.data.valid, false);
  await callMcpTool('yolfi_webhooks_delete', { id: 'endpoint-1', confirm: true }, { client });
  assert.equal(readWebhookSigningSecret('endpoint-1'), undefined);
});

test('MCP webhook verification rejects plaintext signing secrets in tool arguments', async () => {
  const payload = '{}';
  const secret = 'compatibility-fixture-secret';
  const result = await callMcpTool('yolfi_webhooks_verify', {
    payload, signature: signWebhookPayload(payload, secret), secret,
  }, { client: {} });
  assert.equal(result.isError, true);
  assert.match(result.structuredContent.message, /secret is not allowed/);
  assert.ok(!JSON.stringify(result).includes(secret));
});

test('MCP Checkout Sessions enforce order shape and preserve a stable retry key', async () => {
  const calls = [];
  const client = { createCheckoutSession: async (payload, options) => {
    calls.push({ payload, options });
    return { success: true, data: { id: `ycs_${'a'.repeat(32)}` } };
  } };
  for (const args of [
    { amount: '19', currency: 'USD' },
    { paylinkId: 'paylink-1', amount: '19' },
    { amount: '19', currency: 'USD', idempotencyKey: 'checkout-order-123', subscriptionId: 'subscription-1' },
    { paylinkId: 'paylink-1', expiresInMinutes: 1 },
    { paylinkId: 'paylink-1', expiresInMinutes: 5.5 },
  ]) {
    assert.equal((await callMcpTool('yolfi_checkout_sessions_create', args, { client })).isError, true);
  }
  assert.equal(calls.length, 0);
  const result = await callMcpTool('yolfi_checkout_sessions_create', {
    amount: '19', currency: 'USD', merchantOrderId: 'order-123', idempotencyKey: 'checkout-order-123',
  }, { client });
  assert.equal(result.isError, undefined);
  assert.deepEqual(calls[0], {
    payload: { amount: '19', currency: 'USD', merchantOrderId: 'order-123' },
    options: { idempotencyKey: 'checkout-order-123' },
  });
});

test('MCP payments allow session context and omit email for backend resolution', async () => {
  let received;
  const client = { createPayment: async args => {
    received = args;
    return { success: true };
  } };
  const args = { checkoutSessionId: `ycs_${'a'.repeat(32)}`, network: 'ARB', symbol: 'USDC' };
  assert.equal((await callMcpTool('yolfi_payments_create', args, { client })).isError, undefined);
  assert.deepEqual(received, args);
  assert.equal((await callMcpTool('yolfi_payments_create', { network: 'ARB', symbol: 'USDC' }, { client })).isError, true);
});

test('MCP accepts Litecoin with either payment source and rejects unknown networks before API calls', async () => {
  const calls = [];
  const client = { createPayment: async args => {
    calls.push(args);
    return { success: true };
  } };
  for (const source of [
    { paylinkId: 'paylink-1', customerEmail: 'customer@example.com' },
    { checkoutSessionId: `ycs_${'a'.repeat(32)}` },
  ]) {
    const args = { ...source, network: 'LTC', symbol: 'LTC' };
    assert.equal((await callMcpTool('yolfi_payments_create', args, { client })).isError, undefined);
    assert.deepEqual(calls.at(-1), args);
  }
  const unknown = await callMcpTool('yolfi_payments_create', {
    paylinkId: 'paylink-1', network: 'UNSUPPORTED', symbol: 'USDC',
  }, { client });
  assert.equal(unknown.isError, true);
  assert.match(unknown.structuredContent.message, /network/);
  assert.equal(calls.length, 2);
});
