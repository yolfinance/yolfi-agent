import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { readPendingSetup, readStoredCredential, saveCredential } from '../src/config.js';
import { checkinAgent, getAgent, setupAgent } from '../src/setup.js';

function useTemporaryConfig(t) {
  const previous = process.env.YOLFI_CONFIG_HOME;
  const configHome = mkdtempSync(path.join(os.tmpdir(), 'yolfi-setup-'));
  process.env.YOLFI_CONFIG_HOME = configHome;
  t.after(() => {
    if (previous === undefined) delete process.env.YOLFI_CONFIG_HOME;
    else process.env.YOLFI_CONFIG_HOME = previous;
    rmSync(configHome, { recursive: true, force: true });
  });
}

function textResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    async text() {
      return JSON.stringify(body);
    },
  };
}

test('setup starts at the production public endpoint and persists pending check-in state', async (t) => {
  useTemporaryConfig(t);
  const calls = [];
  const result = await setupAgent({
    agent: 'Codex Desktop!',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return textResponse({
        success: true,
        data: {
          agent: 'codexdesktop',
          checkinToken: 'pending-secret',
          loginUrl: 'https://app.yolfi.com/agent/setup/session',
          expiresAt: '2026-07-19T10:00:00.000Z',
        },
      });
    },
  });

  assert.equal(calls[0].url, 'https://app.yolfi.com/api/agent/setup/start');
  assert.deepEqual(JSON.parse(calls[0].options.body), { agent: 'codexdesktop' });
  assert.equal(result.loginUrl, 'https://app.yolfi.com/agent/setup/session');
  assert.equal(result.checkinToken, undefined);
  assert.equal(readPendingSetup('codexdesktop').checkinToken, 'pending-secret');
});

test('connected check-in stores the credential without returning it and clears pending state', async (t) => {
  useTemporaryConfig(t);
  const apiKey = `yolfi_agent_${'a'.repeat(64)}`;
  await setupAgent({
    agent: 'codex',
    fetcher: async () => textResponse({
      success: true,
      data: {
        agent: 'codex',
        checkinToken: 'pending-secret',
        loginUrl: 'https://app.yolfi.com/login',
      },
    }),
  });

  const calls = [];
  const result = await checkinAgent({
    agent: 'codex',
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return textResponse({
        success: true,
        data: {
          status: 'connected',
          agent: 'codex',
          apiKey,
          keyPrefix: 'yolfi_agent_conn',
        },
      });
    },
  });

  assert.equal(calls[0].url, 'https://app.yolfi.com/api/agent/setup/checkin');
  assert.deepEqual(JSON.parse(calls[0].options.body), { checkinToken: 'pending-secret' });
  assert.equal(result.connected, true);
  assert.equal(result.apiKey, undefined);
  assert.equal(readStoredCredential().apiKey, apiKey);
  assert.equal(readPendingSetup('codex'), undefined);
});

test('pending check-in preserves the browser URL and missing setup is a typed error', async (t) => {
  useTemporaryConfig(t);
  await setupAgent({
    agent: 'claude-code',
    fetcher: async () => textResponse({
      success: true,
      data: {
        agent: 'claude-code',
        checkinToken: 'pending-secret',
        loginUrl: 'https://app.yolfi.com/login',
      },
    }),
  });

  const pending = await checkinAgent({
    agent: 'claude-code',
    fetcher: async () => textResponse({ success: true, data: { status: 'pending' } }),
  });
  assert.equal(pending.status, 'pending');
  assert.equal(pending.loginUrl, 'https://app.yolfi.com/login');

  await assert.rejects(
    checkinAgent({ agent: 'cursor' }),
    error => error.normalized?.code === 'SETUP_SESSION_MISSING',
  );
});

test('check-in preserves lowercase redeemed and failed status contracts', async (t) => {
  useTemporaryConfig(t);
  await setupAgent({
    agent: 'cursor',
    fetcher: async () => textResponse({
      success: true,
      data: {
        agent: 'cursor',
        checkinToken: 'redeemed-secret',
        loginUrl: 'https://app.yolfi.com/login',
      },
    }),
  });
  const redeemed = await checkinAgent({
    agent: 'cursor',
    fetcher: async () => textResponse({ success: true, data: { status: 'redeemed' } }),
  });
  assert.equal(redeemed.status, 'redeemed');
  assert.equal(readPendingSetup('cursor'), undefined);

  await setupAgent({
    agent: 'cursor',
    fetcher: async () => textResponse({
      success: true,
      data: {
        agent: 'cursor',
        checkinToken: 'failed-secret',
        loginUrl: 'https://app.yolfi.com/login',
      },
    }),
  });
  const failed = await checkinAgent({
    agent: 'cursor',
    fetcher: async () => textResponse({ success: true, data: { status: 'failed' } }),
  });
  assert.equal(failed.status, 'failed');
  assert.equal(failed.connected, false);
  assert.equal(readPendingSetup('cursor'), undefined);
});

test('agent slugs are normalized and bounded', () => {
  assert.equal(getAgent({ agentId: 'Claude Code!' }), 'claudecode');
  assert.equal(getAgent({ agent: '***' }), 'local-agent');
  assert.equal(getAgent({ agent: 'A'.repeat(80) }).length, 40);
});

test('setup reports invalid JSON responses as a normalized Yolfi error', async (t) => {
  useTemporaryConfig(t);
  await assert.rejects(
    setupAgent({
      agent: 'codex',
      fetcher: async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        async text() {
          return '<html>not json</html>';
        },
      }),
    }),
    error => error.normalized?.code === 'INVALID_JSON_RESPONSE',
  );
});

test('setup rejects successful responses that omit authorization state', async (t) => {
  useTemporaryConfig(t);
  await assert.rejects(
    setupAgent({
      agent: 'codex',
      fetcher: async () => textResponse({ success: true, data: { agent: 'codex' } }),
    }),
    error => error.normalized?.code === 'INVALID_SETUP_RESPONSE',
  );
});

test('connected check-in rejects an invalid credential without replacing stored state', async (t) => {
  useTemporaryConfig(t);
  saveCredential({ apiKey: 'yolfi_agent_existing' });
  await setupAgent({
    agent: 'codex',
    fetcher: async () => textResponse({
      success: true,
      data: {
        agent: 'codex',
        checkinToken: 'pending-secret',
        loginUrl: 'https://app.yolfi.com/login',
      },
    }),
  });

  await assert.rejects(
    checkinAgent({
      agent: 'codex',
      fetcher: async () => textResponse({
        success: true,
        data: { status: 'connected', apiKey: 'organization-key' },
      }),
    }),
    error => error.normalized?.code === 'INVALID_SETUP_RESPONSE',
  );

  assert.equal(readStoredCredential().apiKey, 'yolfi_agent_existing');
  assert.equal(readPendingSetup('codex').checkinToken, 'pending-secret');
});
