import { YolfiClient, YolfiApiError } from './client.js';
import { checkinAgent, setupAgent } from './setup.js';
import { registerAgentAccount } from './registration.js';
import { verifyWebhookSignature } from './webhooks.js';
import {
  clearWebhookSigningSecret,
  readWebhookSigningSecret,
  storeWebhookSigningSecret,
} from './config.js';

const PROTOCOL_VERSION = '2025-06-18';
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  '2025-06-18',
  '2025-03-26',
  '2024-11-05',
]);
const SERVER_NAME = 'yolfi-agent-kit';
const SERVER_TITLE = 'Yolfi Payments MCP';
const SERVER_VERSION = '0.2.0';
const WEBHOOK_ADAPTERS = ['NONE', 'STRIPE', 'LEMON_SQUEEZY'];
const PAYLINK_TYPES = ['ONE_TIME', 'RECURRING'];
const PAYLINK_CURRENCIES = ['USD', 'EUR', 'CNY'];
const RECURRING_INTERVALS = ['WEEK', 'BIWEEK', 'TWO_DAYS', 'MONTH', 'BIMONTH', 'QUARTER', 'BIANNUAL', 'YEARLY'];
const METADATA_FILTERS_SCHEMA = {
  type: 'object',
  description: 'Optional flat key/value metadata filters. A delivery must match every configured string value.',
  maxProperties: 10,
  propertyNames: { maxLength: 100 },
  additionalProperties: { type: 'string', maxLength: 255 },
};

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
    name: 'yolfi_agent_setup_start',
    title: 'Start Yolfi Agent Setup',
    description: 'Start the preferred browser-based Yolfi authorization flow. Returns a login URL and stores only a short-lived check-in token in the protected local Yolfi config.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      agent: { type: 'string', description: 'Stable lowercase slug for the MCP host, for example codex, claude-code, cursor, or local-agent.' },
      agentId: { type: 'string', description: 'Compatibility alias for agent. Use agent for new integrations.' },
    }),
  },
  {
    name: 'yolfi_agent_checkin',
    title: 'Check In Yolfi Agent Setup',
    description: 'Check whether browser authorization finished. On success, securely stores the returned yolfi_agent_* credential for later local SDK, CLI, and MCP calls.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      agent: { type: 'string', description: 'Stable lowercase slug used for yolfi_agent_setup_start.' },
      agentId: { type: 'string', description: 'Compatibility alias for agent. Use agent for new integrations.' },
    }),
  },
  {
    name: 'yolfi_agent_register',
    title: 'Create Yolfi Account For User',
    description: 'Start signup for a new Yolfi user from a user-confirmed email. The first call sends a confirmation link and stores protected check-in state; call the same tool again after confirmation to store the one-time credential without exposing it.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      email: { type: 'string', format: 'email', description: 'New Yolfi account email explicitly confirmed by the user. Existing Yolfi account emails are rejected and must use OAuth or browser setup.' },
      agentName: { type: 'string', description: 'Name of the coding agent or MCP host, for example Codex, Claude Code, Cursor, or OpenClaw.' },
      projectName: { type: 'string', description: 'User-approved product or project name for the Yolfi workspace.' },
      projectUrl: { type: 'string', description: 'Optional public or local URL of the target product, if known.' },
      integrationIntent: { type: 'string', default: 'accept_payments', description: 'User-approved reason for the integration. Defaults to accept_payments when omitted.' },
      language: { type: 'string', description: 'Optional preferred language code for agent-facing responses.' },
      ref: { type: 'string', description: 'Optional source tag such as mcp, glama, npm, docs, codex, claude-code, or cursor.' },
      metadata: { type: 'object', description: 'Optional safe non-secret metadata. Do not include API keys, wallet private keys, tokens, or personal secrets.' },
      idempotencyKey: { type: 'string', minLength: 16, maxLength: 200, description: 'Optional retry key. Reuse the same value when calling this tool after email confirmation; a UUID is generated and persisted when omitted.' },
    }, ['email', 'agentName', 'projectName']),
  },
  {
    name: 'yolfi_auth_status',
    title: 'Check Yolfi Auth Status',
    description: 'Verify the active OAuth, local agent, or API-key credential and return the current Yolfi organization context before mutating payment settings.',
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
    description: 'Update organization profile fields through the existing Yolfi organization endpoint. Do not invent merchant identity, support email, or settlement settings.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: jsonSchema({
      name: { type: 'string', description: 'Merchant or project display name approved by the user.' },
      email: { type: 'string', description: 'Merchant support or account email approved by the user.' },
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
      name: { type: 'string', description: 'Endpoint display name, for example Merchant analytics.' },
      url: { type: 'string', description: 'HTTPS webhook URL in the target app, for example https://example.com/api/yolfi/webhook.' },
      adapter: { type: 'string', enum: WEBHOOK_ADAPTERS, description: 'Webhook adapter output format. Defaults to NONE if omitted.' },
      metadataFilters: METADATA_FILTERS_SCHEMA,
    }, ['url']),
  },
  {
    name: 'yolfi_webhooks_list',
    title: 'List Yolfi Webhook Endpoints',
    description: 'List all independent webhook endpoints configured for the current organization.',
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: jsonSchema({}),
  },
  {
    name: 'yolfi_webhooks_update',
    title: 'Update Yolfi Webhook Endpoint',
    description: 'Update the name, URL, adapter, or enabled state of one independent Yolfi webhook endpoint.',
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    inputSchema: jsonSchema({
      id: { type: 'string', description: 'Webhook endpoint id.' },
      name: { type: 'string', description: 'Endpoint display name.' },
      url: { type: 'string', description: 'HTTPS webhook URL.' },
      adapter: { type: 'string', enum: WEBHOOK_ADAPTERS, description: 'Webhook adapter output format.' },
      enabled: { type: 'boolean', description: 'Whether this endpoint receives new deliveries.' },
      metadataFilters: METADATA_FILTERS_SCHEMA,
    }, ['id']),
  },
  {
    name: 'yolfi_webhooks_rotate_secret',
    title: 'Rotate Yolfi Webhook Signing Secret',
    description: 'Rotate an endpoint-specific webhook signing secret and store it in the protected local Yolfi config without returning the plaintext secret.',
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    inputSchema: jsonSchema({
      id: { type: 'string', description: 'Webhook endpoint id.' },
      confirm: { const: true, description: 'Must be true only after explicit user confirmation.' },
    }, ['id', 'confirm']),
  },
  {
    name: 'yolfi_webhooks_delete',
    title: 'Delete Yolfi Webhook Endpoint',
    description: 'Delete an unused webhook endpoint or disable it when existing delivery history must be retained.',
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    inputSchema: jsonSchema({
      id: { type: 'string', description: 'Webhook endpoint id.' },
      confirm: { const: true, description: 'Must be true only after explicit user confirmation.' },
    }, ['id', 'confirm']),
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
      imageUrl: { type: 'string', description: 'Optional public product image URL shown on checkout.' },
      currency: { type: 'string', enum: PAYLINK_CURRENCIES, description: 'Account currency code. Supported values are USD, EUR, and CNY.' },
      type: { type: 'string', enum: PAYLINK_TYPES, description: 'Payment link type: ONE_TIME or RECURRING.' },
      recurringInterval: { type: 'string', enum: RECURRING_INTERVALS, description: 'Recurring billing interval when type is RECURRING.' },
      collectEmail: { type: 'boolean', description: 'Whether checkout should collect customer email.' },
      collectName: { type: 'boolean', description: 'Whether checkout should collect the customer name.' },
      collectDateOfBirth: { type: 'boolean', description: 'Whether checkout should collect the customer date of birth.' },
      collectAddress: { type: 'boolean', description: 'Whether checkout should collect the customer address.' },
      collectPhoneNumber: { type: 'boolean', description: 'Whether checkout should collect the customer phone number.' },
      metadata: { type: 'object', description: 'Safe non-secret metadata such as source, productSlug, planId, or environment.' },
    }, ['name', 'price']),
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
      customerEmail: { type: 'string', description: 'Customer email required for checkout and payment receipts.' },
      clientReferenceId: { type: 'string', description: 'Optional merchant reference for the customer or order; returned as customer.clientReferenceId in webhook payloads.' },
      customerName: { type: 'string', description: 'Optional customer name.' },
      customerPhone: { type: 'string', description: 'Optional customer phone number.' },
      customerDateOfBirth: { type: 'string', description: 'Optional customer date of birth.' },
      customerAddress: { type: 'string', description: 'Optional customer address.' },
      subscriptionId: { type: 'string', description: 'Optional existing subscription ID to associate the payment with.' },
      language: { type: 'string', description: 'Optional checkout language code supported by Yolfi.' },
      metadata: { type: 'object', description: 'Safe non-secret metadata for the target app payment flow.' },
    }, ['paylinkId', 'network', 'symbol', 'customerEmail']),
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
      endpointId: { type: 'string', description: 'Webhook endpoint id whose signing secret was stored locally during create or rotate. YOLFI_WEBHOOK_SECRET takes precedence when set.' },
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
  'yolfi://docs/llms': '# Yolfi for AI agents\nUse @yolfi/agent or the local Yolfi MCP tools to authorize an existing account or create a new one, then configure payment operations. Existing accounts use yolfi_agent_setup_start followed by yolfi_agent_checkin. New users confirm an email and project name for yolfi_agent_register, open the emailed confirmation link, then call the same tool again. Explicit YOLFI_API_KEY still takes precedence for CI and secret-manager environments.',
  'yolfi://docs/agent-quickstart': '# Agent quickstart\nFor an existing account, call yolfi_agent_setup_start, let the user complete browser authorization, then call yolfi_agent_checkin. For a new user, ask them to confirm their email and project name before calling yolfi_agent_register; after they open the emailed confirmation link, call yolfi_agent_register again with the same arguments. Never re-register an existing email. Then call yolfi_auth_status, ask for wallet and pricing decisions, create or reuse a paylink, and verify payment status and webhook signatures.',
  'yolfi://docs/webhooks': '# Webhooks\nYolfi signs the raw JSON payload with HMAC-SHA256 base64 in X-Yolfi-Signature. Local create and rotate tools store each endpoint secret in the protected Yolfi config without returning plaintext. Verify with endpointId or an explicitly managed YOLFI_WEBHOOK_SECRET.',
  'yolfi://docs/paylinks': '# Paylinks\nUse POST /api/private/paylinks/create with bearer API key. Do not create duplicate paylinks after timeout without listing existing paylinks first.',
  'yolfi://examples/codex': '# Codex\nUse npx -y @yolfi/agent help, inspect the target app, then use Yolfi tools to add checkout and webhook handling.',
  'yolfi://examples/claude-code': '# Claude Code\nUse the Yolfi MCP server and ask the user for wallet and pricing decisions before mutating the target app.',
  'yolfi://examples/cursor': '# Cursor\nUse @yolfi/agent examples and keep secrets in env files that are ignored by git.',
};

