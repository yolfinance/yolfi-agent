import { YolfiClient, YolfiApiError } from './client.js';
import { verifyWebhookSignature } from './webhooks.js';

const PROTOCOL_VERSION = '2025-06-18';
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  '2025-06-18',
  '2025-03-26',
  '2024-11-05',
]);
const SERVER_NAME = 'yolfi-agent-kit';
const SERVER_TITLE = 'Yolfi Payments MCP';
const SERVER_VERSION = '0.1.3';
const WEBHOOK_ADAPTERS = ['NONE', 'STRIPE', 'LEMON_SQUEEZY', 'PADDLE', 'POLAR', 'GUMROAD', 'DODO'];

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: true,
};

function jsonSchema(properties, required = []) {
  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false,
  };
}

const tools = [
  {
    name: 'yolfi_auth_status',
    title: 'Check Yolfi Auth Status',
    description: 'Verify that YOLFI_API_KEY can authenticate and return the current Yolfi organization context before mutating payment settings.',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: jsonSchema({}),
  },
  {
    name: 'yolfi_organization_get',
    title: 'Get Yolfi Organization',
    description: 'Read the current Yolfi organization settings, including webhook and settlement configuration visible to this API key.',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: jsonSchema({}),
  },
  {
    name: 'yolfi_organization_update',
    title: 'Update Yolfi Organization',
    description: 'Update organization profile fields through the existing Yolfi organization endpoint. Do not invent merchant identity, support email, webhook URL, or settlement settings.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      name: { type: 'string', description: 'Merchant or project display name approved by the user.' },
      email: { type: 'string', description: 'Merchant support or account email approved by the user.' },
      webhookUrl: { type: 'string', description: 'HTTPS webhook endpoint in the target application. Ask the user if the backend URL is unknown.' },
      webhookAdapter: { type: 'string', enum: WEBHOOK_ADAPTERS, description: 'Webhook adapter output format. Use NONE unless the target app expects a compatible provider payload.' },
    }),
  },
  {
    name: 'yolfi_settlement_configure',
    title: 'Configure Yolfi Settlement Wallets',
    description: 'Configure settlement wallets after the user provides wallet addresses, networks, and enabled tokens. Never invent wallet addresses.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      settlementAccounts: {
        type: 'array',
        description: 'Settlement account objects accepted by the Yolfi organization endpoint. Example fields: id, address, tokens.',
        items: { type: 'object' },
      },
    }, ['settlementAccounts']),
  },
  {
    name: 'yolfi_webhooks_configure',
    title: 'Configure Yolfi Webhooks',
    description: 'Configure webhook delivery for the target app. The host must not invent backend URLs and must ensure the app verifies X-Yolfi-Signature.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      url: { type: 'string', description: 'HTTPS webhook URL in the target app, for example https://example.com/api/yolfi/webhook.' },
      adapter: { type: 'string', enum: WEBHOOK_ADAPTERS, description: 'Webhook adapter output format. Defaults to NONE if omitted.' },
    }, ['url']),
  },
  {
    name: 'yolfi_paylinks_create',
    title: 'Create Yolfi Paylink',
    description: 'Create a Yolfi payment link only after the user approves product name, amount, currency, and one-time or recurring payment type.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      name: { type: 'string', description: 'User-approved product, plan, donation, or access name shown on checkout.' },
      description: { type: 'string', description: 'Optional user-approved customer-facing description.' },
      price: { type: 'string', description: 'User-approved decimal price, represented as a string to avoid numeric rounding.' },
      currency: { type: 'string', description: 'Fiat or account currency code approved by the user, for example USD.' },
      type: { type: 'string', description: 'Payment link type approved by the user, for example ONE_TIME or RECURRING.' },
      recurringInterval: { type: 'string', description: 'Recurring interval when creating a recurring payment link.' },
      collectEmail: { type: 'boolean', description: 'Whether checkout should collect customer email.' },
      metadata: { type: 'object', description: 'Safe non-secret metadata such as source, productSlug, planId, or environment.' },
    }, ['name', 'price', 'currency', 'type']),
  },
  {
    name: 'yolfi_paylinks_list',
    title: 'List Yolfi Paylinks',
    description: 'List existing Yolfi paylinks before creating new ones so agents can avoid duplicates after retries or timeouts.',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: jsonSchema({
      page: { type: 'number', default: 1, description: 'Page number. Defaults to 1.' },
      rows: { type: 'number', default: 10, description: 'Rows per page. Defaults to 10.' },
    }),
  },
  {
    name: 'yolfi_paylinks_get',
    title: 'Get Yolfi Paylink',
    description: 'Get private paylink details by ID for verification, checkout wiring, or duplicate detection.',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: jsonSchema({ id: { type: 'string', description: 'Yolfi paylink ID returned by yolfi_paylinks_create or yolfi_paylinks_list.' } }, ['id']),
  },
  {
    name: 'yolfi_paylinks_disable',
    title: 'Disable Yolfi Paylink',
    description: 'Disable a paylink. This is destructive and must only run after explicit user confirmation.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      id: { type: 'string', description: 'Yolfi paylink ID to disable.' },
      confirm: { const: true, description: 'Must be true only after explicit user confirmation.' },
    }, ['id', 'confirm']),
  },
  {
    name: 'yolfi_payments_create',
    title: 'Create Yolfi Public Payment',
    description: 'Create a public payment invoice from an existing paylink for checkout integration, testing, or customer flow setup.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      paylinkId: { type: 'string', description: 'Yolfi paylink ID used to create the customer payment.' },
      network: { type: 'string', description: 'Blockchain network identifier supported by the Yolfi organization, for example ARB.' },
      symbol: { type: 'string', description: 'Payment token symbol supported on the selected network, for example USDC.' },
      customerEmail: { type: 'string', description: 'Optional customer email for checkout or receipts.' },
      metadata: { type: 'object', description: 'Safe non-secret metadata for the target app payment flow.' },
    }, ['paylinkId', 'network', 'symbol']),
  },
  {
    name: 'yolfi_payments_status',
    title: 'Get Yolfi Payment Status',
    description: 'Get public payment status by ID. Do not treat a frontend redirect as proof of payment.',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: jsonSchema({ id: { type: 'string', description: 'Yolfi payment ID returned by yolfi_payments_create.' } }, ['id']),
  },
  {
    name: 'yolfi_webhooks_verify',
    title: 'Verify Yolfi Webhook Signature',
    description: 'Verify an X-Yolfi-Signature HMAC over the raw JSON webhook payload before trusting payment events.',
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: jsonSchema({
      payload: { type: 'string', description: 'Raw webhook request body string, before JSON parsing.' },
      signature: { type: 'string', description: 'X-Yolfi-Signature header value.' },
      secret: { type: 'string', description: 'Optional explicit webhook secret. Defaults to YOLFI_WEBHOOK_SECRET or YOLFI_API_KEY.' },
    }, ['payload', 'signature']),
  },
];

