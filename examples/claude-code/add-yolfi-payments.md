# Add Yolfi Payments With Claude Code

Use the Yolfi MCP server or `npx -y @yolfi/agent`.

```bash
# Remote streamable HTTP
claude mcp add --transport http yolfi https://app.yolfi.com/mcp

# Or local stdio
claude mcp add yolfi -- npx -y @yolfi/agent mcp
```

The packaged plugin and local stdio server expose `yolfi_agent_setup_start`: call it with `agent: "claude-code"`, open the returned login URL, then call `yolfi_agent_checkin` with the same slug and verify with `yolfi_auth_status`. A manually configured remote server uses Claude's OAuth flow instead; after OAuth, start with `yolfi_auth_status`.

Before creating paylinks, ask the user for wallet, price, currency, and payment type. Do not commit secrets. Use existing webhook and entitlement patterns in the app when possible.

Expected target app changes:

- ignored env/config entry for `YOLFI_API_KEY`;
- paylink id stored in env/config;
- checkout UI or server route;
- webhook handler verifying `X-Yolfi-Signature`;
- tests or smoke checks for checkout and webhook behavior.
