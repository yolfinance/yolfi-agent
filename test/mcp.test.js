import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { callMcpTool, createMcpCapabilities, handleMcpRequest, mcp } from '../src/mcp.js';
import { readStoredCredential } from '../src/config.js';

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

test('MCP capabilities expose yolfi-api tools and yolfi-knowledge resources', () => {
  const capabilities = createMcpCapabilities();

  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_paylinks_create'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_agent_register'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_agent_setup_start'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_agent_checkin'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_webhooks_verify'));
  assert.ok(capabilities.resources.some((resource) => resource.uri === 'yolfi://docs/agent-quickstart'));
  assert.ok(capabilities.prompts.some((prompt) => prompt.name === 'integrate_yolfi_payments'));
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
  assert.ok(payment.required.includes('customerEmail'));
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
    network: 'ARB',
    symbol: 'USDC',
  }, { client });
  const unknown = await callMcpTool('yolfi_auth_status', { surprise: true }, { client });

  assert.equal(missing.isError, true);
  assert.match(missing.structuredContent.message, /customerEmail is required/);
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
  assert.equal(initialized.result.serverInfo.version, '0.2.0');
  assert.match(initialized.result.instructions, /Yolfi tools/);
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

  assert.deepEqual(Object.keys(tool.inputSchema.properties).sort(), ['email', 'name']);
});

test('webhook MCP tools expose and forward flat metadata filters without returning signing secrets', async (t) => {
  const previousConfigHome = process.env.YOLFI_CONFIG_HOME;
  const configHome = mkdtempSync(path.join(os.tmpdir(), 'yolfi-mcp-webhook-'));
  process.env.YOLFI_CONFIG_HOME = configHome;
  t.after(() => {
    if (previousConfigHome === undefined) delete process.env.YOLFI_CONFIG_HOME;
    else process.env.YOLFI_CONFIG_HOME = previousConfigHome;
    rmSync(configHome, { recursive: true, force: true });
  });

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
  assert.equal(mcp.serverVersion, '0.2.0');
  assert.ok(mcp.tools.some((tool) => tool.name === 'yolfi_paylinks_create'));
  assert.equal(mcp.outputSchema.type, 'object');
});
