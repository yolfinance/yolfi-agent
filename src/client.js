export const DEFAULT_API_BASE_URL = 'https://app.yolfi.com/api';
export const DEFAULT_PAY_BASE_URL = 'https://pay.yolfi.com';

export class YolfiApiError extends Error {
  constructor(normalized) {
    super(normalized.message);
    this.name = 'YolfiApiError';
    this.normalized = normalized;
  }
}

export function normalizeYolfiError(raw, response = {}) {
  return {
    success: false,
    code: raw?.code ?? raw?.error ?? (response.status ? `HTTP_${response.status}` : 'YOLFI_ERROR'),
    message: raw?.message ?? raw?.error_description ?? raw?.error ?? response.statusText ?? 'Yolfi request failed',
    details: raw?.details,
    raw,
  };
}

function joinUrl(baseUrl, path) {
  return `${String(baseUrl).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}

function requireFetch(fetcher) {
  const resolved = fetcher || globalThis.fetch;
  if (!resolved) {
    throw new Error('A fetch implementation is required. Use Node.js 18+ or pass fetcher.');
  }
  return resolved;
}

export class YolfiClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey ?? process.env.YOLFI_API_KEY ?? '';
    this.apiBaseUrl =
      options.apiBaseUrl ?? process.env.YOLFI_API_BASE_URL ?? DEFAULT_API_BASE_URL;
    this.payBaseUrl =
      options.payBaseUrl ?? process.env.YOLFI_PAY_BASE_URL ?? DEFAULT_PAY_BASE_URL;
    this.fetcher = requireFetch(options.fetcher);
  }

  checkoutUrl(paylinkId) {
    return joinUrl(this.payBaseUrl, paylinkId);
  }

  async request(path, options = {}) {
    const method = options.method ?? 'GET';
    const auth = options.auth ?? true;
    const headers = {
      Accept: 'application/json',
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    };

    if (auth) {
      if (!this.apiKey) {
        throw new YolfiApiError({
          success: false,
          code: 'YOLFI_API_KEY_MISSING',
          message: 'YOLFI_API_KEY is required for this command',
          details: undefined,
          raw: null,
        });
      }
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await this.fetcher(joinUrl(this.apiBaseUrl, path), {
      method,
      headers,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = { message: await response.text() };
    }

    if (!response.ok || payload?.success === false) {
      throw new YolfiApiError(normalizeYolfiError(payload, response));
    }

    return payload;
  }

  registerAgent(payload) {
    return this.request('/auth/agent/register', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  }

  authStatus() {
    return this.request('/private/organization/current');
  }

  updateOrganization(payload) {
    return this.request('/private/organization/current', {
      method: 'PUT',
      body: payload,
    });
  }

  configureSettlement(settlementAccounts) {
    return this.updateOrganization({ settlementAccounts });
  }

  configureWebhooks({ name = 'Webhook', url, adapter = 'NONE', enabled = true }) {
    return this.createWebhookEndpoint({ name, url, adapter, enabled });
  }

  listWebhookEndpoints() {
    return this.request('/private/organization/webhook-endpoints');
  }

  createWebhookEndpoint(payload) {
    return this.request('/private/organization/webhook-endpoints', {
      method: 'POST',
      body: payload,
    });
  }

  updateWebhookEndpoint(id, payload) {
    return this.request(`/private/organization/webhook-endpoints/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteWebhookEndpoint(id) {
    return this.request(`/private/organization/webhook-endpoints/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  rotateWebhookEndpointSecret(id) {
    return this.request(`/private/organization/webhook-endpoints/${encodeURIComponent(id)}/rotate-secret`, {
      method: 'POST',
    });
  }

  getApiKey() {
    return this.request('/private/organization/api-key');
  }

  createPaylink(payload) {
    return this.request('/private/paylinks/create', {
      method: 'POST',
      body: payload,
    });
  }

  listPaylinks({ page = 1, rows = 10 } = {}) {
    return this.request(`/private/paylinks?page=${encodeURIComponent(page)}&rows=${encodeURIComponent(rows)}`);
  }

  getPaylink(id) {
    return this.request(`/private/paylinks/${encodeURIComponent(id)}`);
  }

  editPaylink(payload) {
    return this.request('/private/paylinks/edit', {
      method: 'POST',
      body: payload,
    });
  }

  disablePaylink(id) {
    return this.request('/private/paylinks/disable', {
      method: 'POST',
      body: { id },
    });
  }

  getPublicPaylink(id) {
    return this.request(`/public/paylinks/${encodeURIComponent(id)}`, { auth: false });
  }

  createPayment(payload) {
    return this.request('/public/payments', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  }

  paymentStatus(id) {
    return this.request(`/public/payments/${encodeURIComponent(id)}`, { auth: false });
  }

  listTransactions({ page = 1, pageSize = 10, status = 'all', timeRange } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      status,
    });
    if (timeRange) {
      params.set('timeRange', timeRange);
    }

    return this.request(`/private/transactions?${params.toString()}`);
  }
}
