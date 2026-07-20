import { DEFAULT_API_BASE_URL, YolfiApiError, normalizeYolfiError } from './client.js';
import {
  clearPendingSetup,
  isAgentCredential,
  readPendingSetup,
  saveCredential,
  savePendingSetup,
} from './config.js';

export async function setupAgent(options = {}) {
  const agent = getAgent(options);
  const response = await setupRequest('/agent/setup/start', { agent }, options);
  const setup = response.data || {};
  const setupAgentName = setup.agent || agent;

  if (!setup.checkinToken || !setup.loginUrl) {
    throw invalidSetupResponse('Yolfi setup start did not return checkinToken and loginUrl');
  }

  savePendingSetup({
    agent: setupAgentName,
    checkinToken: setup.checkinToken,
    loginUrl: setup.loginUrl,
    expiresAt: setup.expiresAt,
  });

  return {
    success: true,
    agent: setupAgentName,
    loginUrl: setup.loginUrl,
    expiresAt: setup.expiresAt,
    next: `Open the loginUrl, finish authentication, then run: npx -y @yolfi/agent checkin --agent ${setupAgentName}`,
  };
}

export async function checkinAgent(options = {}) {
  const agent = getAgent(options);
  const pendingSetup = options.checkinToken
    ? { agent, checkinToken: options.checkinToken }
    : readPendingSetup(agent);

  if (!pendingSetup?.checkinToken) {
    throw new YolfiApiError({
      success: false,
      code: 'SETUP_SESSION_MISSING',
      message: `Run yolfi setup --agent ${agent} before checkin.`,
      raw: null,
    });
  }

  const response = await setupRequest('/agent/setup/checkin', {
    checkinToken: pendingSetup.checkinToken,
  }, options);
  const result = response.data || {};

  if (result.status === 'connected') {
    if (!isAgentCredential(result.apiKey)) {
      throw invalidSetupResponse('Connected Yolfi setup did not return an agent credential');
    }
    saveCredential({ apiKey: result.apiKey });
    clearPendingSetup(agent);
    return {
      success: true,
      connected: true,
      status: 'connected',
      agent: result.agent || agent,
      keyPrefix: result.keyPrefix,
      message: 'Yolfi is connected and ready.',
    };
  }

  if (result.status === 'pending') {
    return {
      success: true,
      connected: false,
      status: 'pending',
      agent: result.agent || agent,
      loginUrl: pendingSetup.loginUrl,
      message: 'Finish authentication in the browser, then run checkin again.',
    };
  }

  if (result.status === 'redeemed') {
    clearPendingSetup(agent);
    return {
      success: true,
      connected: false,
      status: 'redeemed',
      agent: result.agent || agent,
      message: `This setup session was already used. Run yolfi setup --agent ${agent} again if this machine is not connected.`,
    };
  }

  if (result.status === 'failed') {
    clearPendingSetup(agent);
    return {
      success: true,
      connected: false,
      status: 'failed',
      agent: result.agent || agent,
      message: `Yolfi setup failed. Run yolfi setup --agent ${agent} to start a new session.`,
    };
  }

  return {
    success: true,
    connected: false,
    status: result.status || 'unknown',
    agent: result.agent || agent,
  };
}

function invalidSetupResponse(message) {
  return new YolfiApiError({
    success: false,
    code: 'INVALID_SETUP_RESPONSE',
    message,
    raw: null,
  });
}

export function getAgent(options = {}) {
  const value = String(options.agent || options.agentId || options._?.[0] || 'local-agent')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 40);

  return value || 'local-agent';
}

async function setupRequest(pathname, body, options) {
  const fetcher = options.fetcher || globalThis.fetch;
  if (!fetcher) {
    throw new Error('A fetch implementation is required. Use Node.js 18+ or pass fetcher.');
  }

  const baseUrl = options.apiBaseUrl || DEFAULT_API_BASE_URL;
  const response = await fetcher(`${String(baseUrl).replace(/\/+$/, '')}${pathname}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  const data = parseJson(text);

  if (!response.ok || data?.success === false) {
    throw new YolfiApiError(normalizeYolfiError(data, response));
  }

  return data;
}

function parseJson(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { success: false, code: 'INVALID_JSON_RESPONSE', message: 'Yolfi setup returned invalid JSON', raw: text };
  }
}
