![Yolfi Agent Kit: AI 代理加密货币支付集成](../../assets/ai-agent-payment.png)

# Yolfi Agent Kit: AI 代理加密货币支付集成

让 AI 代理为项目接入加密货币支付链接、托管收银台和 webhook 签名验证。此包提供本地 MCP 服务器、JSON CLI、JavaScript SDK 和 Yolfi Payments Agent Skill。

```text
为这个项目接入 Yolfi 支付。请遵循 https://docs.yolfi.com/ai
```

在目标项目中将这条消息发送给代理。代理会检查代码、选择可用的连接方式，并在授权后继续实现。所有者只需提供缺失的决定，例如收款钱包或价格。

## 语言

[English](../../README.md), [Español](README.es.md), [Deutsch](README.de.md), [Français](README.fr.md), [简体中文](README.zh-CN.md), [Русский](README.ru.md), [हिन्दी](README.hi.md), [Türkçe](README.tr.md), [한국어](README.ko.md), [日本語](README.ja.md).

## 文档

- [AI 接入指南](https://docs.yolfi.com/en/agent-kit)
- [代理连接](https://docs.yolfi.com/en/agent-kit/connections)
- [HTTP API](https://docs.yolfi.com/en/api)
- [CLI](https://docs.yolfi.com/en/cli)
- [完整英文包指南](../../README.md)

## 本地 CLI

需要 Node.js 18 或更新版本。使用 npx，无需全局安装。没有授权时，代理运行 setup，为所有者打开 loginUrl，然后执行 checkin 和 auth:status。不要设置占位的 YOLFI_API_KEY，它会覆盖已保存的凭证。

```bash
npx -y @yolfi/agent help
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent setup --agent local-agent
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

## MCP 连接

一个本地服务器提供工具、资源和提示。远程地址 https://app.yolfi.com/mcp 的 OAuth 由客户端管理。请在同一个客户端调用 yolfi_auth_status；独立 CLI 不会读取该 OAuth。连接方式取决于环境能力，而不只是代理名称。

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

## 复用配置与密钥

先读取组织、钱包、相关支付链接、webhook 端点及项目配置。复用已批准的值，只询问缺失的信息。settlement:configure 通过 PATCH 更新指定网络并保留其他网络。webhooks:add 会创建独立端点，因此应先查找并复用已有端点。

```bash
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

使用 --json 前，请在目标项目中创建 JSON 文件。npx 不会将包内的 examples 目录复制到当前工作目录。

本地 CLI/MCP 在创建或轮换 webhook 时将签名密钥存入受保护的本地配置，并从输出中隐藏。使用端点 ID 或 YOLFI_WEBHOOK_SECRET 验证。SDK readWebhookSigningSecret(endpointId) 可将密钥直接传入应用的密钥管理器而不打印。避免通过命令或工具参数传递明文密钥。

```bash
npx -y @yolfi/agent webhooks:verify --endpoint-id <endpointId> --payload ./raw-webhook.json --signature <signature>
```

托管支付链接和公共支付查询不需要应用 API 密钥。创建私有 Checkout Session 需要独立的服务端凭证，并为同一订单的重试保留稳定的幂等键。代理 OAuth 不是应用凭证。

## 验证

分别报告账户授权、代码测试、运行环境密钥安装，以及真实支付和 webhook 投递验证。连接成功或浏览器跳转不能证明完整支付流程可用。
