import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { readPendingRegistration, readStoredCredential } from '../src/config.js';
import { registerAgentAccount } from '../src/registration.js';

function useTemporaryConfig(t) {
  const previous = process.env.YOLFI_CONFIG_HOME;
  const configHome = mkdtempSync(path.join(os.tmpdir(), 'yolfi-registration-'));
  process.env.YOLFI_CONFIG_HOME = configHome;
  t.after(() => {
    if (previous === undefined) delete process.env.YOLFI_CONFIG_HOME;
    else process.env.YOLFI_CONFIG_HOME = previous;
    rmSync(configHome, { recursive: true, force: true });
  });
}

test('registration stores protected confirmation state and checkins on the repeated call', async (t) => {
  useTemporaryConfig(t);
  const keys = [];
  let checkins = 0;
  const apiKey = `yolfi_agent_${'a'.repeat(64)}`;
  const client = {
    async registerAgent(payload, options) {
      keys.push(options.idempotencyKey);
      assert.equal(payload.email, 'owner@example.com');
      return {
        success: true,
        data: {
          status: 'pending',
          email: payload.email,
          agent: 'codex',
          checkinToken: 'yolfi_checkin_pending-secret',
          expiresAt: '2026-07-20T12:00:00.000Z',
        },
      };
    },
    async checkinAgentRegistration(checkinToken) {
      checkins += 1;
      assert.equal(checkinToken, 'yolfi_checkin_pending-secret');
      if (checkins === 1) {
        return {
          success: true,
          data: { status: 'pending' },
        };
      }
      return {
        success: true,
        data: {
          status: 'connected',
          apiKey,
          keyPrefix: apiKey.slice(0, 24),
        },
      };
    },
  };
  const payload = {
    email: 'Owner@Example.com',
    agentName: 'Codex',
    projectName: 'Space Shop',
  };

  const pending = await registerAgentAccount(client, payload);
  const storedPending = readPendingRegistration('owner@example.com');

  assert.equal(pending.data.status, 'pending');
  assert.equal(pending.data.confirmationRequired, true);
  assert.match(pending.data.message, /confirmation link was sent/i);
  assert.equal(pending.data.checkinToken, undefined);
  assert.equal(storedPending.checkinToken, 'yolfi_checkin_pending-secret');
  assert.equal(readStoredCredential().apiKey, undefined);

  const stillPending = await registerAgentAccount(client, payload);

  assert.equal(stillPending.data.status, 'pending');
  assert.equal(stillPending.data.confirmationRequired, true);
  assert.ok(readPendingRegistration('owner@example.com'));
  assert.equal(readStoredCredential().apiKey, undefined);

  const result = await registerAgentAccount(client, payload);

  assert.equal(keys.length, 1);
  assert.equal(checkins, 2);
  assert.equal(readPendingRegistration('owner@example.com'), undefined);
  assert.equal(readStoredCredential().apiKey, apiKey);
  assert.equal(result.data.apiKey, undefined);
  assert.equal(result.data.connected, true);
});

test('registration reuses its idempotency key after a lost first response', async (t) => {
  useTemporaryConfig(t);
  const keys = [];
  let attempts = 0;
  const client = {
    async registerAgent(_payload, options) {
      attempts += 1;
      keys.push(options.idempotencyKey);
      if (attempts === 1) throw new Error('response lost');
      return {
        success: true,
        data: {
          status: 'authorized',
          checkinToken: 'yolfi_checkin_recovered-secret',
        },
      };
    },
    async checkinAgentRegistration(checkinToken) {
      assert.equal(checkinToken, 'yolfi_checkin_recovered-secret');
      return {
        success: true,
        data: { status: 'connected', apiKey: `yolfi_agent_${'b'.repeat(64)}` },
      };
    },
  };
  const payload = {
    email: 'owner@example.com',
    agentName: 'Codex',
    projectName: 'Space Shop',
  };

  await assert.rejects(registerAgentAccount(client, payload), /response lost/);
  const result = await registerAgentAccount(client, payload);

  assert.equal(keys[0], keys[1]);
  assert.equal(result.data.connected, true);
  assert.equal(readPendingRegistration('owner@example.com'), undefined);
});

test('failed registration checkin directs provisioned users to browser setup', async (t) => {
  useTemporaryConfig(t);
  const client = {
    async registerAgent() {
      return {
        success: true,
        data: {
          status: 'pending',
          checkinToken: 'yolfi_checkin_failed-secret',
        },
      };
    },
    async checkinAgentRegistration() {
      return { success: true, data: { status: 'failed' } };
    },
  };
  const payload = {
    email: 'owner@example.com',
    agentName: 'Codex',
    projectName: 'Space Shop',
  };

  await registerAgentAccount(client, payload);
  const failed = await registerAgentAccount(client, payload);

  assert.equal(failed.data.status, 'failed');
  assert.match(failed.data.message, /yolfi setup.*yolfi checkin/i);
  assert.equal(readPendingRegistration('owner@example.com'), undefined);
});
