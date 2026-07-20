# Yolfi agent and MCP setup

Yolfi supports two MCP transports:

- Remote streamable HTTP: `https://app.yolfi.com/mcp`
- Local stdio: `npx -y @yolfi/agent mcp`

Use the remote endpoint when the host supports remote MCP and does not need local process access. Use stdio when the host can launch Node.js locally or when you need a credential stored on that machine.

## Authorize the local CLI

Start setup with a stable host slug:

```bash
npx -y @yolfi/agent setup --agent codex
```

Open the `loginUrl` from the JSON response and finish authentication. Then check in with the same slug:

```bash
npx -y @yolfi/agent checkin --agent codex
npx -y @yolfi/agent auth:status
```

The pending check-in token and connected `yolfi_agent_*` credential are saved in `~/.yolfi/config.json`. On filesystems that support POSIX permissions, the directory is `0700` and the file is `0600`. Set `YOLFI_CONFIG_HOME` to use another config directory.

Credential precedence is explicit SDK option, then `YOLFI_API_KEY`, then the stored local credential. This lets CI and secret managers override a developer-machine login without modifying the config file.

## Create a new account through the agent

For a user who does not have a Yolfi account, the local CLI or MCP server can start an email-confirmed signup without opening the dashboard. The agent must ask the user to confirm the email address and project name first:

```bash
npx -y @yolfi/agent auth:agent-register \
  --email "owner@example.com" \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments
```

The first call sends the owner a confirmation link and stores the pending check-in token in the protected local config. After the owner opens the link, run the same command again with the same arguments. The package then redeems and stores the one-time agent credential locally while removing it from command and MCP output.

If the email already exists, registration stops and the user must use remote OAuth or local browser setup. A repeated call and a lost response are safe because the package preserves and reuses the pending idempotency key and check-in token. If signup expires or fails after provisioning, use browser setup instead of registering the same email again.

## Verify the active connection

Do not use a browser request or dashboard ping to the public MCP URL as a connection check. It confirms only that the server is reachable. The MCP host owns its OAuth session, so verify the actual client by running `yolfi_auth_status` from that agent after OAuth or local check-in.

## Codex

Codex CLI, the IDE extension, and the ChatGPT desktop Codex host share MCP configuration.

Remote:

```bash
codex mcp add yolfi --url https://app.yolfi.com/mcp
codex mcp login yolfi
```

Local stdio:

```bash
codex mcp add yolfi -- npx -y @yolfi/agent mcp
```

Confirm the connection with:

```bash
codex mcp list
```

In an interactive Codex session, use `/mcp` to inspect connected tools. Remote MCP uses the browser OAuth flow managed by Codex. For local stdio authorization, ask Codex to call `yolfi_agent_setup_start` with `agent: "codex"`, open the returned URL, then ask it to call `yolfi_agent_checkin` with the same slug and finally `yolfi_auth_status`.

You can also add either transport from **Settings → MCP servers → Add server** in the ChatGPT desktop app or Codex IDE extension, then restart the host. See the [official Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp).

## Claude Code

Remote:

```bash
claude mcp add --transport http yolfi https://app.yolfi.com/mcp
```

Open Claude Code, run `/mcp`, select Yolfi, and complete browser authorization.

Local stdio:

```bash
claude mcp add yolfi -- npx -y @yolfi/agent mcp
```

For local authorization, ask Claude Code to call `yolfi_agent_setup_start` with `agent: "claude-code"`, open the returned URL, then call `yolfi_agent_checkin` with the same slug and `yolfi_auth_status`.

## ChatGPT desktop

1. Open **Settings → MCP servers**.
2. Select **Add server**.
3. Choose **Streamable HTTP**, name it `yolfi`, and enter `https://app.yolfi.com/mcp`.
4. Save the server and select **Restart**.
5. Select **Authenticate**, complete Yolfi OAuth in the browser, and verify the connection with `yolfi_auth_status`.

The desktop app can also use the local stdio command `npx -y @yolfi/agent mcp` when Node.js is available on the machine.

## ChatGPT web

ChatGPT web does not launch local stdio servers and does not read `~/.codex/config.toml`. It uses remote MCP-backed plugins in Work mode.

For developer-mode testing:

1. Open [ChatGPT](https://chatgpt.com) and go to **Settings → Security and login**.
2. Enable **Developer mode**.
3. Open **Settings → Plugins** (or the [Plugins page](https://chatgpt.com/plugins)) and select the plus button.
4. Create a developer-mode app whose MCP server URL is `https://app.yolfi.com/mcp`.
5. Start a Work mode chat, enable the Yolfi plugin, complete OAuth, and run `yolfi_auth_status`.

For normal workspace use, install the published Yolfi plugin from **Plugins** in Work mode. Plugin availability and tool access may be controlled by workspace administrators. See the [official OpenAI plugin documentation](https://learn.chatgpt.com/docs/plugins).

## Generic MCP host

Local stdio configuration:

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

For the local stdio server, call:

1. `yolfi_agent_setup_start` with a stable `agent` slug.
2. Open the returned `loginUrl` and finish browser authentication.
3. `yolfi_agent_checkin` with the same slug.
4. `yolfi_auth_status` to verify access before using private payment tools.

The packaged Codex and Claude plugins use this local server, so these tools are available after plugin installation. If the host is configured manually with `https://app.yolfi.com/mcp` instead, complete OAuth in that host and start with `yolfi_auth_status`; the remote server does not expose local setup, check-in, or signup tools.

For a brand-new user on the plugin or local server, call `yolfi_agent_register` after the user confirms an email and project name. Open the emailed confirmation link, then call the same tool again with the same arguments to store the one-time credential. Existing users should use OAuth or browser setup. For CI, create an API key in Yolfi settings and pass it through `YOLFI_API_KEY`.
