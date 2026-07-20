import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('CLI documents the optional agent registration idempotency key', () => {
  const cliPath = fileURLToPath(new URL('../src/cli.js', import.meta.url));
  const child = spawnSync(process.execPath, [cliPath, 'help'], { encoding: 'utf8' });

  assert.equal(child.status, 0, child.stderr);
  assert.match(child.stdout, /auth:agent-register.*--email user@example\.com/);
  assert.match(child.stdout, /auth:agent-register.*--idempotency-key <key>/);
  assert.match(child.stdout, /same auth:agent-register command again/);
  assert.match(child.stdout, /webhooks:verify --endpoint-id <endpointId>/);
  assert.doesNotMatch(child.stdout, /webhooks:verify.*--secret/);
});