const resources = [
  { uri: 'yolfi://docs/llms', name: 'Yolfi LLM Index', mimeType: 'text/markdown' },
  { uri: 'yolfi://docs/agent-quickstart', name: 'Agent Quickstart', mimeType: 'text/markdown' },
  { uri: 'yolfi://docs/webhooks', name: 'Webhook Setup', mimeType: 'text/markdown' },
  { uri: 'yolfi://docs/paylinks', name: 'Paylink API', mimeType: 'text/markdown' },
  { uri: 'yolfi://examples/codex', name: 'Codex Integration Prompt', mimeType: 'text/markdown' },
  { uri: 'yolfi://examples/claude-code', name: 'Claude Code Integration Prompt', mimeType: 'text/markdown' },
  { uri: 'yolfi://examples/cursor', name: 'Cursor Integration Prompt', mimeType: 'text/markdown' },
];

const prompts = [
  { name: 'integrate_yolfi_payments', description: 'Inspect an app and add Yolfi checkout plus webhook handling.' },
  { name: 'create_yolfi_paylink', description: 'Create a Yolfi paylink after collecting product and pricing decisions.' },
  { name: 'add_yolfi_webhook_handler', description: 'Add a webhook handler with X-Yolfi-Signature verification.' },
  { name: 'verify_yolfi_payment_flow', description: 'Verify checkout, public payment status, and webhook handling.' },
  { name: 'migrate_existing_stripe_webhook_to_yolfi_adapter', description: 'Reuse an existing Stripe-style webhook path with Yolfi adapter output.' },
];

