# Agent connection reference

The canonical connection guide is https://docs.yolfi.com/en/agent-kit/connections. The agent integration workflow is https://docs.yolfi.com/ai.

Send one message to the agent in the target project:

```text
Add Yolfi payments to this project. Follow https://docs.yolfi.com/ai
```

The agent should inspect its available tools and reuse an authenticated Yolfi connection before installing anything. Remote MCP OAuth belongs to that host; local CLI and stdio MCP share the protected local Yolfi config. A remote login does not authorize a separate CLI process. After MCP authentication succeeds, continue through its tools without requesting an organization API key or starting a separate CLI login. Local MCP likewise uses its stored browser-setup credential automatically.

## Remote MCP

Endpoint: `https://app.yolfi.com/mcp` using Streamable HTTP. Use host-managed OAuth, then call `yolfi_auth_status` in that host. Read available tools from the server. Local credential setup, registration, and local signature helpers are not remote tools.

If the host cannot add or authorize the connector automatically, give the owner only the necessary host action, then continue the original task when it becomes available. Host UI paths change; use the canonical connection guide instead of assuming a brand guarantees a particular capability.

## Local CLI or stdio MCP

Node.js 18 or later is required:

```bash
npx -y @yolfi/agent auth:status
# If local authorization is missing:
npx -y @yolfi/agent setup --agent local-agent
# Open loginUrl for owner authorization, then:
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

For stdio, configure one server:

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

The bundled Codex and Claude plugins launch this local server. Call `yolfi_agent_setup_start`, open its `loginUrl`, resume `yolfi_agent_checkin` using the same `agent` slug, and verify with `yolfi_auth_status`. The CLI can continue an integration while the host reloads its MCP configuration, but only with its own verified local authorization.

Credentials are stored with owner-only permissions where supported, atomic writes, and process locking. `YOLFI_CONFIG_HOME` selects an isolated profile. Explicit SDK credentials override `YOLFI_API_KEY`, which overrides the local config. Omit placeholder environment credentials when using browser authorization.

## New users and recovery

Use `auth:agent-register` or `yolfi_agent_register` only for an explicitly new account, with an owner-confirmed email and project name. The owner opens the emailed confirmation link; the agent repeats the same operation with the same arguments. Pending state and the initial signup idempotency key survive a lost first response. Existing users use browser authorization.

A lost response after a one-time credential was redeemed cannot be replayed. Check the active credential first; if missing, start browser authorization again. Reuse an unexpired pending browser session in the same API environment instead of issuing a new one on every attempt. Use separate YOLFI_CONFIG_HOME profiles for different API environments.

## Continue to implementation

Authorization is only a connection check. Read organization settings, paylinks, webhook endpoints, and project configuration; reuse approved values and ask only for missing decisions. Implement the requested checkout and access logic, provision runtime secrets through the app's existing mechanism, and report the exact verification performed. See the [package guide](../README.md) for CLI commands, local secret storage, and the distinction between provisioning and application credentials.
