# Add Yolfi Payments With Codex

Ask the user for:

- settlement wallet address;
- product name;
- price and currency;
- one-time or recurring payment type;
- webhook URL if the app backend URL is unknown.

Connect the remote MCP server:

```bash
codex mcp add yolfi --url https://app.yolfi.com/mcp
```

Or connect local stdio:

```bash
codex mcp add yolfi -- npx -y @yolfi/agent mcp
```

The packaged plugin and local server expose agent setup, check-in, and signup tools. A manually configured remote server uses `codex mcp login yolfi`; after OAuth, start with `yolfi_auth_status`.

Codex can do automatically:

- inspect the app framework;
- start browser agent setup, return the login URL, and check in after the user authenticates;
- configure organization settings;
- create or reuse a paylink;
- add checkout UI/server code;
- add webhook signature verification;
- run tests and report changed files.

Expected verification:

```bash
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent paylinks:list
```