const resourceText = {
  'yolfi://docs/llms': '# Yolfi for AI agents\nUse @yolfi/agent or the Yolfi MCP tools to register a workspace, create paylinks, configure webhooks, and verify payment status.',
  'yolfi://docs/agent-quickstart': '# Agent quickstart\n1. Check for YOLFI_API_KEY. 2. Register only if missing. 3. Ask for wallet, price, currency, and webhook URL. 4. Create paylink. 5. Store ids in env/config. 6. Verify payment status and webhook signature.',
  'yolfi://docs/webhooks': '# Webhooks\nYolfi signs the raw JSON payload with HMAC-SHA256 base64 in X-Yolfi-Signature. In v1 the secret is the organization API key.',
  'yolfi://docs/paylinks': '# Paylinks\nUse POST /api/private/paylinks/create with bearer API key. Do not create duplicate paylinks after timeout without listing existing paylinks first.',
  'yolfi://examples/codex': '# Codex\nUse npx -y @yolfi/agent help, inspect the target app, then use Yolfi tools to add checkout and webhook handling.',
  'yolfi://examples/claude-code': '# Claude Code\nUse the Yolfi MCP server and ask the user for wallet and pricing decisions before mutating the target app.',
  'yolfi://examples/cursor': '# Cursor\nUse @yolfi/agent examples and keep secrets in env files that are ignored by git.',
};

export function createMcpCapabilities() {
  return {
    serverNames: ['yolfi-api', 'yolfi-knowledge'],
    tools,
    resources,
    prompts,
  };
}

function textResult(summary, data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ success: true, summary, data }, null, 2),
      },
    ],
    structuredContent: { success: true, summary, data },
  };
}

function errorResult(error) {
  const data = error instanceof YolfiApiError
    ? error.normalized
    : { success: false, code: 'YOLFI_MCP_ERROR', message: error.message, raw: null };
  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

function normalizeArguments(args) {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    return {};
  }

  return args;
}

