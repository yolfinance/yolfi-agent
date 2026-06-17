import { YolfiClient, YolfiApiError } from './client.js';
import { verifyWebhookSignature } from './webhooks.js';

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
    description: 'Check the Yolfi workspace linked to YOLFI_API_KEY.',
    inputSchema: jsonSchema({}),
  },
  {
    name: 'yolfi_organization_get',
    description: 'Get the current Yolfi organization settings.',
    inputSchema: jsonSchema({}),
  },
  {
    name: 'yolfi_organization_update',
    description: 'Update organization fields through the existing organization endpoint.',
    inputSchema: jsonSchema({
      name: { type: 'string' },
      email: { type: 'string' },
      webhookUrl: { type: 'string' },
      webhookAdapter: { type: 'string', enum: ['NONE', 'STRIPE', 'LEMON_SQUEEZY', 'PADDLE', 'POLAR', 'GUMROAD', 'DODO'] },
    }),
  },
  {
    name: 'yolfi_settlement_configure',
    description: 'Configure settlement wallets. The host must ask the user for wallet addresses and currencies first.',
    inputSchema: jsonSchema({
      settlementAccounts: {
        type: 'array',
        items: { type: 'object' },
      },
    }, ['settlementAccounts']),
  },
  {
    name: 'yolfi_webhooks_configure',
    description: 'Configure the webhook URL and adapter. The host must not invent backend URLs.',
    inputSchema: jsonSchema({
      url: { type: 'string' },
      adapter: { type: 'string', enum: ['NONE', 'STRIPE', 'LEMON_SQUEEZY', 'PADDLE', 'POLAR', 'GUMROAD', 'DODO'] },
    }, ['url']),
  },
  {
    name: 'yolfi_paylinks_create',
    description: 'Create a payment link. The host must ask the user for product, amount, currency, and one-time vs recurring choices.',
    inputSchema: jsonSchema({
      name: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'string' },
      currency: { type: 'string' },
      type: { type: 'string' },
      recurringInterval: { type: 'string' },
      metadata: { type: 'object' },
    }, ['name', 'price']),
  },
  {
    name: 'yolfi_paylinks_list',
    description: 'List existing Yolfi paylinks before creating duplicates.',
    inputSchema: jsonSchema({
      page: { type: 'number', default: 1 },
      rows: { type: 'number', default: 10 },
    }),
  },
  {
    name: 'yolfi_paylinks_get',
    description: 'Get a private paylink by id.',
    inputSchema: jsonSchema({ id: { type: 'string' } }, ['id']),
  },
  {
    name: 'yolfi_paylinks_disable',
    description: 'Disable a paylink. This is destructive and requires explicit user confirmation.',
    inputSchema: jsonSchema({
      id: { type: 'string' },
      confirm: { const: true },
    }, ['id', 'confirm']),
  },
  {
    name: 'yolfi_payments_create',
    description: 'Create a public payment invoice from a paylink for checkout testing or customer flow setup.',
    inputSchema: jsonSchema({
      paylinkId: { type: 'string' },
      network: { type: 'string' },
      symbol: { type: 'string' },
      customerEmail: { type: 'string' },
      metadata: { type: 'object' },
    }, ['paylinkId', 'network', 'symbol']),
  },
  {
    name: 'yolfi_payments_status',
    description: 'Get public payment status. Do not treat redirect as proof of payment.',
    inputSchema: jsonSchema({ id: { type: 'string' } }, ['id']),
  },
  {
    name: 'yolfi_webhooks_verify',
    description: 'Verify an X-Yolfi-Signature HMAC over the raw JSON payload.',
    inputSchema: jsonSchema({
      payload: { type: 'string' },
      signature: { type: 'string' },
      secret: { type: 'string' },
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

function readMessages(onMessage) {
  let buffer = Buffer.alloc(0);
  process.stdin.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const marker = buffer.indexOf('\r\n\r\n');
      if (marker === -1) {
        return;
      }

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
      onMessage(JSON.parse(body));
    }
  });
}

async function handleMcpRequest(message) {
  const { id, method, params } = message;
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: params?.protocolVersion || '2025-06-18',
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        serverInfo: {
          name: 'Yolfi Payments MCP',
          version: '0.1.1',
        },
      },
    };
  }

  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools } };
  }

  if (method === 'tools/call') {
    const result = await callMcpTool(params?.name, params?.arguments || {});
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
  readMessages(async (message) => {
    if (!message.id) {
      return;
    }
    const response = await handleMcpRequest(message);
    process.stdout.write(encodeMessage(response));
  });
}
