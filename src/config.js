import { randomUUID } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CONFIG_FILENAME = 'config.json';
const CONFIG_LOCK_OWNER_FILENAME = 'owner.json';
const CONFIG_LOCK_TIMEOUT_MS = 5_000;
const CONFIG_LOCK_RETRY_MS = 10;
const CONFIG_LOCK_SLEEP = new Int32Array(new SharedArrayBuffer(4));

export function getConfigDir() {
  return process.env.YOLFI_CONFIG_HOME || path.join(os.homedir(), '.yolfi');
}

export function getConfigPath() {
  return path.join(getConfigDir(), CONFIG_FILENAME);
}

export function readConfig() {
  const filepath = getConfigPath();
  if (!existsSync(filepath)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(filepath, 'utf8'));
  } catch {
    return {};
  }
}

export function readStoredCredential() {
  const config = readConfig();
  return { apiKey: config.apiKey };
}

export function saveCredential({ apiKey }) {
  updateConfig(config => ({
    ...config,
    apiKey,
    updatedAt: new Date().toISOString(),
  }));
}

export function isAgentCredential(value) {
  return typeof value === 'string' && /^yolfi_agent_[a-f0-9]{64}$/.test(value);
}

export function saveRegistrationCredential(response) {
  const apiKey = response?.data?.apiKey;
  if (!isAgentCredential(apiKey)) {
    throw new Error('Yolfi agent registration did not return a valid credential');
  }

  saveCredential({ apiKey });
  const { apiKey: _hiddenCredential, ...publicData } = response.data;
  return {
    ...response,
    data: {
      ...publicData,
      connected: true,
      keyPrefix: publicData.keyPrefix || apiKey.slice(0, 24),
    },
  };
}

export function savePendingRegistration({ email, idempotencyKey, checkinToken, expiresAt, agent }) {
  updateConfig((config) => {
    const previous = config.registration?.[email];
    const current = previous?.idempotencyKey === idempotencyKey ? previous : {};
    const now = new Date().toISOString();
    return {
      ...config,
      registration: {
        ...(config.registration || {}),
        [email]: {
          ...current,
          email,
          idempotencyKey,
          ...(checkinToken ? { checkinToken } : {}),
          ...(expiresAt ? { expiresAt } : {}),
          ...(agent ? { agent } : {}),
          createdAt: current.createdAt || now,
          updatedAt: now,
        },
      },
      updatedAt: now,
    };
  });
}

export function readPendingRegistration(email) {
  return readConfig().registration?.[email];
}