export async function callMcpTool(name, args = {}, options = {}) {
  const client = options.client || new YolfiClient(options);

  try {
    switch (name) {
      case 'yolfi_auth_status':
      case 'yolfi_organization_get':
        return textResult('Yolfi organization loaded', await client.authStatus());
      case 'yolfi_organization_update':
        return textResult('Yolfi organization updated', await client.updateOrganization(args));
      case 'yolfi_settlement_configure':
        return textResult('Yolfi settlement accounts configured', await client.configureSettlement(args.settlementAccounts));
      case 'yolfi_webhooks_configure':
        return textResult('Yolfi webhooks configured', await client.configureWebhooks(args));
      case 'yolfi_paylinks_create':
        return textResult('Yolfi paylink created', await client.createPaylink(args));
      case 'yolfi_paylinks_list':
        return textResult('Yolfi paylinks listed', await client.listPaylinks(args));
      case 'yolfi_paylinks_get':
        return textResult('Yolfi paylink loaded', await client.getPaylink(args.id));
      case 'yolfi_paylinks_disable':
        if (args.confirm !== true) {
          throw new Error('confirm=true is required to disable a paylink');
        }
        return textResult('Yolfi paylink disabled', await client.disablePaylink(args.id));
      case 'yolfi_payments_create':
        return textResult('Yolfi payment created', await client.createPayment(args));
      case 'yolfi_payments_status':
        return textResult('Yolfi payment status loaded', await client.paymentStatus(args.id));
      case 'yolfi_webhooks_verify': {
        const secret = args.secret || process.env.YOLFI_WEBHOOK_SECRET || process.env.YOLFI_API_KEY || '';
        const valid = verifyWebhookSignature(args.payload, args.signature, secret);
        return textResult('Yolfi webhook signature checked', { valid });
      }
      default:
        throw new Error(`Unknown Yolfi MCP tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

function encodeMessage(message) {
  const body = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`;
}

function parseJsonMessage(body) {
  return JSON.parse(body);
}

function readMessages(onMessage, onError) {
  let buffer = Buffer.alloc(0);
  process.stdin.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const marker = buffer.indexOf('\r\n\r\n');
      if (marker !== -1) {
        const header = buffer.subarray(0, marker).toString('utf8');
        const match = header.match(/Content-Length:\s*(\d+)/i);
        if (!match) {
          buffer = buffer.subarray(marker + 4);
          continue;
        }

        const length = Number(match[1]);
        const bodyStart = marker + 4;
        const bodyEnd = bodyStart + length;
        if (buffer.length < bodyEnd) {
          return;
        }

        const body = buffer.subarray(bodyStart, bodyEnd).toString('utf8');
        buffer = buffer.subarray(bodyEnd);
        try {
          onMessage(parseJsonMessage(body), { framed: true });
        } catch (error) {
          onError(error, { framed: true });
        }
        continue;
      }

      const newline = buffer.indexOf('\n');
      if (newline === -1) {
        return;
      }

      const line = buffer.subarray(0, newline).toString('utf8').trim();
      buffer = buffer.subarray(newline + 1);
      if (!line) {
        continue;
      }

      try {
        onMessage(parseJsonMessage(line), { framed: false });
      } catch (error) {
        onError(error, { framed: false });
      }
    }
  });
}

function negotiateProtocolVersion(requestedVersion) {
  if (SUPPORTED_PROTOCOL_VERSIONS.has(requestedVersion)) {
    return requestedVersion;
  }

  return PROTOCOL_VERSION;
}

async function handleMcpRequest(message) {
  const { id, method, params } = message;
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: negotiateProtocolVersion(params?.protocolVersion),
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          prompts: { listChanged: false },
        },
        serverInfo: {
          name: SERVER_NAME,
          title: SERVER_TITLE,
          version: SERVER_VERSION,
        },
        instructions:
          'Use Yolfi tools to inspect the workspace, ask the user for wallet and pricing decisions, create or reuse paylinks, configure verified webhooks, and confirm payments through status checks or signed webhook events.',
      },
    };
  }

  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools } };
  }

  if (method === 'tools/call') {
    const result = await callMcpTool(params?.name, normalizeArguments(params?.arguments));
    return { jsonrpc: '2.0', id, result };
  }

  if (method === 'resources/list') {
    return { jsonrpc: '2.0', id, result: { resources } };
  }

  if (method === 'resources/read') {
    const uri = params?.uri;
    return {
      jsonrpc: '2.0',
      id,
      result: {
        contents: [{ uri, mimeType: 'text/markdown', text: resourceText[uri] || '' }],
      },
    };
  }

  if (method === 'prompts/list') {
    return { jsonrpc: '2.0', id, result: { prompts } };
  }

  if (method === 'prompts/get') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: resourceText['yolfi://docs/agent-quickstart'],
            },
          },
        ],
      },
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

export function startMcpServer() {
  readMessages(async (message, meta) => {
    if (!Object.prototype.hasOwnProperty.call(message, 'id')) {
      return;
    }
    const response = await handleMcpRequest(message);
    process.stdout.write(meta.framed ? encodeMessage(response) : `${JSON.stringify(response)}\n`);
  }, (error, meta) => {
    const response = {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error', data: error.message },
    };
    process.stdout.write(meta.framed ? encodeMessage(response) : `${JSON.stringify(response)}\n`);
  });
}

export const mcp = {
  protocolVersion: PROTOCOL_VERSION,
  serverName: SERVER_NAME,
  serverTitle: SERVER_TITLE,
  serverVersion: SERVER_VERSION,
  tools,
  resources,
  prompts,
  outputSchema: OUTPUT_SCHEMA,
};