const promptText = {
  integrate_yolfi_payments: `${resourceText['yolfi://docs/agent-quickstart']}\n\nInspect the target application before editing it. Reuse its framework and secret-management conventions, then add checkout, payment status, and a verified webhook path.`,
  create_yolfi_paylink: '# Create a Yolfi paylink\nAuthorize Yolfi, list existing paylinks to prevent duplicates, collect the product name and price from the user, and create the minimum matching ONE_TIME or RECURRING paylink. Return its ID and checkout URL.',
  add_yolfi_webhook_handler: `${resourceText['yolfi://docs/webhooks']}\n\nInspect the application server, ask for the intended callback URL, configure a Yolfi webhook endpoint, and verify X-Yolfi-Signature against the raw request body before accepting an event.`,
  verify_yolfi_payment_flow: '# Verify a Yolfi payment flow\nExercise the checkout path, fetch the payment by ID, and confirm the server handles a correctly signed webhook. A frontend redirect alone is not proof of payment.',
  migrate_existing_stripe_webhook_to_yolfi_adapter: '# Migrate a Stripe-style webhook path\nInspect the existing webhook contract, configure a Yolfi endpoint with the STRIPE adapter only after user approval, update authentication to validate the Yolfi endpoint secret, and verify the complete event path.',
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

function validateToolArguments(name, args) {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`Unknown Yolfi MCP tool: ${name}`);
  }

  const errors = [];
  validateSchemaValue(args, tool.inputSchema, 'arguments', errors);
  if (errors.length > 0) {
    throw new Error(`Invalid arguments for ${name}: ${errors.join('; ')}`);
  }
}