export function clearPendingRegistration(email, idempotencyKey) {
  updateConfig((config) => {
    const pending = config.registration?.[email];
    if (!pending || pending.idempotencyKey !== idempotencyKey) {
      return undefined;
    }

    const registration = { ...config.registration };
    delete registration[email];
    return {
      ...config,
      registration,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function savePendingSetup({ agent, checkinToken, loginUrl, expiresAt }) {
  updateConfig(config => ({
    ...config,
    setup: {
      ...(config.setup || {}),
      [agent]: {
        agent,
        checkinToken,
        loginUrl,
        expiresAt,
        createdAt: new Date().toISOString(),
      },
    },
    updatedAt: new Date().toISOString(),
  }));
}

export function readPendingSetup(agent) {
  return readConfig().setup?.[agent];
}

export function clearPendingSetup(agent) {
  updateConfig((config) => {
    if (!config.setup?.[agent]) {
      return undefined;
    }

    const setup = { ...config.setup };
    delete setup[agent];
    return {
      ...config,
      setup,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function saveWebhookSigningSecret(endpointId, signingSecret) {
  const id = String(endpointId || '').trim();
  if (!id) {
    throw new Error('A webhook endpoint id is required to store its signing secret');
  }
  if (typeof signingSecret !== 'string' || !signingSecret.trim()) {
    throw new Error('Yolfi did not return a valid webhook signing secret');
  }

  updateConfig(config => ({
    ...config,
    webhookSecrets: {
      ...(config.webhookSecrets || {}),
      [id]: {
        signingSecret,
        updatedAt: new Date().toISOString(),
      },
    },
    updatedAt: new Date().toISOString(),
  }));
}

export function readWebhookSigningSecret(endpointId) {
  const id = String(endpointId || '').trim();
  return id ? readConfig().webhookSecrets?.[id]?.signingSecret : undefined;
}

export function clearWebhookSigningSecret(endpointId) {
  const id = String(endpointId || '').trim();
  updateConfig((config) => {
    if (!id || !config.webhookSecrets?.[id]) {
      return undefined;
    }

    const webhookSecrets = { ...config.webhookSecrets };
    delete webhookSecrets[id];
    return {
      ...config,
      webhookSecrets,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function storeWebhookSigningSecret(response, endpointId) {
  const data = response?.data || {};
  const resolvedEndpointId = data.id || endpointId;
  saveWebhookSigningSecret(resolvedEndpointId, data.signingSecret);

  const { signingSecret: _hiddenSigningSecret, ...publicData } = data;
  return {
    ...response,
    data: {
      ...publicData,
      id: publicData.id || resolvedEndpointId,
      signingSecretStored: true,
    },
  };
}

function writeConfig(config) {
  const dir = getConfigDir();
  const filepath = getConfigPath();
  const temporaryFilepath = `${filepath}.${process.pid}.${randomUUID()}.tmp`;

  mkdirSync(dir, { recursive: true, mode: 0o700 });
  try {
    chmodSync(dir, 0o700);
  } catch {
    // Best effort only; Windows and some filesystems do not support chmod.
  }

  try {
    writeFileSync(temporaryFilepath, `${JSON.stringify(config, null, 2)}\n`, {
      mode: 0o600,
      flag: 'wx',
    });
    try {
      chmodSync(temporaryFilepath, 0o600);
    } catch {
      // Best effort only; Windows and some filesystems do not support chmod.
    }
    renameSync(temporaryFilepath, filepath);
  } finally {
    if (existsSync(temporaryFilepath)) {
      try {
        unlinkSync(temporaryFilepath);
      } catch {
        // Preserve the original write error if cleanup is unavailable.
      }
    }
  }

  try {
    chmodSync(filepath, 0o600);
  } catch {
    // Best effort only; Windows and some filesystems do not support chmod.
  }
}

function updateConfig(updater) {
  const releaseLock = acquireConfigLock();
  try {
    const nextConfig = updater(readConfig());
    if (nextConfig) {
      writeConfig(nextConfig);
    }
  } finally {
    releaseLock();
  }
}

function acquireConfigLock() {
  const dir = getConfigDir();
  const lockPath = `${getConfigPath()}.lock`;
  const recoveryPath = `${lockPath}.recovery`;
  const deadline = Date.now() + CONFIG_LOCK_TIMEOUT_MS;
  mkdirSync(dir, { recursive: true, mode: 0o700 });

  while (true) {
    if (recoveryBlocksAcquisition(recoveryPath)) {
      waitForConfigLock(deadline, lockPath);
      continue;
    }

    const owner = { pid: process.pid, token: randomUUID() };
    const pendingPath = `${lockPath}.${owner.token}.pending`;
    try {
      mkdirSync(pendingPath, { mode: 0o700 });
      writeFileSync(
        path.join(pendingPath, CONFIG_LOCK_OWNER_FILENAME),
        JSON.stringify(owner),
        { mode: 0o600, flag: 'wx' },
      );
      renameSync(pendingPath, lockPath);
      return () => {
        try {
          if (isSameLockOwner(readLockOwner(lockPath), owner)) {
            rmSync(lockPath, { recursive: true, force: true });
          }
        } catch {
          // The lock may already be absent after process shutdown recovery.
        }
      };
    } catch (error) {
      rmSync(pendingPath, { recursive: true, force: true });
      if (!['EEXIST', 'ENOTEMPTY', 'EACCES', 'EPERM'].includes(error?.code)) {
        throw error;
      }

      recoverAbandonedLock(lockPath, recoveryPath);
      waitForConfigLock(deadline, lockPath);
    }
  }
}

function recoverAbandonedLock(lockPath, recoveryPath) {
  const owner = readLockOwner(lockPath);
  if (!owner || isProcessRunning(owner.pid)) {
    return;
  }

  try {
    renameSync(lockPath, recoveryPath);
  } catch (error) {
    if (!['ENOENT', 'EEXIST', 'ENOTEMPTY', 'EACCES', 'EPERM'].includes(error?.code)) {
      throw error;
    }
    return;
  }

  const recoveredOwner = readLockOwner(recoveryPath);
  if (isSameLockOwner(recoveredOwner, owner) && !isProcessRunning(owner.pid)) {
    rmSync(recoveryPath, { recursive: true, force: true });
  }
}

function readLockOwner(lockPath) {
  try {
    const owner = JSON.parse(
      readFileSync(path.join(lockPath, CONFIG_LOCK_OWNER_FILENAME), 'utf8'),
    );
    return Number.isInteger(owner.pid) && typeof owner.token === 'string' ? owner : undefined;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return undefined;
    }
    return undefined;
  }
}

function recoveryBlocksAcquisition(recoveryPath) {
  if (!existsSync(recoveryPath)) {
    return false;
  }

  const owner = readLockOwner(recoveryPath);
  if (!owner || isProcessRunning(owner.pid)) {
    return true;
  }

  rmSync(recoveryPath, { recursive: true, force: true });
  return false;
}

function isSameLockOwner(left, right) {
  return left?.pid === right?.pid && left?.token === right?.token;
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code !== 'ESRCH';
  }
}

function waitForConfigLock(deadline, lockPath) {
  if (Date.now() >= deadline) {
    throw new Error(`Timed out waiting for the Yolfi config lock at ${lockPath}`);
  }
  Atomics.wait(CONFIG_LOCK_SLEEP, 0, 0, CONFIG_LOCK_RETRY_MS);
}
