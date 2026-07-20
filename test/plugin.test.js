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
});
