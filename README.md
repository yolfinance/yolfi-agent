![Yolfi Agent Kit: AI agent payment integration for crypto checkout, payment links, MCP, CLI, SDK, and webhooks](assets/ai-agent-payment.jpg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](package.json)
[![Yolfi MCP server](https://glama.ai/mcp/servers/yolfinance/yolfi-agent/badges/card.svg)](https://glama.ai/mcp/servers/yolfinance/yolfi-agent)
[![Yolfi MCP score](https://glama.ai/mcp/servers/yolfinance/yolfi-agent/badges/score.svg)](https://glama.ai/mcp/servers/yolfinance/yolfi-agent)

AI agent payment integration for crypto checkout. Yolfi Agent Kit is a JSON-first SDK, CLI, Agent Skill, and MCP server that lets AI coding agents add stablecoin checkout, payment links, payment status checks, webhook verification, and webhook-based access logic to applications through Yolfi.

Use `@yolfi/agent` when Codex, Claude Code, Cursor, OpenClaw, an MCP host, or a custom AI agent can build the product but still needs a reliable payment API to register a Yolfi workspace, create a paylink, configure webhooks, and verify crypto payment status without sending the user through manual dashboard setup.

[Website](https://yolfi.com) | [Agent Kit](https://yolfi.com/ai-agent-kit) | [Docs](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [Glama](https://glama.ai/mcp/servers/yolfinance/yolfi-agent) | [Guide](https://yolfi.com/blog/ai-agent-payment-integration-api)

## Languages

Read this package guide in:
[English](README.md),
[Español](docs/i18n/README.es.md),
[Deutsch](docs/i18n/README.de.md),
[Français](docs/i18n/README.fr.md),
[简体中文](docs/i18n/README.zh-CN.md),
[Русский](docs/i18n/README.ru.md),
[हिन्दी](docs/i18n/README.hi.md),
[Türkçe](docs/i18n/README.tr.md),
[한국어](docs/i18n/README.ko.md),
[日本語](docs/i18n/README.ja.md).

## Why Developers Use It

- Add AI agent payments to SaaS products, games, marketplaces, donation pages, digital downloads, internal tools, and agent-built apps.
- Give coding agents a safe payment workflow: inspect the app, authorize or reuse a workspace, ask for wallet and price decisions, create paylinks, install checkout, verify webhooks, and check payment status.
- Use one package for MCP crypto payments, JSON CLI automation, JavaScript SDK calls, webhook signature verification, and agent-readable instructions.
- Build with the existing Yolfi API instead of maintaining a second agent-only payment API.
- Help agents discover Yolfi through npm, GitHub, MCP directories, `llms.txt`, docs, examples, and integration guides.

Yolfi handles crypto payment infrastructure, hosted checkout, paylinks, public payment invoices, organization settings, settlement wallet configuration, and webhook delivery. Your agent handles project inspection, code changes, user confirmation, and target-app integration.

## What It Can Add To An App

- Hosted crypto checkout through Yolfi paylinks.
- One-time payment links for digital products, credits, files, tools, or game items.
- Recurring or subscription-style payment link setup when the Yolfi account supports it.
- Donation and creator-support payment pages.
- Server routes that create public payment invoices from a paylink.
- Payment status polling through Yolfi public payment endpoints.
- Webhook handlers that verify `X-Yolfi-Signature`.
- Webhook-based entitlement logic that unlocks access only after confirmed payment events.
- Agent workflows for Codex, Claude Code, Cursor, OpenClaw, and custom automation.

## Agent Skill

This package includes the **Yolfi Payments Skill** in `SKILL.md`. Use it with coding agents when the user asks to add crypto payments, payment links, checkout, subscriptions, donations, paid downloads, paid access, or webhook-based entitlements.

Recommended safe workflow:

```txt
inspect app -> setup agent -> browser authorization -> checkin -> auth status -> ask user for wallet and price -> configure organization -> create or reuse paylink -> add checkout -> add webhook verification -> verify status
```

The skill tells agents what they may do automatically and what they must ask the user to decide. Agents must never invent wallet addresses, prices, plans, currencies, secret storage locations, or destructive paylink actions.

## Install

Install in a project:

```bash
npm install @yolfi/agent
```

Or run without installing:

```bash
npx -y @yolfi/agent help
```

Start the stdio MCP server:

```bash
npx -y @yolfi/agent mcp
```

For local development inside this repository:

```bash
node packages/yolfi-agent/src/cli.js help
```

## Authentication

The preferred local flow opens browser authorization and stores the resulting `yolfi_agent_*` credential in `~/.yolfi/config.json`:

```bash
npx -y @yolfi/agent setup --agent codex
# Open the returned loginUrl and finish authentication.
npx -y @yolfi/agent checkin --agent codex
npx -y @yolfi/agent auth:status
```

The config directory and file are created with `0700` and `0600` permissions where supported. Set `YOLFI_CONFIG_HOME` to override the config directory in isolated development or CI environments.

Explicit credentials still work and take precedence over stored credentials:

```bash
export YOLFI_API_KEY="yolfi_agent_..."
```

The CLI and local MCP server also support email-confirmed signup for a new Yolfi user. The agent must ask the user to confirm the email and project name before registration:

```bash
export YOLFI_REGISTRATION_IDEMPOTENCY_KEY="76cd8dd3-b92a-42d6-ae2f-bc013752cf30"
yolfi auth:agent-register \
  --email "owner@example.com" \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm \
  --idempotency-key "$YOLFI_REGISTRATION_IDEMPOTENCY_KEY"
```

The first call creates a pending signup, emails the owner a confirmation link, and stores a protected check-in token locally. After the owner opens that link, run the exact same command again. The second call checks the pending signup, stores the one-time `yolfi_agent_*` credential in the protected local config, and removes the full credential from CLI/MCP output.

This command is signup-only. If the email already has a Yolfi account, use OAuth or local browser setup instead. If the pending signup expires or fails, use `yolfi setup` followed by `yolfi checkin` for the provisioned account rather than trying to register the same email again.

The CLI generates and persists a UUID when `--idempotency-key` is omitted. It automatically reuses that key and the protected check-in token for the repeated command and after a lost response. A new registration intent may pass a different 16–200 character key. The MCP `yolfi_agent_register` tool follows the same behavior through its optional `idempotencyKey` argument: call it once to send the email and again after confirmation.

Never print a full API key in logs, commit it, or write it into target-project documentation. See [Agent and MCP setup](docs/agent-setup.md) for host-specific instructions.

## Quick Start

Check the workspace linked to the API key:

```bash
yolfi auth:status
```

Configure settlement wallets after the user provides wallet addresses:

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Configure one or more webhook endpoints. Deliveries, retries, and signing secrets are independent. The CLI stores each create/rotate secret in the protected local Yolfi config and prints only redacted metadata:

```bash
yolfi webhooks:add \
  --name "Application" \
  --url https://example.com/api/yolfi/webhook \
  --adapter NONE

yolfi webhooks:add \
  --name "Analytics endpoint" \
  --url https://analytics.example/api/payments/yolfi/<websiteId>/webhook \
  --adapter NONE \
  --metadata-filters '{"website_id":"<websiteId>"}'

yolfi webhooks:list
```

Endpoint create and update payloads accept optional flat `metadataFilters` string maps (at most 10 entries; keys at most 100 characters; values at most 255 characters); deliveries must match every configured key/value. Analytics routing uses the single key `website_id`; do not introduce alternative analytics keys. The CLI accepts filters as validated JSON through `--metadata-filters`. Use `webhooks:update --id <endpointId> --json endpoint.json` (optionally with `--metadata-filters '{"website_id":"<websiteId>"}'`) to edit or enable/disable an analytics endpoint. `webhooks:remove` requires `--confirm`; endpoints with delivery history are disabled rather than deleting their audit relationship.

List existing paylinks before creating duplicates:

```bash
yolfi paylinks:list --page 1 --rows 10
```

Create a one-time payment link:

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

Create a public payment invoice from a paylink:

```bash
yolfi payments:create --json examples/payment.create.json
```

The invoice body requires `paylinkId`, `network`, `symbol`, and `customerEmail`. It also accepts optional
`clientReferenceId` (your internal customer/order reference, returned as
`customer.clientReferenceId` in webhooks), `customerName`, `customerPhone`, `customerDateOfBirth`,
`customerAddress`, `subscriptionId`, `language`, and `metadata`.

Hosted Paylink URLs accept the same payment-scoped metadata through explicitly namespaced query
parameters such as `metadata[order_id]=order-123`. Metadata keys must use letters, numbers,
underscores, or dashes; values passed through the hosted URL are strings. The payment API also
accepts finite numbers and booleans. Metadata is limited to 20 keys, 64 characters per key, and
500 characters per string value.

Use a stable customer or application-user id for `clientReferenceId` when webhook handlers must
resolve subscription ownership. Native (`NONE`) payloads expose it as
`data.customer.clientReferenceId`; Stripe-compatible Checkout Session payloads use
`data.object.client_reference_id`, Stripe-compatible Invoice and Subscription payloads use
`data.object.metadata.client_reference_id`, and Lemon Squeezy-compatible payloads use
`meta.custom_data.client_reference_id`.

Check payment status:

```bash
yolfi payments:status --id <paymentId>
```

Every CLI command prints JSON so agents can parse results without scraping terminal text.

## MCP Server For Crypto Payments

Yolfi provides both a production streamable HTTP endpoint and a local stdio server:

```txt
Remote: https://app.yolfi.com/mcp
Local:  npx -y @yolfi/agent mcp
```

The packaged Codex and Claude plugins use the bundled local stdio server so agent setup, check-in, and new-user registration are available as MCP tools. A manually configured remote connection uses OAuth managed by the MCP host and does not expose those local credential tools.

Codex remote:

```bash
codex mcp add yolfi --url https://app.yolfi.com/mcp
codex mcp login yolfi
```

Codex local:

```bash
codex mcp add yolfi -- npx -y @yolfi/agent mcp
```

Claude Code remote:

```bash
claude mcp add --transport http yolfi https://app.yolfi.com/mcp
```

Then open Claude Code, run `/mcp`, select Yolfi, and complete browser authorization.

Claude Code local:

```bash
claude mcp add yolfi -- npx -y @yolfi/agent mcp
```

Generic local MCP configuration:

```json
{
  "mcpServers": {
    "yolfi": {
      "command": "npx",
      "args": ["-y", "@yolfi/agent", "mcp"]
    }
  }
}
```

After connecting a local server, call `yolfi_agent_setup_start` with a stable `agent` slug, open the returned `loginUrl`, then call `yolfi_agent_checkin` with the same slug. The local server stores the connected credential securely. For CI and other non-interactive environments, provide a manually managed `YOLFI_API_KEY` instead.

For ChatGPT desktop, open **Settings → MCP servers → Add server**, choose **Streamable HTTP**, enter `https://app.yolfi.com/mcp`, save, and restart. ChatGPT web uses a remote MCP-backed plugin in Work mode; it cannot start the local stdio command or read local Codex configuration. Detailed ChatGPT developer-mode and plugin steps are in [docs/agent-setup.md](docs/agent-setup.md).

Available MCP tools:

- `yolfi_agent_setup_start`
- `yolfi_agent_checkin`
- `yolfi_agent_register`
- `yolfi_auth_status`
- `yolfi_organization_get`
- `yolfi_organization_update`
- `yolfi_settlement_configure`
- `yolfi_webhooks_configure`
- `yolfi_webhooks_list`
- `yolfi_webhooks_update`
- `yolfi_webhooks_rotate_secret`
- `yolfi_webhooks_delete`
- `yolfi_paylinks_create`
- `yolfi_paylinks_list`
- `yolfi_paylinks_get`
- `yolfi_paylinks_disable`
- `yolfi_payments_create`
- `yolfi_payments_status`
- `yolfi_webhooks_verify`

Webhook create/rotate tools save the one-time signing secret in the protected local Yolfi config and never return its plaintext through CLI stdout or an MCP transcript. Pass `endpointId` to `yolfi_webhooks_verify` to use that stored secret. CI and deployed services can provide an explicitly managed `YOLFI_WEBHOOK_SECRET` instead.

Destructive tools such as `yolfi_paylinks_disable` must only run after explicit user confirmation.

## JSON Workflow For Agents

Agents can write a payload file and pass it to the CLI:

```json
{
  "name": "Premium Download",
  "description": "One-time access to a digital product.",
  "type": "ONE_TIME",
  "price": "19",
  "currency": "USD",
  "collectEmail": true,
  "metadata": {
    "source": "agent",
    "productSlug": "premium-download"
  }
}
```

Then run:

```bash
yolfi paylinks:create --json ./paylink.json
```

Agents should keep the returned paylink ID in env/config for the target app and use Yolfi public payment endpoints for customer-facing checkout and status polling.

## Commands

```bash
yolfi setup --agent codex
yolfi checkin --agent codex
yolfi auth:agent-register --email "owner@example.com" --project-name "App" --agent-name "Codex" --integration-intent accept_payments --idempotency-key <same-key-on-retry>
yolfi auth:status
yolfi organization:update --json organization.json
yolfi settlement:configure --json settlement.json
yolfi webhooks:configure --url https://example.com/api/yolfi/webhook --adapter STRIPE
yolfi paylinks:create --json paylink.json
yolfi paylinks:list --page 1 --rows 10
yolfi paylinks:get --id <paylinkId>
yolfi paylinks:disable --id <paylinkId> --confirm
yolfi payments:create --json payment.json
yolfi payments:status --id <paymentId>
yolfi webhooks:verify --payload payload.json --signature <signature>
yolfi mcp
```

## Endpoint Adapter Matrix

Yolfi Agent Kit maps agent actions to the canonical Yolfi API:

| Agent action | Backend endpoint | Auth |
| --- | --- | --- |
| Start browser agent setup | `POST /api/agent/setup/start` | public; returns short-lived check-in state |
| Check browser agent setup | `POST /api/agent/setup/checkin` | public check-in token; returns credential once when connected |
| Register a new Yolfi user and workspace | `POST /api/auth/agent/register` | public signup-only flow; confirmed new email required |
| Check account | `GET /api/private/organization/current` | bearer API key |
| Configure organization and settlement wallets | `PUT /api/private/organization/current` | bearer API key |
| Create webhook endpoint | `POST /api/private/organization/webhook-endpoints` | bearer API key |
| Get API key status | `GET /api/private/organization/api-key` | bearer API key or cookie |
| Create paylink | `POST /api/private/paylinks/create` | bearer API key |
| List paylinks | `GET /api/private/paylinks` | bearer API key |
| Get paylink | `GET /api/private/paylinks/:id` | bearer API key |
| Edit paylink | `POST /api/private/paylinks/edit` | bearer API key |
| Disable paylink | `POST /api/private/paylinks/disable` | bearer API key plus confirmation |
| Public paylink checkout info | `GET /api/public/paylinks/:id` | public |
| Create public payment invoice | `POST /api/public/payments` | public |
| Payment status | `GET /api/public/payments/:id` | public |
| Merchant transactions | `GET /api/private/transactions` | bearer API key |

## SDK

```js
import { YolfiClient } from "@yolfi/agent";

const yolfi = new YolfiClient({
  apiKey: process.env.YOLFI_API_KEY,
});

const account = await yolfi.authStatus();

const paylink = await yolfi.createPaylink({
  name: "Premium Download",
  description: "One-time access to a digital product.",
  type: "ONE_TIME",
  price: "19",
  currency: "USD",
  collectEmail: true,
  metadata: {
    source: "agent",
    productSlug: "premium-download",
  },
});

console.log(account.success);
console.log(paylink.data?.id ?? paylink.id);
```

## Webhook Verification

Yolfi signs webhook payloads with `X-Yolfi-Signature`. Verify the raw request body before parsing and trusting the event:

```js
import { verifyWebhookSignature } from "@yolfi/agent";

const valid = verifyWebhookSignature(
  rawBody,
  request.headers["x-yolfi-signature"],
  process.env.YOLFI_WEBHOOK_SECRET,
);

if (!valid) {
  throw new Error("Invalid Yolfi webhook signature");
}
```

Do not treat a frontend redirect as proof of payment. Use verified webhooks and Yolfi payment status checks.

## Use With AI Coding Agents

Yolfi Agent Kit is designed for agentic payment workflows where the user gives a high-level instruction like "add payments", "sell this digital product", "add a donation button", "charge for this game", or "gate this feature behind payment".

- Codex: inspect the repo, add checkout routes/components, configure env vars, and wire verified webhooks into existing entitlement logic.
- Claude Code: use the MCP server and Agent Skill to add payment links, server handlers, and status checks with user approval for wallet and price decisions.
- Cursor: add payment UI and backend handlers while keeping Yolfi keys out of committed source.
- OpenClaw and custom agents: connect product-building workflows to Yolfi through CLI, SDK, MCP tools, and JSON payloads.

Recommended agent path:

```txt
auth:status -> organization:get -> paylinks:list -> user approval -> settlement:configure -> webhooks:configure -> paylinks:create -> install checkout -> verify webhook -> payments:status
```

## Agent Recipes

The `examples/` folder includes copy-paste workflows and JSON payloads:

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## What This Package Is Not

- It is not a separate Yolfi dashboard.
- It is not a wallet provider.
- It is not a second payment API with duplicated business logic.
- It does not invent settlement wallets, product names, prices, currencies, subscriptions, or donation amounts.
- It does not bypass user confirmation for destructive actions.
- It does not store secrets in source code.
- It does not use redirects as payment confirmation.

## Current Limits

- ChatGPT web can use only the remote MCP endpoint through a plugin; it cannot start the local stdio package.
- Each webhook endpoint has its own signing secret. The CLI/MCP create and rotate flows store it locally without printing it; verification uses `--endpoint-id`, MCP `endpointId`, or the explicitly managed `YOLFI_WEBHOOK_SECRET`. The organization API key is never used as a signing secret.
- Browser setup returns the agent credential once at successful check-in. The local CLI stores it in the protected Yolfi config; remote hosts manage authentication separately.
- Final payment confirmation should come from verified webhooks and payment status checks, not from UI redirects.
- MCP directory approval is separate from this package. Do not claim official directory approval until a listing is accepted.

## Search Phrases This Package Serves

Developers and agent builders often look for:

- AI agent payment integration
- AI coding agent payments
- MCP payment server
- MCP crypto payments
- crypto checkout API for agents
- payment links for AI agents
- stablecoin checkout for apps
- webhook payment verification
- agentic payment workflow
- add crypto payments with Codex, Claude Code, or Cursor

Yolfi Agent Kit is the package entry point for those workflows.

## Links

- Yolfi: <https://yolfi.com>
- Agent Kit page: <https://yolfi.com/ai-agent-kit>
- Docs: <https://docs.yolfi.com/en/agent-kit>
- LLM index: <https://docs.yolfi.com/llms.txt>
- Full LLM context: <https://docs.yolfi.com/llms-full.txt>
- npm package: <https://www.npmjs.com/package/@yolfi/agent>
- GitHub repo: <https://github.com/yolfinance/yolfi-agent>
- Glama MCP listing: <https://glama.ai/mcp/servers/yolfinance/yolfi-agent>
- Integration guide: <https://yolfi.com/blog/ai-agent-payment-integration-api>
