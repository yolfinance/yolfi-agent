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

test('organization:get reads organization context and webhook create output stays redacted', async (t) => {
  const { mkdtempSync, readFileSync, rmSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { signWebhookPayload } = await import('../src/webhooks.js');
  const temp = mkdtempSync(join(tmpdir(), 'yolfi-cli-flow-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const cliUrl = new URL('../src/cli.js', import.meta.url).href;
  function run(args, response) {
    const code = `globalThis.fetch = async () => ({ok:true,text:async()=>JSON.stringify(${JSON.stringify(response)})});
      process.argv = [process.execPath, 'yolfi', ...${JSON.stringify(args)}];
      await import(${JSON.stringify(cliUrl)});`;
    const env = { ...process.env, YOLFI_CONFIG_HOME: temp, YOLFI_API_KEY: 'fixture-key' };
    delete env.YOLFI_WEBHOOK_SECRET;
    return spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', env, cwd: temp });
  }
  const organization = run(['organization:get'], { success: true, data: { id: 'org-1' } });
  assert.equal(organization.status, 0, organization.stderr);
  assert.equal(JSON.parse(organization.stdout).data.id, 'org-1');
  const secret = 'never-print-this-fixture-secret';
  const created = run(['webhooks:add', '--url', 'https://example.test/webhook'], {
    success: true, data: { id: 'endpoint-1', signingSecret: secret },
  });
  assert.equal(created.status, 0, created.stderr);
  assert.equal(JSON.parse(created.stdout).data.signingSecretStored, true);
  assert.ok(!created.stdout.includes(secret));
  assert.equal(JSON.parse(readFileSync(join(temp, 'config.json'), 'utf8')).webhookSecrets['endpoint-1'].signingSecret, secret);
  const payload = '{"id":"event-1"}';
  writeFileSync(join(temp, 'raw.json'), payload);
  const verified = run(['webhooks:verify', '--endpoint-id', 'endpoint-1', '--payload', './raw.json', '--signature', signWebhookPayload(payload, secret)], {});
  assert.equal(verified.status, 0, verified.stderr);
  assert.equal(JSON.parse(verified.stdout).data.valid, true);
  const legacy = run(['webhooks:verify', '--secret', secret, '--payload', './raw.json', '--signature', signWebhookPayload(payload, secret)], {});
  assert.equal(legacy.status, 1);
  assert.match(JSON.parse(legacy.stdout).message, /Webhook signing secret is required/);
  assert.ok(!legacy.stdout.includes(secret));
  assert.ok(!legacy.stderr.includes(secret));
});
