import { createIdempotencyKey } from './client.js';
import {
  clearPendingRegistration,
  readPendingRegistration,
  savePendingRegistration,
  saveRegistrationCredential,
} from './config.js';

export async function registerAgentAccount(client, payload, options = {}) {
  const email = String(payload?.email || '').trim().toLowerCase();
  if (!email) {
    throw new Error('A user-confirmed email is required for Yolfi agent registration');
  }

  const normalizedPayload = { ...payload, email };
  const pending = readPendingRegistration(email);
  const idempotencyKey = options.idempotencyKey
    ? createIdempotencyKey(options.idempotencyKey)
    : pending?.idempotencyKey || createIdempotencyKey();

  if (pending?.idempotencyKey === idempotencyKey && pending.checkinToken) {
    return checkinPendingRegistration(client, email, pending, idempotencyKey);
  }

  savePendingRegistration({ email, idempotencyKey });
  const response = await client.registerAgent(normalizedPayload, { idempotencyKey });
  const data = response?.data || {};

  if (data.apiKey) {
    return connectRegistration(response, email, idempotencyKey);
  }

  if (data.checkinToken) {
    const nextPending = {
      email,
      idempotencyKey,
      checkinToken: data.checkinToken,
      expiresAt: data.expiresAt,
      agent: data.agent,
    };
    savePendingRegistration(nextPending);
    if (data.status === 'authorized') {
      return checkinPendingRegistration(client, email, nextPending, idempotencyKey);
    }
  }

  return publicRegistrationResult(response, email, idempotencyKey);
}

async function checkinPendingRegistration(client, email, pending, idempotencyKey) {
  const response = await client.checkinAgentRegistration(pending.checkinToken);
  if (response?.data?.apiKey) {
    return connectRegistration(response, email, idempotencyKey);
  }
  return publicRegistrationResult(response, email, idempotencyKey);
}

function connectRegistration(response, email, idempotencyKey) {
  const connected = saveRegistrationCredential(response);
  clearPendingRegistration(email, idempotencyKey);
  return connected;
}

function publicRegistrationResult(response, email, idempotencyKey) {
  const data = response?.data || {};
  const { apiKey: _hiddenCredential, checkinToken: _hiddenCheckinToken, ...publicData } = data;
  const status = publicData.status || 'pending';
  const terminal = status === 'failed' || status === 'redeemed' || status === 'already_delivered';

  if (terminal) {
    clearPendingRegistration(email, idempotencyKey);
  }

  return {
    ...response,
    data: {
      ...publicData,
      email: publicData.email || email,
      connected: false,
      confirmationRequired: status === 'pending',
      message: registrationMessage(status, email),
    },
  };
}

function registrationMessage(status, email) {
  if (status === 'pending') {
    return `A confirmation link was sent to ${email}. Open it, then run this registration command or tool again.`;
  }
  if (status === 'authorized') {
    return 'Email confirmation completed. Run this registration command or tool again to finish connecting.';
  }
  if (status === 'redeemed' || status === 'already_delivered') {
    return 'This one-time credential was already delivered. Run yolfi auth:status to verify the stored connection, or start browser setup again.';
  }
  if (status === 'failed') {
    return 'Registration expired or failed. Use yolfi setup and yolfi checkin to connect the account through browser authorization.';
  }
  return 'Registration is not connected yet. Run this registration command or tool again to check its status.';
}
