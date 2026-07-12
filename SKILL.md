---
name: yolfi-payments
description: Add Yolfi crypto checkout, payment links, and webhook handling to an app through @yolfi/agent or the Yolfi MCP server.
---

# Yolfi Payments Skill

Use this when the user asks to add crypto payments, payment links, checkout, subscriptions, donations, or webhook-based entitlements with Yolfi.

## Workflow

1. Inspect the target app first.
2. Identify the framework, env system, server routes, existing checkout code, existing webhook handlers, and entitlement logic.
3. Check whether `YOLFI_API_KEY` already exists in ignored env/config.
4. If no key exists, register with `yolfi auth:agent-register` or the MCP tool `yolfi_agent_register`; registration is public and does not require `YOLFI_API_KEY`.
5. Ask the user for settlement wallet addresses. Never invent them.
6. Ask the user for product name, price, currency, payment type, and recurring interval.
7. Configure settlement settings through `PUT /api/private/organization/current`, then create each webhook through `POST /api/private/organization/webhook-endpoints` and store its returned signing secret securely.
8. List existing paylinks before creating a new one.
9. Create or reuse a paylink.
10. Store paylink ids in env/config, not hard-coded source when avoidable.
11. Add checkout UI or a server route that calls `POST /api/public/payments`. Pass a stable merchant-side customer/user id as `clientReferenceId` whenever webhook-driven attribution or subscription lifecycle updates must resolve that customer.
12. Add webhook signature verification for `X-Yolfi-Signature`. In native (`NONE`) payloads read `data.customer.clientReferenceId`; Stripe-compatible Checkout Session uses `data.object.client_reference_id`, while Stripe-compatible Invoice and Subscription objects use `data.object.metadata.client_reference_id`; Lemon Squeezy-compatible payloads use `meta.custom_data.client_reference_id`.
13. Connect webhook events to the app's existing entitlement/business logic when possible.
14. Verify payment status with `GET /api/public/payments/:id`.
15. Report changed files and exact verification commands.

## Do Not

- Do not invent wallet addresses.
- Do not invent prices, plans, currencies, or recurring intervals.
- Do not commit API keys or webhook secrets.
- Do not replace existing billing logic unnecessarily.
- Do not use frontend redirect as proof of payment.
- Do not disable paylinks without explicit user approval.
- Do not duplicate webhook business handlers when an existing handler can be reused.
- Do not use email as the primary subscription identity when `clientReferenceId` can be supplied.
