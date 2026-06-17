![Yolfi Agent Kit：面向 AI 代理的支付集成、加密货币支付页面、支付链接、MCP、命令行、SDK 和 Webhook](../../assets/yolfi-agent-banner.svg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

面向 AI 代理的加密货币支付集成。Yolfi Agent Kit 是以 JSON 为核心的 SDK、命令行工具、代理技能和 MCP 服务器，让 AI 编程代理可以通过 Yolfi 为应用加入稳定币支付、支付链接、支付状态检查、Webhook 签名验证，以及基于 Webhook 的访问控制逻辑。

当 Codex、Claude Code、Cursor、OpenClaw、MCP 主机或自定义 AI 代理已经能构建产品，但仍需要可靠的支付 API 来注册 Yolfi 工作区、创建支付链接、配置 Webhook 并验证加密货币支付状态，而不想让用户手动进入控制台完成设置时，可以使用 `@yolfi/agent`。

[网站](https://yolfi.com/zh-CN) | [Agent Kit](https://yolfi.com/zh-CN/ai-agent-kit) | [文档](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [指南](https://yolfi.com/zh-CN/blog/ai-agent-payment-integration-api)

## 语言

阅读其他语言版本：
[English](../../README.md),
[Español](README.es.md),
[Deutsch](README.de.md),
[Français](README.fr.md),
[简体中文](README.zh-CN.md),
[Русский](README.ru.md),
[हिन्दी](README.hi.md),
[Türkçe](README.tr.md),
[한국어](README.ko.md),
[日本語](README.ja.md).

## 开发者为什么使用它

- 为 SaaS 产品、游戏、市场、捐赠页面、数字下载、内部工具和由代理构建的应用加入 AI 代理支付能力。
- 给编程代理一条安全的支付流程：检查应用、注册或复用工作区、向用户确认钱包和价格、创建支付链接、安装支付页面、验证 Webhook、检查支付状态。
- 用一个包处理 MCP 加密货币支付、JSON 命令行自动化、JavaScript SDK 调用、Webhook 签名验证和代理可读说明。
- 使用现有 Yolfi API，而不是维护第二套只给代理使用的支付 API。
- 帮助代理通过 npm、GitHub、MCP 目录、`llms.txt`、文档、示例和集成指南发现 Yolfi。

Yolfi 负责加密货币支付基础设施、托管支付页面、支付链接、公共支付发票、组织设置、结算钱包配置和 Webhook 投递。你的代理负责检查项目、修改代码、获取用户确认，并把支付能力接入目标应用。

## 它可以为应用加入什么

- 通过 Yolfi 支付链接提供托管的加密货币支付页面。
- 为数字产品、积分、文件、工具或游戏道具创建一次性支付链接。
- 在 Yolfi 账户支持时，通过支付链接设置周期性支付或订阅式支付。
- 捐赠页面和创作者支持页面。
- 根据支付链接创建公共支付发票的服务器路由。
- 通过 Yolfi 公共支付接口轮询支付状态。
- 验证 `X-Yolfi-Signature` 的 Webhook 处理器。
- 基于 Webhook 的访问控制逻辑，只在确认支付事件后解锁访问权限。
- 面向 Codex、Claude Code、Cursor、OpenClaw 和自定义自动化的代理流程。

## 代理技能

此包在 `SKILL.md` 中包含 **Yolfi Payments Skill**。当用户要求添加加密货币支付、支付链接、支付页面、订阅、捐赠、付费下载、付费访问或基于 Webhook 的权限时，可以将它用于编程代理。

推荐的安全流程：

```txt
检查应用 -> 检查 YOLFI_API_KEY -> 必要时注册 -> 向用户确认钱包和价格 -> 配置组织 -> 创建或复用支付链接 -> 添加支付页面 -> 添加 Webhook 验证 -> 检查状态
```

该技能告诉代理哪些步骤可以自动完成，哪些决定必须交给用户。代理绝不能编造钱包地址、价格、套餐、币种、密钥存储位置或破坏性的支付链接操作。

## 安装

安装到项目中：

```bash
npm install @yolfi/agent
```

不安装直接运行：

```bash
npx -y @yolfi/agent help
```

启动 stdio MCP 服务器：

```bash
npx -y @yolfi/agent mcp
```

在此仓库内进行本地开发：

```bash
node packages/yolfi-agent/src/cli.js help
```

## 认证

私有命令使用 Yolfi 组织 API 密钥：

```bash
export YOLFI_API_KEY="yolfi_..."
export YOLFI_API_BASE_URL="https://app.yolfi.com/api"
export YOLFI_PAY_BASE_URL="https://pay.yolfi.com"
```

除非需要连接非默认的 Yolfi 环境，否则 `YOLFI_API_BASE_URL` 和 `YOLFI_PAY_BASE_URL` 都是可选的。

如果目标应用还没有 `YOLFI_API_KEY`，代理可以通过代理注册接口注册工作区：

```bash
yolfi auth:agent-register \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

返回的 API 密钥只显示一次。请把它存放在被忽略的 env 文件、部署密钥或密钥管理器中。不要在日志中打印完整密钥，不要提交到 git，也不要写入目标项目的 README。

## 快速开始

检查 API 密钥关联的工作区：

```bash
yolfi auth:status
```

在用户提供钱包地址后配置结算钱包：

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

配置 Webhook 投递：

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

创建重复支付链接前先列出现有支付链接：

```bash
yolfi paylinks:list --page 1 --rows 10
```

创建一次性支付链接：

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

根据支付链接创建公共支付发票：

```bash
yolfi payments:create --json examples/payment.create.json
```

检查支付状态：

```bash
yolfi payments:status --id <paymentId>
```

所有命令行命令都会输出 JSON，代理无需解析终端文本即可读取结果。

## 加密货币支付 MCP 服务器

Yolfi Agent Kit 在同一个 npm 包中包含 stdio MCP 服务器：

```json
{
  "mcpServers": {
    "yolfi-api": {
      "command": "npx",
      "args": ["-y", "@yolfi/agent", "mcp"],
      "env": {
        "YOLFI_API_KEY": "..."
      }
    },
    "yolfi-knowledge": {
      "command": "npx",
      "args": ["-y", "@yolfi/agent", "mcp"]
    }
  }
}
```

`yolfi-api` 工具调用 Yolfi API，需要 `YOLFI_API_KEY`。`yolfi-knowledge` 资源可以在还没有密钥时帮助代理理解集成路径。

可用 MCP 工具：

- `yolfi_auth_status`
- `yolfi_organization_get`
- `yolfi_organization_update`
- `yolfi_settlement_configure`
- `yolfi_webhooks_configure`
- `yolfi_paylinks_create`
- `yolfi_paylinks_list`
- `yolfi_paylinks_get`
- `yolfi_paylinks_disable`
- `yolfi_payments_create`
- `yolfi_payments_status`
- `yolfi_webhooks_verify`

像 `yolfi_paylinks_disable` 这样的破坏性工具只能在用户明确确认后运行。

## 面向代理的 JSON 流程

代理可以写入一个 payload 文件，并交给命令行工具：

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

然后运行：

```bash
yolfi paylinks:create --json ./paylink.json
```

代理应把返回的支付链接 ID 存入目标应用的 env/config，并使用 Yolfi 公共支付接口处理面向客户的支付页面和状态查询。

## 命令

```bash
yolfi auth:agent-register --project-name "App" --agent-name "Codex" --integration-intent accept_payments
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

## 接口适配矩阵

Yolfi Agent Kit 不会创建第二套 `/api/agent/*` API。它把代理动作映射到当前 Yolfi API：

| 代理动作 | API 接口 | 认证 |
| --- | --- | --- |
| 注册 Yolfi 工作区 | `POST /api/auth/agent/register` | public |
| 检查账户 | `GET /api/private/organization/current` | bearer API key |
| 配置组织、Webhook、结算钱包 | `PUT /api/private/organization/current` | bearer API key |
| 获取 API 密钥状态 | `GET /api/private/organization/api-key` | bearer API key 或 cookie |
| 创建支付链接 | `POST /api/private/paylinks/create` | bearer API key |
| 列出支付链接 | `GET /api/private/paylinks` | bearer API key |
| 获取支付链接 | `GET /api/private/paylinks/:id` | bearer API key |
| 编辑支付链接 | `POST /api/private/paylinks/edit` | bearer API key |
| 停用支付链接 | `POST /api/private/paylinks/disable` | bearer API key 加确认 |
| 公共支付链接页面信息 | `GET /api/public/paylinks/:id` | public |
| 创建公共支付发票 | `POST /api/public/payments` | public |
| 支付状态 | `GET /api/public/payments/:id` | public |
| 商户交易 | `GET /api/private/transactions` | bearer API key |

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

## Webhook 验证

Yolfi 使用 `X-Yolfi-Signature` 对 Webhook payload 签名。在解析 JSON 并信任事件前，请先验证原始请求体：

```js
import { verifyWebhookSignature } from "@yolfi/agent";

const valid = verifyWebhookSignature(
  rawBody,
  request.headers["x-yolfi-signature"],
  process.env.YOLFI_API_KEY,
);

if (!valid) {
  throw new Error("Invalid Yolfi webhook signature");
}
```

不要把前端跳转当作支付证明。请使用已验证的 Webhook 和 Yolfi 支付状态检查。

## 与 AI 编程代理一起使用

Yolfi Agent Kit 面向代理式支付流程：用户给出高层指令，例如“添加支付”、“出售这个数字产品”、“添加捐赠按钮”、“为这个游戏收费”或“把这个功能放到付费访问之后”。

- Codex：检查仓库，添加支付页面路由/组件，配置 env 变量，并把已验证的 Webhook 接入现有访问控制逻辑。
- Claude Code：使用 MCP 服务器和 Agent Skill 添加支付链接、服务器处理器和状态检查，并在钱包和价格决策上取得用户确认。
- Cursor：添加支付界面和后端处理器，同时确保 Yolfi 密钥不会进入已提交的源码。
- OpenClaw 和自定义代理：通过 CLI、SDK、MCP 工具和 JSON payload 把产品构建流程连接到 Yolfi。

推荐代理路径：

```txt
auth:status -> organization:get -> paylinks:list -> 用户确认 -> settlement:configure -> webhooks:configure -> paylinks:create -> 安装支付页面 -> 验证 webhook -> payments:status
```

## 代理示例

`examples/` 文件夹包含可复制的流程和 JSON payload：

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## 这个包不是什么

- 它不是单独的 Yolfi 控制台。
- 它不是钱包提供商。
- 它不是带有重复业务逻辑的第二套支付 API。
- 它不会编造结算钱包、产品名称、价格、币种、订阅或捐赠金额。
- 它不会绕过用户对破坏性操作的确认。
- 它不会把密钥存储在源代码里。
- 它不会使用跳转作为支付确认。

## 当前限制

- MCP 服务器目前使用 stdio 传输。
- Webhook 签名使用当前 Yolfi 签名约定。如果 Yolfi 之后把 Webhook 密钥与组织 API 密钥分离，此包会提供新的密钥配置路径。
- 代理注册只返回一次 API 密钥。代理必须把它存放在被忽略的 env 文件、部署密钥或密钥管理器中。
- 最终支付确认应来自已验证的 Webhook 和支付状态检查，而不是界面跳转。
- MCP 目录审核独立于此包。不要在 listing 被接受前声称已获得官方目录批准。

## 这个包覆盖的搜索词

开发者和代理构建者经常搜索：

- AI 代理支付集成
- AI 编程代理支付
- MCP 支付服务器
- MCP 加密货币支付
- 面向代理的加密货币支付 API
- 面向 AI 代理的支付链接
- 应用内稳定币支付
- Webhook 支付验证
- 代理式支付流程
- 用 Codex、Claude Code 或 Cursor 添加加密货币支付

Yolfi Agent Kit 是这些流程的包入口。

## 链接

- Yolfi：<https://yolfi.com/zh-CN>
- Agent Kit 页面：<https://yolfi.com/zh-CN/ai-agent-kit>
- 文档：<https://docs.yolfi.com/en/agent-kit>
- LLM 索引：<https://docs.yolfi.com/llms.txt>
- 完整 LLM 上下文：<https://docs.yolfi.com/llms-full.txt>
- npm 包：<https://www.npmjs.com/package/@yolfi/agent>
- GitHub 仓库：<https://github.com/yolfinance/yolfi-agent>
- 集成指南：<https://yolfi.com/zh-CN/blog/ai-agent-payment-integration-api>
