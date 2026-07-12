import assert from 'node:assert/strict';
import test from 'node:test';
import { callMcpTool, createMcpCapabilities, mcp } from '../src/mcp.js';

test('MCP capabilities expose yolfi-api tools and yolfi-knowledge resources', () => {
  const capabilities = createMcpCapabilities();

  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_paylinks_create'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_agent_register'));
  assert.ok(capabilities.tools.some((tool) => tool.name === 'yolfi_webhooks_verify'));
  assert.ok(capabilities.resources.some((resource) => resource.uri === 'yolfi://docs/agent-quickstart'));
  assert.ok(capabilities.prompts.some((prompt) => prompt.name === 'integrate_yolfi_payments'));
});

test('MCP agent registration works without an API key', async () => {
  const payload = {
    agentName: 'Codex',
    projectName: 'Space Shop',
  };
  const result = await callMcpTool('yolfi_agent_register', payload, {
    client: {
      registerAgent: async (received) => ({
        success: true,
        data: {
          received,
          apiKey: 'yolfi_test_key',
        },
      }),
    },
  });

  assert.equal(result.structuredContent.success, true);
  assert.deepEqual(result.structuredContent.data.data.received, {
    ...payload,
    projectUrl: undefined,
    integrationIntent: 'accept_payments',
    language: undefined,
    ref: undefined,
  });
});

test('destructive MCP tools are clearly marked', () => {
  const capabilities = createMcpCapabilities();
  const disableTool = capabilities.tools.find((tool) => tool.name === 'yolfi_paylinks_disable');

  assert.ok(disableTool.description.includes('destructive'));
  assert.equal(disableTool.inputSchema.properties.confirm.const, true);
});

test('organization update does not advertise removed legacy webhook fields', () => {
  const tool = createMcpCapabilities().tools.find(({ name }) => name === 'yolfi_organization_update');

  assert.deepEqual(Object.keys(tool.inputSchema.properties).sort(), ['email', 'name']);
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
  assert.equal(mcp.serverVersion, '0.1.4');
  assert.ok(mcp.tools.some((tool) => tool.name === 'yolfi_paylinks_create'));
  assert.equal(mcp.outputSchema.type, 'object');
});