function validateSchemaValue(value, schema, path, errors) {
  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${path} must equal ${JSON.stringify(schema.const)}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path} must be one of ${schema.enum.join(', ')}`);
    return;
  }

  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${path} must be an object`);
      return;
    }

    for (const required of schema.required || []) {
      if (value[required] === undefined) {
        errors.push(`${path}.${required} is required`);
      }
    }

    const keys = Object.keys(value);
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) {
      errors.push(`${path} must have at most ${schema.maxProperties} properties`);
    }

    for (const key of keys) {
      if (schema.propertyNames?.maxLength && key.length > schema.propertyNames.maxLength) {
        errors.push(`${path} property names must be at most ${schema.propertyNames.maxLength} characters`);
      }

      const propertySchema = schema.properties?.[key];
      if (propertySchema) {
        validateSchemaValue(value[key], propertySchema, `${path}.${key}`, errors);
      } else if (schema.additionalProperties === false) {
        errors.push(`${path}.${key} is not allowed`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        validateSchemaValue(value[key], schema.additionalProperties, `${path}.${key}`, errors);
      }
    }
    return;
  }

  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${path} must be an array`);
      return;
    }
    if (schema.items) {
      value.forEach((item, index) => validateSchemaValue(item, schema.items, `${path}[${index}]`, errors));
    }
    return;
  }

  if (schema.type === 'string' && typeof value !== 'string') {
    errors.push(`${path} must be a string`);
    return;
  }
  if (schema.type === 'string' && schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push(`${path} must be at most ${schema.maxLength} characters`);
  }
  if (schema.type === 'string' && schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push(`${path} must be at least ${schema.minLength} characters`);
  }
  if (schema.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
    errors.push(`${path} must be a finite number`);
  }
  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`${path} must be a boolean`);
  }
}

function optionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeAgentRegistrationArgs(args) {
  return {
    ...args,
    email: optionalString(args.email)?.toLowerCase(),
    agentName: optionalString(args.agentName) || args.agentName,
    projectName: optionalString(args.projectName) || args.projectName,
    projectUrl: optionalString(args.projectUrl),
    integrationIntent: optionalString(args.integrationIntent) || 'accept_payments',
    language: optionalString(args.language),
    ref: optionalString(args.ref),
  };
}

export async function callMcpTool(name, args = {}, options = {}) {
  args = normalizeArguments(args);
  const client = options.client || new YolfiClient(options);

  try {
    validateToolArguments(name, args);
    switch (name) {
      case 'yolfi_agent_setup_start': {
        const start = options.setupAgent || setupAgent;
        return textResult('Yolfi browser authorization started. Open loginUrl, finish authentication, then call yolfi_agent_checkin with the same agent slug.', await start(args));
      }
      case 'yolfi_agent_checkin': {
        const checkin = options.checkinAgent || checkinAgent;
        return textResult('Yolfi agent setup status checked', await checkin(args));
      }
      case 'yolfi_agent_register': {
        const { idempotencyKey, ...registrationArgs } = args;
        const registration = await registerAgentAccount(
          client,
          normalizeAgentRegistrationArgs(registrationArgs),
          { idempotencyKey },
        );
        const connected = registration?.data?.connected === true;
        return textResult(
          connected
            ? 'Yolfi registration confirmed. The agent credential was stored locally and is ready for private tools.'
            : registration?.data?.message || 'Yolfi registration is not connected yet.',
          registration,
        );
      }
      case 'yolfi_auth_status':
      case 'yolfi_organization_get':
        return textResult('Yolfi organization loaded', await client.authStatus());
      case 'yolfi_organization_update':
        return textResult('Yolfi organization updated', await client.updateOrganization(args));
      case 'yolfi_settlement_configure':
        return textResult('Yolfi settlement accounts configured', await client.configureSettlement(args.settlementAccounts));
      case 'yolfi_webhooks_configure': {
        const response = await client.configureWebhooks(args);
        return textResult(
          'Yolfi webhook endpoint created and its signing secret stored in the protected local config.',
          storeWebhookSigningSecret(response),
        );
      }
      case 'yolfi_webhooks_list':
        return textResult('Yolfi webhook endpoints listed', await client.listWebhookEndpoints());
      case 'yolfi_webhooks_update': {
        const { id, ...payload } = args;
        return textResult('Yolfi webhook endpoint updated', await client.updateWebhookEndpoint(id, payload));
      }
      case 'yolfi_webhooks_rotate_secret': {
        if (args.confirm !== true) {
          throw new Error('confirm=true is required to rotate a webhook signing secret');
        }
        const response = await client.rotateWebhookEndpointSecret(args.id);
        return textResult(
          'Yolfi webhook endpoint secret rotated and stored in the protected local config.',
          storeWebhookSigningSecret(response, args.id),
        );
      }
      case 'yolfi_webhooks_delete': {
        if (args.confirm !== true) {
          throw new Error('confirm=true is required to delete a webhook endpoint');
        }
        const response = await client.deleteWebhookEndpoint(args.id);
        clearWebhookSigningSecret(args.id);
        return textResult('Yolfi webhook endpoint deleted', response);
      }
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
        const secret = process.env.YOLFI_WEBHOOK_SECRET
          || readWebhookSigningSecret(args.endpointId)
          || '';
        if (!secret) {
          throw new Error('Webhook signing secret is required; pass endpointId for a locally stored secret or set YOLFI_WEBHOOK_SECRET');
        }
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

function protocolError(id, code, message, data) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data }),
    },
  };
}

export async function handleMcpRequest(message) {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return protocolError(null, -32600, 'Invalid Request: JSON-RPC batching is not supported');
  }

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
          'Existing Yolfi users authorize with yolfi_agent_setup_start and yolfi_agent_checkin. New users confirm their email and project name before yolfi_agent_register, open the emailed link, then call the same registration tool again. Then use Yolfi tools to inspect the workspace, ask for wallet and pricing decisions, create or reuse paylinks, configure verified webhooks, and confirm payments through status checks or signed webhook events.',
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
    if (!Object.prototype.hasOwnProperty.call(resourceText, uri)) {
      return protocolError(id, -32602, `Unknown Yolfi resource URI: ${String(uri)}`);
    }
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
    const name = params?.name;
    if (!Object.prototype.hasOwnProperty.call(promptText, name)) {
      return protocolError(id, -32602, `Unknown Yolfi prompt: ${String(name)}`);
    }
    return {
      jsonrpc: '2.0',
      id,
      result: {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: promptText[name],
            },
          },
        ],
      },
    };
  }

  return protocolError(id, -32601, `Method not found: ${method}`);
}

export function startMcpServer() {
  readMessages(async (message, meta) => {
    const invalidRequest = !message || typeof message !== 'object' || Array.isArray(message);
    if (!invalidRequest && !Object.prototype.hasOwnProperty.call(message, 'id')) {
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
