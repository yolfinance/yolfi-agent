# Add Yolfi payments with Codex

Send this message in the target project:

```text
Add Yolfi payments to this project. Follow https://docs.yolfi.com/ai
```

The agent inspects the project and available tools, reuses an authenticated Yolfi connection, and implements checkout and webhook handling. Connection setup is described at https://docs.yolfi.com/en/agent-kit/connections. Agent brand alone does not determine whether remote MCP, local commands, or browser tools are available.

For an already connected remote MCP server, verify with `yolfi_auth_status`, then read `yolfi_organization_get`, `yolfi_paylinks_list`, and `yolfi_webhooks_list` in that host. Remote OAuth does not create a separate local CLI credential.

If local commands are available, start with:

```bash
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

Only when local authorization is missing, run setup, open the returned URL for owner authorization, then check in and continue:

```bash
npx -y @yolfi/agent setup --agent codex
npx -y @yolfi/agent checkin --agent codex
npx -y @yolfi/agent auth:status
```

Reuse approved wallets, pricing, paylinks, and webhook endpoints; ask only for missing decisions. Write any needed JSON payload into the target project's working directory before referencing it with `--json`. Examples in the package are not copied there by `npx`.

A fixed-paylink runtime needs the paylink ID and a webhook signing secret, not a private API key. Local CLI/MCP stores webhook secrets securely; transfer the selected endpoint's secret with `readWebhookSigningSecret(endpointId)` through the app's secret manager without printing it. Private runtime API calls require a separately provisioned server credential.

Verify through the transport actually used. Test checkout code and signed webhook handling, then report what changed and which checks ran. Account authorization is not proof of live payment or webhook delivery.
