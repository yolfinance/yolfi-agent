![Yolfi Agent Kit: AIエージェント決済連携、暗号資産決済ページ、決済リンク、MCP、CLI、SDK、Webhook](../../assets/yolfi-agent-banner.svg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

AIエージェント向けの暗号資産決済連携です。Yolfi Agent Kit は、AIコーディングエージェントが Yolfi を通じてアプリケーションにステーブルコイン決済、決済リンク、決済ステータス確認、Webhook署名検証、Webhookベースのアクセス制御を追加できる JSON-first の SDK、CLI、エージェントスキル、MCPサーバーです。

Codex、Claude Code、Cursor、OpenClaw、MCPホスト、または独自AIエージェントがプロダクトを作れるものの、ユーザーを手動のダッシュボード設定に戻さずに Yolfi ワークスペースを登録し、決済リンクを作成し、Webhookを設定し、暗号資産決済のステータスを確認するための信頼できる決済APIが必要な場合に `@yolfi/agent` を使います。

[ウェブサイト](https://yolfi.com/ja) | [Agent Kit](https://yolfi.com/ja/ai-agent-kit) | [ドキュメント](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [ガイド](https://yolfi.com/ja/blog/ai-agent-payment-integration-api)

## 言語

このパッケージガイドを他の言語で読む:
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

## 開発者が使う理由

- SaaS製品、ゲーム、マーケットプレイス、寄付ページ、デジタルダウンロード、社内ツール、エージェントが作ったアプリに AIエージェント決済を追加できます。
- コーディングエージェントに安全な決済フローを与えられます。アプリを確認し、ワークスペースを登録または再利用し、ユーザーにウォレットと価格の判断を確認し、決済リンクを作成し、決済ページを設置し、Webhookを検証し、決済ステータスを確認します。
- MCP暗号資産決済、JSON CLI自動化、JavaScript SDK呼び出し、Webhook署名検証、エージェントが読める手順を1つのパッケージで扱えます。
- エージェント専用の別決済APIを維持せず、既存のYolfi APIで構築できます。
- npm、GitHub、MCPディレクトリ、`llms.txt`、ドキュメント、サンプル、連携ガイドからエージェントがYolfiを見つけやすくなります。

Yolfiは暗号資産決済インフラ、ホスト型決済ページ、決済リンク、公開決済インボイス、組織設定、精算用ウォレット設定、Webhook配信を担当します。エージェントはプロジェクト調査、コード変更、ユーザー確認、対象アプリへの連携を担当します。

## アプリに追加できるもの

- Yolfi決済リンクによるホスト型暗号資産決済ページ。
- デジタル製品、クレジット、ファイル、ツール、ゲームアイテム向けの一回限りの決済リンク。
- Yolfiアカウントが対応している場合の継続決済またはサブスクリプション型の決済リンク設定。
- 寄付ページとクリエイター支援ページ。
- 決済リンクから公開決済インボイスを作成するサーバールート。
- Yolfi公開決済endpointによる決済ステータス確認。
- `X-Yolfi-Signature` を検証するWebhookハンドラー。
- 確認済み決済イベントの後だけアクセスを解放するWebhookベースの権限ロジック。
- Codex、Claude Code、Cursor、OpenClaw、独自自動化向けのエージェントフロー。

## エージェントスキル

このパッケージには `SKILL.md` に **Yolfi Payments Skill** が含まれています。ユーザーが暗号資産決済、決済リンク、決済ページ、サブスクリプション、寄付、有料ダウンロード、有料アクセス、Webhookベースの権限を追加したい場合に、コーディングエージェントと一緒に使います。

推奨される安全なフロー:

```txt
アプリ確認 -> YOLFI_API_KEY確認 -> 必要なら登録 -> ユーザーにウォレットと価格を確認 -> 組織を設定 -> 決済リンクを作成または再利用 -> 決済ページを追加 -> Webhook検証を追加 -> ステータス確認
```

このスキルは、エージェントが自動で行ってよいことと、ユーザーに判断を求めるべきことを示します。エージェントはウォレットアドレス、価格、プラン、通貨、シークレット保存場所、破壊的な決済リンク操作を作り上げてはいけません。

## インストール

プロジェクトにインストール:

```bash
npm install @yolfi/agent
```

インストールせずに実行:

```bash
npx -y @yolfi/agent help
```

stdio MCPサーバーを起動:

```bash
npx -y @yolfi/agent mcp
```

このリポジトリ内でローカル開発する場合:

```bash
node packages/yolfi-agent/src/cli.js help
```

## 認証

非公開コマンドはYolfi組織APIキーを使います:

```bash
export YOLFI_API_KEY="yolfi_..."
export YOLFI_API_BASE_URL="https://app.yolfi.com/api"
export YOLFI_PAY_BASE_URL="https://pay.yolfi.com"
```

標準以外のYolfi環境を対象にする必要がない限り、`YOLFI_API_BASE_URL` と `YOLFI_PAY_BASE_URL` は任意です。

対象アプリにまだ `YOLFI_API_KEY` がない場合、エージェントはエージェント登録endpointからワークスペースを登録できます:

```bash
yolfi auth:agent-register \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

返されるAPIキーは一度だけ表示されます。無視されるenvファイル、デプロイ用シークレット、またはシークレットマネージャーに保存してください。完全なキーをログに出力したり、コミットしたり、対象プロジェクトのREADMEに書いたりしないでください。

## クイックスタート

APIキーに紐づくワークスペースを確認:

```bash
yolfi auth:status
```

ユーザーがウォレットアドレスを提供した後、精算用ウォレットを設定:

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Webhook配信を設定:

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

重複作成の前に既存の決済リンクを一覧:

```bash
yolfi paylinks:list --page 1 --rows 10
```

一回限りの決済リンクを作成:

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

決済リンクから公開決済インボイスを作成:

```bash
yolfi payments:create --json examples/payment.create.json
```

決済ステータスを確認:

```bash
yolfi payments:status --id <paymentId>
```

すべてのCLIコマンドはJSONを出力するため、エージェントはターミナルテキストを解析せずに結果を読めます。

## 暗号資産決済向けMCPサーバー

Yolfi Agent Kitは同じnpmパッケージ内にstdio MCPサーバーを含みます:

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

`yolfi-api` ツールはYolfi APIを呼び出し、`YOLFI_API_KEY` を必要とします。`yolfi-knowledge` リソースはキーがまだない段階でエージェントが連携手順を理解するのに役立ちます。

利用できるMCPツール:

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

`yolfi_paylinks_disable` のような破壊的ツールは、ユーザーの明示的な確認後にのみ実行してください。

## エージェント向けJSONフロー

エージェントはpayloadファイルを書き、CLIに渡せます:

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

次に実行:

```bash
yolfi paylinks:create --json ./paylink.json
```

エージェントは返された決済リンクIDを対象アプリのenv/configに保存し、顧客向け決済ページとステータス確認にはYolfi公開決済endpointを使うべきです。

## コマンド

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

## Endpointアダプターマトリクス

Yolfi Agent Kitは2つ目の `/api/agent/*` APIを作りません。エージェントの操作を現在のYolfi APIに対応付けます:

| エージェント操作 | API endpoint | 認証 |
| --- | --- | --- |
| Yolfiワークスペースを登録 | `POST /api/auth/agent/register` | public |
| アカウントを確認 | `GET /api/private/organization/current` | bearer API key |
| 組織、Webhook、精算用ウォレットを設定 | `PUT /api/private/organization/current` | bearer API key |
| APIキー状態を取得 | `GET /api/private/organization/api-key` | bearer API key または cookie |
| 決済リンクを作成 | `POST /api/private/paylinks/create` | bearer API key |
| 決済リンクを一覧 | `GET /api/private/paylinks` | bearer API key |
| 決済リンクを取得 | `GET /api/private/paylinks/:id` | bearer API key |
| 決済リンクを編集 | `POST /api/private/paylinks/edit` | bearer API key |
| 決済リンクを無効化 | `POST /api/private/paylinks/disable` | bearer API key と確認 |
| 公開決済リンク情報 | `GET /api/public/paylinks/:id` | public |
| 公開決済インボイスを作成 | `POST /api/public/payments` | public |
| 決済ステータス | `GET /api/public/payments/:id` | public |
| 販売者取引 | `GET /api/private/transactions` | bearer API key |

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

## Webhook検証

YolfiはWebhook payloadに `X-Yolfi-Signature` で署名します。JSONを解析してイベントを信頼する前に、生のリクエストボディを検証してください:

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

フロントエンドのリダイレクトを決済証明として扱わないでください。検証済みWebhookとYolfi決済ステータス確認を使ってください。

## AIコーディングエージェントで使う

Yolfi Agent Kitは、ユーザーが「決済を追加して」「このデジタル商品を売って」「寄付ボタンを追加して」「このゲームに課金を入れて」「この機能を有料アクセスの後ろに置いて」といった高レベルの指示を出すエージェント型決済フロー向けに作られています。

- Codex: リポジトリを確認し、決済ページのルート/コンポーネントを追加し、env変数を設定し、検証済みWebhookを既存のアクセス制御ロジックにつなぎます。
- Claude Code: MCPサーバーとAgent Skillを使って、決済リンク、サーバーハンドラー、ステータス確認を追加し、ウォレットと価格の判断ではユーザー承認を取ります。
- Cursor: Yolfiキーをコミット済みソースに入れずに、決済UIとバックエンドハンドラーを追加します。
- OpenClawと独自エージェント: CLI、SDK、MCPツール、JSON payloadを通じてプロダクト構築フローをYolfiにつなぎます。

推奨エージェント経路:

```txt
auth:status -> organization:get -> paylinks:list -> ユーザー承認 -> settlement:configure -> webhooks:configure -> paylinks:create -> 決済ページを設置 -> webhook検証 -> payments:status
```

## エージェント向けレシピ

`examples/` フォルダにはコピーして使えるフローとJSON payloadがあります:

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## このパッケージではないもの

- 別のYolfiダッシュボードではありません。
- ウォレットプロバイダーではありません。
- 重複したビジネスロジックを持つ2つ目の決済APIではありません。
- 精算用ウォレット、商品名、価格、通貨、サブスクリプション、寄付金額を作り上げません。
- 破壊的操作に対するユーザー確認を回避しません。
- ソースコードにシークレットを保存しません。
- リダイレクトを決済確認として使いません。

## 現在の制限

- MCPサーバーは現在 stdio transport を使います。
- Webhook署名は現在のYolfi署名契約を使います。将来YolfiがWebhookシークレットを組織APIキーから分離した場合、このパッケージは新しいシークレット設定経路を公開します。
- エージェント登録はAPIキーを一度だけ返します。エージェントはそれを無視されるenvファイル、デプロイ用シークレット、またはシークレットマネージャーに保存する必要があります。
- 最終的な決済確認はUIリダイレクトではなく、検証済みWebhookと決済ステータス確認から行うべきです。
- MCPディレクトリの承認はこのパッケージとは別です。listingが受理されるまで公式ディレクトリ承認を主張しないでください。

## このパッケージが対象にする検索語句

開発者やエージェント開発者はよく次のように検索します:

- AIエージェント決済連携
- AIコーディングエージェント決済
- MCP決済サーバー
- MCP暗号資産決済
- エージェント向け暗号資産決済API
- AIエージェント向け決済リンク
- アプリ向けステーブルコイン決済
- Webhook決済検証
- エージェント型決済フロー
- Codex、Claude Code、Cursorで暗号資産決済を追加

Yolfi Agent Kitはこれらのフローのパッケージ入口です。

## リンク

- Yolfi: <https://yolfi.com/ja>
- Agent Kitページ: <https://yolfi.com/ja/ai-agent-kit>
- ドキュメント: <https://docs.yolfi.com/en/agent-kit>
- LLMインデックス: <https://docs.yolfi.com/llms.txt>
- 完全なLLMコンテキスト: <https://docs.yolfi.com/llms-full.txt>
- npmパッケージ: <https://www.npmjs.com/package/@yolfi/agent>
- GitHubリポジトリ: <https://github.com/yolfinance/yolfi-agent>
- 連携ガイド: <https://yolfi.com/ja/blog/ai-agent-payment-integration-api>
