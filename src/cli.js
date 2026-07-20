#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { YolfiApiError, YolfiClient } from './client.js';
import { verifyWebhookSignature } from './webhooks.js';
import { startMcpServer } from './mcp.js';
import { parseMetadataFiltersFlag } from './metadata-filters.js';
import { checkinAgent, setupAgent } from './setup.js';
import { registerAgentAccount } from './registration.js';
import {
  clearWebhookSigningSecret,
  readWebhookSigningSecret,
  storeWebhookSigningSecret,
} from './config.js';

const help = `Yolfi Agent CLI

Usage:
  yolfi setup --agent codex
  yolfi checkin --agent codex
  yolfi auth:agent-register --email user@example.com --project-name "App" --agent-name "Codex" --integration-intent accept_payments [--idempotency-key <key>]
  yolfi auth:status
  yolfi organization:update --json organization.json
  yolfi settlement:configure --json settlement.json
  yolfi webhooks:add --name Analytics --url https://example.com/api/yolfi/webhook --adapter NONE --metadata-filters '{"website_id":"<websiteId>"}'
  yolfi webhooks:list
  yolfi webhooks:update --id <endpointId> --json endpoint.json
  yolfi webhooks:rotate-secret --id <endpointId> --confirm
  yolfi webhooks:remove --id <endpointId> --confirm
  yolfi paylinks:create --json paylink.json
  yolfi paylinks:list --page 1 --rows 10
  yolfi paylinks:get --id <paylinkId>
  yolfi paylinks:disable --id <paylinkId> --confirm
  yolfi payments:create --json payment.json
  yolfi payments:status --id <paymentId>
  yolfi webhooks:verify --endpoint-id <endpointId> --payload payload.json --signature <sig>
  yolfi mcp

New-user registration sends a confirmation link first. After opening it, run the
same auth:agent-register command again to store the one-time agent credential.

Env:
  YOLFI_API_KEY
  YOLFI_WEBHOOK_SECRET (optional override for webhook verification)
  YOLFI_CONFIG_HOME (defaults to ~/.yolfi)

Yolfi production API and checkout URLs are used by default.
`;

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const flags = {};

  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith('--')) {
      continue;
    }

    const key = item.slice(2);
    const next = rest[index + 1];
    if (!next || next.startsWith('--')) {
      flags[key] = true;
    } else {
      flags[key] = next;
      index += 1;
    }
  }

  return { command, flags };
}

function readJson(path) {
  if (!path || path === true) {
    throw new Error('--json <path> is required');
  }

  return JSON.parse(readFileSync(path, 'utf8'));
}

function readPayload(flags) {
  if (flags.json) {
    return readJson(flags.json);
  }

  if (flags.payload && flags.payload !== true) {
    return readFileSync(flags.payload, 'utf8');
  }

  throw new Error('--json <path> or --payload <path> is required');
}

function printJson(data) {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

function clientFromEnv() {
  return new YolfiClient();
}

async function run(argv = process.argv.slice(2)) {
  const { command, flags } = parseArgs(argv);

  if (command === 'help' || flags.help) {
    process.stdout.write(help);
    return 0;
  }

  if (command === 'mcp') {
    startMcpServer();
    return 0;
  }

  const client = clientFromEnv();
  let result;

  switch (command) {
    case 'setup':
      result = await setupAgent({ agent: flags.agent });
      break;
    case 'checkin':
      result = await checkinAgent({
        agent: flags.agent,
        checkinToken: flags['checkin-token'],
      });
      break;
    case 'auth:agent-register':
      result = await registerAgentAccount(
        client,
        {
          email: flags.email,
          agentName: flags['agent-name'],
          projectName: flags['project-name'],
          projectUrl: flags['project-url'],
          integrationIntent: flags['integration-intent'] || 'accept_payments',
          language: flags.language,
          ref: flags.ref,
        },
        { idempotencyKey: flags['idempotency-key'] },
      );
      break;
    case 'auth:status':
      result = await client.authStatus();
      break;
    case 'organization:update':
      result = await client.updateOrganization(readJson(flags.json));
      break;
    case 'settlement:configure': {
      const payload = readJson(flags.json);
      result = await client.configureSettlement(payload.settlementAccounts || payload);
      break;
    }
    case 'webhooks:configure':
    case 'webhooks:add': {
      const response = await client.configureWebhooks({
        name: flags.name || 'Webhook',
        url: flags.url,
        adapter: flags.adapter || 'NONE',
        metadataFilters: parseMetadataFiltersFlag(flags['metadata-filters']),
      });
      result = storeWebhookSigningSecret(response);
      break;
    }
    case 'webhooks:list':
      result = await client.listWebhookEndpoints();
      break;
    case 'webhooks:update':
      result = await client.updateWebhookEndpoint(flags.id, {
        ...readJson(flags.json),
        ...(flags['metadata-filters'] !== undefined
          ? { metadataFilters: parseMetadataFiltersFlag(flags['metadata-filters']) }
          : {}),
      });
      break;
    case 'webhooks:rotate-secret':
      if (flags.confirm !== true) {
        throw new Error('webhooks:rotate-secret requires --confirm because the previous secret stops signing new deliveries');
      }
      result = storeWebhookSigningSecret(
        await client.rotateWebhookEndpointSecret(flags.id),
        flags.id,
      );
      break;
    case 'webhooks:remove':
      if (flags.confirm !== true) {
        throw new Error('webhooks:remove is destructive; rerun with --confirm after user approval');
      }
      result = await client.deleteWebhookEndpoint(flags.id);
      clearWebhookSigningSecret(flags.id);
      break;
    case 'paylinks:create':
      result = await client.createPaylink(readJson(flags.json));
      break;
    case 'paylinks:list':
      result = await client.listPaylinks({ page: flags.page || 1, rows: flags.rows || 10 });
      break;
    case 'paylinks:get':
      result = await client.getPaylink(flags.id);
      break;
    case 'paylinks:disable':
      if (flags.confirm !== true) {
        throw new Error('paylinks:disable is destructive; rerun with --confirm after user approval');
      }
      result = await client.disablePaylink(flags.id);
      break;
    case 'payments:create':
      result = await client.createPayment(readJson(flags.json));
      break;
    case 'payments:status':
      result = await client.paymentStatus(flags.id);
      break;
    case 'webhooks:verify': {
      const payload = readPayload(flags);
      const secret = process.env.YOLFI_WEBHOOK_SECRET
        || readWebhookSigningSecret(flags['endpoint-id'])
        || '';
      if (!secret) {
        throw new Error('Webhook signing secret is required; pass --endpoint-id for a locally stored secret or set YOLFI_WEBHOOK_SECRET');
      }
      result = {
        success: true,
        data: {
          valid: verifyWebhookSignature(payload, flags.signature, secret),
        },
      };
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }

  printJson(result);
  return 0;
}

run().then((code) => {
  if (code !== 0) {
    process.exitCode = code;
  }
}).catch((error) => {
  const body = error instanceof YolfiApiError
    ? error.normalized
    : { success: false, code: 'YOLFI_CLI_ERROR', message: error.message };
  printJson(body);
  process.exitCode = 1;
});
