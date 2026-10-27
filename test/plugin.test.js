import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function readJson(relativeUrl) {
  return JSON.parse(readFileSync(new URL(relativeUrl, import.meta.url), 'utf8'));
}

test('packaged plugins launch the bundled local MCP server', () => {
  const codexPlugin = readJson('../.codex-plugin/plugin.json');
  const claudeMcp = readJson('../.mcp.json');

  assert.deepEqual(codexPlugin.mcpServers.yolfi, {
    command: 'node',
    args: ['./src/cli.js', 'mcp'],
    cwd: '.',
  });
  assert.deepEqual(claudeMcp.mcpServers.yolfi, {
    command: 'node',
    args: ['${CLAUDE_PLUGIN_ROOT}/src/cli.js', 'mcp'],
  });
  assert.ok(codexPlugin.interface.defaultPrompt.every(prompt => prompt.includes('https://docs.yolfi.com/ai')));
});

test('package, plugins, registry metadata, and MCP initialize report one version', async () => {
  const { handleMcpRequest } = await import('../src/mcp.js');
  const version = readJson('../package.json').version;
  assert.equal(readJson('../server.json').version, version);
  assert.equal(readJson('../server.json').packages[0].version, version);
  assert.equal(readJson('../.codex-plugin/plugin.json').version, version);
  assert.equal(readJson('../.claude-plugin/plugin.json').version, version);
  const response = await handleMcpRequest({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
  assert.equal(response.result.serverInfo.version, version);
});

test('every package language guide uses the canonical prompt and a single local MCP server without placeholder credentials', async () => {
  const { readdirSync } = await import('node:fs');
  const base = new URL('../docs/i18n/', import.meta.url);
  const guides = ['../README.md', ...readdirSync(base).filter(name => name.endsWith('.md')).map(name => `../docs/i18n/${name}`)];
  assert.equal(guides.length, 10);
  for (const guide of guides) {
    const source = readFileSync(new URL(guide, import.meta.url), 'utf8');
    assert.match(source, /https:\/\/docs\.yolfi\.com\/ai/, guide);
    assert.match(source, /https:\/\/docs\.yolfi\.com\/en\/agent-kit\/connections/, guide);
    const blocks = [...source.matchAll(/```json\n([\s\S]*?)\n```/g)];
    const configs = blocks.map(match => JSON.parse(match[1])).filter(value => value.mcpServers);
    assert.equal(configs.length, 1, guide);
    assert.deepEqual(Object.keys(configs[0].mcpServers), ['yolfi'], guide);
    assert.equal(configs[0].mcpServers.yolfi.env, undefined, guide);
  }
});
