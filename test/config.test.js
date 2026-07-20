import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  clearPendingSetup,
  clearPendingRegistration,
  clearWebhookSigningSecret,
  getConfigDir,
  getConfigPath,
  readConfig,
  readPendingSetup,
  readPendingRegistration,
  readStoredCredential,
  readWebhookSigningSecret,
  saveCredential,
  savePendingSetup,
  savePendingRegistration,
  saveRegistrationCredential,
  storeWebhookSigningSecret,
} from '../src/config.js';

function useTemporaryConfig(t) {
  const previous = process.env.YOLFI_CONFIG_HOME;
  const configHome = mkdtempSync(path.join(os.tmpdir(), 'yolfi-config-'));
  process.env.YOLFI_CONFIG_HOME = configHome;
  t.after(() => {
    if (previous === undefined) delete process.env.YOLFI_CONFIG_HOME;
    else process.env.YOLFI_CONFIG_HOME = previous;
    rmSync(configHome, { recursive: true, force: true });
  });
  return configHome;
}

test('stored Yolfi credentials use the configured protected path', (t) => {
  const configHome = useTemporaryConfig(t);
  saveCredential({ apiKey: 'yolfi_agent_stored' });

  assert.equal(getConfigDir(), configHome);
  assert.equal(readStoredCredential().apiKey, 'yolfi_agent_stored');
  saveCredential({ apiKey: 'yolfi_agent_replaced' });
  assert.equal(readStoredCredential().apiKey, 'yolfi_agent_replaced');
  assert.deepEqual(readdirSync(configHome), ['config.json']);

  if (process.platform !== 'win32') {
    assert.equal(statSync(configHome).mode & 0o777, 0o700);
    assert.equal(statSync(getConfigPath()).mode & 0o777, 0o600);
  }
});

test('webhook signing secrets are stored locally and removed from public results', (t) => {
  useTemporaryConfig(t);
  const signingSecret = 'a'.repeat(64);
  const publicResult = storeWebhookSigningSecret({
    success: true,
    data: {
      id: 'endpoint-1',
      name: 'Analytics',
      signingSecret,
    },
  });

  assert.equal(readWebhookSigningSecret('endpoint-1'), signingSecret);
  assert.equal(publicResult.data.signingSecret, undefined);
  assert.equal(publicResult.data.signingSecretStored, true);
  assert.ok(!JSON.stringify(publicResult).includes(signingSecret));

  clearWebhookSigningSecret('endpoint-1');
  assert.equal(readWebhookSigningSecret('endpoint-1'), undefined);
});

test('pending browser setup is isolated by agent slug and can be cleared', (t) => {
  useTemporaryConfig(t);
  savePendingSetup({
    agent: 'codex',
    checkinToken: 'checkin-secret',
    loginUrl: 'https://app.yolfi.com/agent/setup/session',
    expiresAt: '2026-07-19T10:00:00.000Z',
  });

  assert.equal(readPendingSetup('codex').checkinToken, 'checkin-secret');
  assert.equal(readPendingSetup('claude-code'), undefined);

  clearPendingSetup('codex');
  assert.equal(readPendingSetup('codex'), undefined);
});

test('agent registration credentials are stored and removed from the public result', (t) => {
  useTemporaryConfig(t);
  const apiKey = `yolfi_agent_${'a'.repeat(64)}`;
  const publicResult = saveRegistrationCredential({
    success: true,
    data: {
      email: 'owner@example.com',
      organizationId: 'org-1',
      apiKey,
    },
  });

  assert.equal(readStoredCredential().apiKey, apiKey);
  assert.equal(publicResult.data.apiKey, undefined);
  assert.equal(publicResult.data.connected, true);
  assert.equal(publicResult.data.keyPrefix, apiKey.slice(0, 24));
  assert.ok(!JSON.stringify(publicResult).includes(apiKey));
  assert.throws(
    () => saveRegistrationCredential({ data: { apiKey: 'yolfi_agent_' } }),
    /valid credential/,
  );
});

test('pending registration retry keys survive failures until the matching credential is stored', (t) => {
  useTemporaryConfig(t);
  savePendingRegistration({
    email: 'owner@example.com',
    idempotencyKey: 'registration-retry-key-001',
    checkinToken: 'yolfi_checkin_pending-secret',
    expiresAt: '2026-07-20T12:00:00.000Z',
  });

  const pending = readPendingRegistration('owner@example.com');
  assert.equal(pending.idempotencyKey, 'registration-retry-key-001');
  assert.equal(pending.checkinToken, 'yolfi_checkin_pending-secret');
  clearPendingRegistration('owner@example.com', 'another-key');
  assert.ok(readPendingRegistration('owner@example.com'));
  clearPendingRegistration('owner@example.com', 'registration-retry-key-001');
  assert.equal(readPendingRegistration('owner@example.com'), undefined);
});

test('parallel config writers preserve every one-time webhook secret', async (t) => {
  const configHome = useTemporaryConfig(t);
  const configModuleUrl = new URL('../src/config.js', import.meta.url).href;
  const writers = Array.from({ length: 20 }, (_, index) => new Promise((resolve, reject) => {
    const script = [
      `import { saveWebhookSigningSecret } from ${JSON.stringify(configModuleUrl)};`,
      `saveWebhookSigningSecret(${JSON.stringify(`endpoint-${index}`)}, ${JSON.stringify(String(index).padStart(64, '0'))});`,
    ].join('\n');
    const child = spawn(process.execPath, ['--input-type=module', '--eval', script], {
      env: { ...process.env, YOLFI_CONFIG_HOME: configHome },
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`config writer exited ${code}: ${stderr}`));
    });
  }));

  await Promise.all(writers);
  assert.equal(Object.keys(readConfig().webhookSecrets).length, 20);
});

test('an abandoned config lock is recovered only for a dead owner process', (t) => {
  useTemporaryConfig(t);
  const lockPath = `${getConfigPath()}.lock`;
  mkdirSync(lockPath, { mode: 0o700 });
  writeFileSync(path.join(lockPath, 'owner.json'), JSON.stringify({
    pid: 2_147_483_647,
    token: 'abandoned',
  }), {
    mode: 0o600,
  });

  saveCredential({ apiKey: 'yolfi_agent_after_recovery' });

  assert.equal(readStoredCredential().apiKey, 'yolfi_agent_after_recovery');
  assert.equal(readdirSync(getConfigDir()).includes('config.json.lock'), false);
});

test('an abandoned recovery slot is completed before acquiring a new lock', (t) => {
  useTemporaryConfig(t);
  const recoveryPath = `${getConfigPath()}.lock.recovery`;
  mkdirSync(recoveryPath, { mode: 0o700 });
  writeFileSync(path.join(recoveryPath, 'owner.json'), JSON.stringify({
    pid: 2_147_483_647,
    token: 'abandoned-recovery',
  }), {
    mode: 0o600,
  });

  saveCredential({ apiKey: 'yolfi_agent_after_recovery_slot' });

  assert.equal(readStoredCredential().apiKey, 'yolfi_agent_after_recovery_slot');
  assert.equal(readdirSync(getConfigDir()).includes('config.json.lock.recovery'), false);
});
