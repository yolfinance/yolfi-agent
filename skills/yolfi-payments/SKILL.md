---
name: yolfi-payments
description: Implement Yolfi payment links, hosted checkout, and verified webhook handling by inspecting the project and reusing its account connection and approved settings.
---

# Yolfi Payments

Use this skill when the user asks to add or maintain Yolfi payments in a project. Complete the requested implementation after connecting the account.

Canonical agent guide: https://docs.yolfi.com/ai
Connection reference: https://docs.yolfi.com/en/agent-kit/connections
HTTP API reference: https://docs.yolfi.com/en/api

## Inspect and connect

1. Read the canonical agent guide. Inspect the framework, checkout code, server routes, deployment configuration, existing billing, webhook handlers, and entitlement logic.
2. Inspect available tools and current authorization. Reuse a connected Yolfi MCP server; call `yolfi_auth_status` in that host. Once authenticated, continue using those tools without obtaining or generating an organization API key, setting `YOLFI_API_KEY`, or starting another CLI login. If using the local CLI, run `npx -y @yolfi/agent auth:status`. Remote OAuth and local CLI credentials are separate. Do not ask the user to choose a transport or paste an API key when a supported authorization path exists.
3. If local authorization is missing, use `yolfi_agent_setup_start` / `yolfi_agent_checkin` or `npx -y @yolfi/agent setup --agent <slug>` / `checkin --agent <slug>`. Open the returned URL when browser tools are available, let the owner authorize, and resume check-in using the same slug. Reuse an unexpired pending session. For remote MCP, use host-managed OAuth and verify through the host's tools. If connector installation needs an owner action, explain only that required action and continue the same task afterward.
4. For an explicitly new account, use `yolfi_agent_register` or `auth:agent-register` with the owner's confirmed email and project name. After the owner opens the emailed link, repeat with the same arguments and retry key. Existing emails use browser authorization. If a one-time credential response was lost after redemption, check the stored connection before starting authorization again.

## Reuse and implement

5. Read the organization, settlement accounts, all relevant paylinks, webhook endpoints, and project configuration before mutations. Reuse existing owner-approved wallets, product names, prices, currencies, and intervals. Ask one concise question only for required decisions that cannot be established from the user's request or existing approved configuration. Never invent receiving addresses or commercial terms.
6. Choose the minimum checkout needed. A fixed paylink can use hosted checkout with no private runtime API key. Server-priced orders use authenticated Checkout Sessions with an amount calculated on the server and a stable per-order idempotency key. The agent's MCP OAuth session is not the application's server credential.
7. Configure only missing or explicitly changed settlement networks through `settlement:configure`, `yolfi_settlement_configure`, or `PATCH /api/private/organization/settlement-accounts`. This merges the supplied networks. Preserve unmentioned networks; do not fall back to the replacement `PUT /organization/current` if the merge endpoint is unavailable.
8. Reuse a matching paylink before creating one. Read the next list page when necessary. After an uncertain create response, list again before retrying. Store returned IDs in the app's existing configuration. Use `paymentMetadata` for default payment attribution; do not treat customer-controlled metadata as authorization.
9. List and reuse a matching webhook endpoint by application URL, adapter, and intended filters. Create only if needed. `webhooks:configure` / `yolfi_webhooks_configure` creates a new endpoint, not an upsert. After an uncertain create response, inspect existing endpoints and local secret state before retrying. Do not silently duplicate an endpoint or rotate a live signing secret to recover from an unknown result.
10. Create any JSON payload files in the target project before invoking `--json`. Package examples are references, not files automatically installed in the target working directory. Use `npx -y @yolfi/agent` unless the project already has an executable command convention.
11. Add checkout UI or the appropriate server route, preserving existing billing logic. Public payment creation accepts a paylink or Checkout Session context. It needs a customer email directly or from the session; never manufacture one. Pass a stable merchant customer/user ID as `clientReferenceId` for subscription ownership and entitlement updates.
12. Add or reuse a handler that verifies `X-Yolfi-Signature` over the raw body with the endpoint's signing secret, then connects verified events to the existing business logic. Do not grant access from a browser redirect.

## Credentials and webhook secrets

- The local CLI/MCP stores browser/signup credentials and create/rotate webhook secrets in protected `~/.yolfi/config.json`. Local create/rotate output is redacted. Explicit `YOLFI_API_KEY` overrides the local login; omit placeholder values.
- Verify locally with `yolfi_webhooks_verify({endpointId, payload, signature})` or `npx -y @yolfi/agent webhooks:verify --endpoint-id <id> --payload <raw-body-file> --signature <signature>`. `YOLFI_WEBHOOK_SECRET` can be supplied by the environment. Avoid passing plaintext secrets as CLI flags or tool arguments.
- For runtime deployment, a local provisioning script can call the exported SDK `readWebhookSigningSecret(endpointId)` and pass it directly to the app's existing secret manager or ignored environment file without printing it. The deployed handler reads its own `YOLFI_WEBHOOK_SECRET`, not the developer's local Yolfi config.
- Remote webhook tools and direct SDK create/rotate calls return the API's one-time secret. Transfer it through the target environment's existing secret mechanism without logging or committing it. List/update responses do not reveal it.
- If an existing endpoint's secret is not available in project/deployment configuration or the protected local store, explain the missing access or required recovery. Rotation requires explicit owner authorization and coordinated deployment because it changes signing behavior.
- Public fixed-paylink checkout and public status requests need no private API key. Private runtime operations, including Checkout Session creation, need an intentionally provisioned server credential. Never copy host OAuth tokens into the target app.
- `getApiKey()` returns a full organization secret, not diagnostic status. Use `authStatus()` to check account access.
- Supported adapters are `NONE`, `STRIPE`, and `LEMON_SQUEEZY`. `NONE` is the native Yolfi payload. Analytics endpoints use `NONE` without metadata filters; generic flat string filters are for explicit current-payment categories only.
- Native customer references use `data.customer.clientReferenceId`. Stripe Checkout Session uses `data.object.client_reference_id`; Stripe Invoice and Subscription use `data.object.metadata.client_reference_id`; Lemon Squeezy uses `meta.custom_data.client_reference_id`.

## Verify and finish

13. Run relevant application tests for checkout, raw-body signature validation, and entitlement behavior. Verify account access through the same transport used for setup. Use payment or Checkout Session status where appropriate; avoid creating live paid activity solely for a smoke test.
14. Report implementation changes, configured resources, runtime secret installation, exact tests, and any remaining owner/deployment action. Distinguish account authorization, local code verification, and live payment/webhook verification. Do not claim end-to-end success from setup, a redirect, or a locally generated signature alone.

Never commit or print credentials, invent commercial decisions, disable paylinks or remove/rotate endpoints without explicit authorization, or replace working billing handlers unnecessarily.
