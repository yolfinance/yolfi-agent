![Yolfi Agent Kit: AI 에이전트 결제 연동, 암호화폐 결제 페이지, 결제 링크, MCP, CLI, SDK, Webhook](../../assets/ai-agent-payment.jpg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

AI 에이전트를 위한 암호화폐 결제 연동입니다. Yolfi Agent Kit은 AI 코딩 에이전트가 Yolfi를 통해 애플리케이션에 스테이블코인 결제, 결제 링크, 결제 상태 확인, Webhook 서명 검증, Webhook 기반 접근 로직을 추가할 수 있게 해 주는 JSON-first SDK, CLI, 에이전트 스킬, MCP 서버입니다.

Codex, Claude Code, Cursor, OpenClaw, MCP 호스트 또는 사용자 정의 AI 에이전트가 제품을 만들 수 있지만, Yolfi 작업 공간 등록, 결제 링크 생성, Webhook 설정, 암호화폐 결제 상태 확인을 위해 신뢰할 수 있는 결제 API가 필요하고 사용자를 수동 대시보드 설정으로 보내고 싶지 않을 때 `@yolfi/agent`를 사용합니다.

[웹사이트](https://yolfi.com/ko) | [Agent Kit](https://yolfi.com/ko/ai-agent-kit) | [문서](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [가이드](https://yolfi.com/ko/blog/ai-agent-payment-integration-api)

## 언어

이 패키지 가이드를 다른 언어로 읽기:
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

## 개발자가 사용하는 이유

- SaaS 제품, 게임, 마켓플레이스, 기부 페이지, 디지털 다운로드, 내부 도구, 에이전트가 만든 앱에 AI 에이전트 결제를 추가합니다.
- 코딩 에이전트에게 안전한 결제 흐름을 제공합니다. 앱을 살펴보고, 작업 공간을 등록하거나 재사용하고, 사용자에게 지갑과 가격 결정을 확인하고, 결제 링크를 만들고, 결제 페이지를 설치하고, Webhook을 검증하고, 결제 상태를 확인합니다.
- MCP 암호화폐 결제, JSON CLI 자동화, JavaScript SDK 호출, Webhook 서명 검증, 에이전트가 읽을 수 있는 지침을 하나의 패키지로 사용합니다.
- 에이전트 전용 결제 API를 따로 유지하지 않고 기존 Yolfi API로 구축합니다.
- 에이전트가 npm, GitHub, MCP 디렉터리, `llms.txt`, 문서, 예제, 연동 가이드를 통해 Yolfi를 찾을 수 있게 합니다.

Yolfi는 암호화폐 결제 인프라, 호스팅 결제 페이지, 결제 링크, 공개 결제 인보이스, 조직 설정, 정산 지갑 구성, Webhook 전달을 처리합니다. 에이전트는 프로젝트 분석, 코드 변경, 사용자 확인, 대상 앱 연동을 처리합니다.

## 앱에 추가할 수 있는 것

- Yolfi 결제 링크를 통한 호스팅 암호화폐 결제 페이지.
- 디지털 제품, 크레딧, 파일, 도구, 게임 아이템을 위한 일회성 결제 링크.
- Yolfi 계정이 지원하는 경우 반복 결제 또는 구독형 결제 링크 설정.
- 기부 및 크리에이터 지원 페이지.
- 결제 링크에서 공개 결제 인보이스를 생성하는 서버 라우트.
- Yolfi 공개 결제 endpoint를 통한 결제 상태 조회.
- `X-Yolfi-Signature`를 검증하는 Webhook 핸들러.
- 확인된 결제 이벤트 이후에만 접근을 열어 주는 Webhook 기반 권한 로직.
- Codex, Claude Code, Cursor, OpenClaw, 사용자 정의 자동화를 위한 에이전트 흐름.

## 에이전트 스킬

이 패키지는 `SKILL.md`에 **Yolfi Payments Skill**을 포함합니다. 사용자가 암호화폐 결제, 결제 링크, 결제 페이지, 구독, 기부, 유료 다운로드, 유료 접근, Webhook 기반 권한을 추가해 달라고 할 때 코딩 에이전트와 함께 사용합니다.

권장 안전 흐름:

```txt
앱 확인 -> YOLFI_API_KEY 확인 -> 필요하면 등록 -> 사용자에게 지갑과 가격 확인 -> 조직 구성 -> 결제 링크 생성 또는 재사용 -> 결제 페이지 추가 -> Webhook 검증 추가 -> 상태 확인
```

이 스킬은 에이전트가 자동으로 할 수 있는 일과 사용자에게 물어야 하는 결정을 구분합니다. 에이전트는 지갑 주소, 가격, 요금제, 통화, 비밀값 저장 위치, 파괴적인 결제 링크 작업을 지어내면 안 됩니다.

## 설치

프로젝트에 설치:

```bash
npm install @yolfi/agent
```

설치 없이 실행:

```bash
npx -y @yolfi/agent help
```

stdio MCP 서버 시작:

```bash
npx -y @yolfi/agent mcp
```

이 저장소 안에서 로컬 개발:

```bash
node packages/yolfi-agent/src/cli.js help
```

## 인증

비공개 명령은 Yolfi 조직 API 키를 사용합니다:

```bash
export YOLFI_API_KEY="yolfi_..."
```

CLI와 MCP 서버는 기본적으로 Yolfi의 프로덕션 API와 결제 페이지를 사용합니다.

대상 앱에 아직 `YOLFI_API_KEY`가 없다면 에이전트는 에이전트 등록 endpoint를 통해 작업 공간을 등록할 수 있습니다:

```bash
yolfi auth:agent-register \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

반환된 API 키는 한 번만 표시됩니다. 무시되는 env 파일, 배포 비밀값, 또는 비밀 관리 도구에 저장하세요. 전체 키를 로그에 출력하거나 커밋하거나 대상 프로젝트 README에 쓰지 마세요.

## 빠른 시작

API 키에 연결된 작업 공간 확인:

```bash
yolfi auth:status
```

사용자가 지갑 주소를 제공한 뒤 정산 지갑 설정:

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Webhook 전달 설정:

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

중복 생성을 피하기 위해 기존 결제 링크 목록 조회:

```bash
yolfi paylinks:list --page 1 --rows 10
```

일회성 결제 링크 생성:

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

결제 링크에서 공개 결제 인보이스 생성:

```bash
yolfi payments:create --json examples/payment.create.json
```

결제 상태 확인:

```bash
yolfi payments:status --id <paymentId>
```

모든 CLI 명령은 JSON을 출력하므로 에이전트는 터미널 텍스트를 파싱하지 않고 결과를 읽을 수 있습니다.

## 암호화폐 결제를 위한 MCP 서버

Yolfi Agent Kit은 같은 npm 패키지 안에 stdio MCP 서버를 포함합니다:

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

`yolfi_agent_register`는 공개 에이전트 등록 엔드포인트를 호출하며 `YOLFI_API_KEY`가 필요하지 않습니다. 비공개 `yolfi-api` 도구는 등록 후 반환된 API 키가 필요합니다. `yolfi-knowledge` 리소스는 키가 생기기 전에도 에이전트가 연동 경로를 이해하도록 돕습니다.

사용 가능한 MCP 도구:

- `yolfi_agent_register`
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

`yolfi_paylinks_disable` 같은 파괴적인 도구는 명시적인 사용자 확인 후에만 실행해야 합니다.

## 에이전트를 위한 JSON 흐름

에이전트는 payload 파일을 작성해 CLI에 전달할 수 있습니다:

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

그다음 실행:

```bash
yolfi paylinks:create --json ./paylink.json
```

에이전트는 반환된 결제 링크 ID를 대상 앱의 env/config에 저장하고, 고객용 결제 페이지와 상태 조회에는 Yolfi 공개 결제 endpoint를 사용해야 합니다.

## 명령

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

## Endpoint 어댑터 매트릭스

Yolfi Agent Kit은 두 번째 `/api/agent/*` API를 만들지 않습니다. 에이전트 작업을 현재 Yolfi API에 매핑합니다:

| 에이전트 작업 | API endpoint | 인증 |
| --- | --- | --- |
| Yolfi 작업 공간 등록 | `POST /api/auth/agent/register` | public; API 키 불필요 |
| 계정 확인 | `GET /api/private/organization/current` | bearer API key |
| 조직, Webhook, 정산 지갑 설정 | `PUT /api/private/organization/current` | bearer API key |
| API 키 상태 가져오기 | `GET /api/private/organization/api-key` | bearer API key 또는 cookie |
| 결제 링크 생성 | `POST /api/private/paylinks/create` | bearer API key |
| 결제 링크 목록 | `GET /api/private/paylinks` | bearer API key |
| 결제 링크 조회 | `GET /api/private/paylinks/:id` | bearer API key |
| 결제 링크 수정 | `POST /api/private/paylinks/edit` | bearer API key |
| 결제 링크 비활성화 | `POST /api/private/paylinks/disable` | bearer API key 및 확인 |
| 공개 결제 링크 정보 | `GET /api/public/paylinks/:id` | public |
| 공개 결제 인보이스 생성 | `POST /api/public/payments` | public |
| 결제 상태 | `GET /api/public/payments/:id` | public |
| 판매자 거래 | `GET /api/private/transactions` | bearer API key |

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

## Webhook 검증

Yolfi는 Webhook payload를 `X-Yolfi-Signature`로 서명합니다. JSON을 파싱하고 이벤트를 신뢰하기 전에 원본 요청 본문을 검증하세요:

```js
import { verifyWebhookSignature } from "@yolfi/agent";

const valid = verifyWebhookSignature(
  rawBody,
  request.headers["x-yolfi-signature"],
  process.env.YOLFI_WEBHOOK_SECRET,
);

if (!valid) {
  throw new Error("Invalid Yolfi webhook signature");
}
```

프런트엔드 리디렉션을 결제 증거로 보지 마세요. 검증된 Webhook과 Yolfi 결제 상태 확인을 사용하세요.

## AI 코딩 에이전트와 함께 사용

Yolfi Agent Kit은 사용자가 "결제를 추가해 줘", "이 디지털 제품을 팔아 줘", "기부 버튼을 추가해 줘", "이 게임에 결제를 붙여 줘", "이 기능을 유료 접근 뒤에 둬" 같은 상위 수준의 지시를 주는 에이전트형 결제 흐름을 위해 설계되었습니다.

- Codex: 저장소를 살펴보고, 결제 페이지 라우트/컴포넌트를 추가하고, env 변수를 설정하고, 검증된 Webhook을 기존 접근 로직에 연결합니다.
- Claude Code: MCP 서버와 Agent Skill을 사용해 결제 링크, 서버 핸들러, 상태 확인을 추가하며 지갑과 가격 결정에는 사용자 승인을 받습니다.
- Cursor: Yolfi 키를 커밋된 소스 밖에 두면서 결제 UI와 백엔드 핸들러를 추가합니다.
- OpenClaw 및 사용자 정의 에이전트: CLI, SDK, MCP 도구, JSON payload를 통해 제품 구축 흐름을 Yolfi에 연결합니다.

권장 에이전트 경로:

```txt
auth:status -> organization:get -> paylinks:list -> 사용자 승인 -> settlement:configure -> webhooks:configure -> paylinks:create -> 결제 페이지 설치 -> webhook 검증 -> payments:status
```

## 에이전트 레시피

`examples/` 폴더에는 복사해 쓸 수 있는 흐름과 JSON payload가 있습니다:

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## 이 패키지가 아닌 것

- 별도의 Yolfi 대시보드가 아닙니다.
- 지갑 제공자가 아닙니다.
- 중복된 비즈니스 로직이 있는 두 번째 결제 API가 아닙니다.
- 정산 지갑, 제품명, 가격, 통화, 구독, 기부 금액을 지어내지 않습니다.
- 파괴적인 작업에 대한 사용자 확인을 우회하지 않습니다.
- 소스 코드에 비밀값을 저장하지 않습니다.
- 리디렉션을 결제 확인으로 사용하지 않습니다.

## 현재 제한

- MCP 서버는 현재 stdio 전송을 사용합니다.
- Webhook 서명은 현재 Yolfi 서명 계약을 사용합니다. 나중에 Yolfi가 Webhook 비밀값을 조직 API 키와 분리하면 이 패키지는 새 비밀값 설정 경로를 제공할 것입니다.
- 에이전트 등록은 API 키를 한 번만 반환합니다. 에이전트는 이를 무시되는 env 파일, 배포 비밀값, 또는 비밀 관리 도구에 저장해야 합니다.
- 최종 결제 확인은 UI 리디렉션이 아니라 검증된 Webhook과 결제 상태 확인에서 와야 합니다.
- MCP 디렉터리 승인은 이 패키지와 별개입니다. listing이 승인되기 전에는 공식 디렉터리 승인을 주장하지 마세요.

## 이 패키지가 다루는 검색 문구

개발자와 에이전트 빌더는 자주 다음을 찾습니다:

- AI 에이전트 결제 연동
- AI 코딩 에이전트 결제
- MCP 결제 서버
- MCP 암호화폐 결제
- 에이전트를 위한 암호화폐 결제 API
- AI 에이전트를 위한 결제 링크
- 앱용 스테이블코인 결제
- Webhook 결제 검증
- 에이전트형 결제 흐름
- Codex, Claude Code, Cursor로 암호화폐 결제 추가

Yolfi Agent Kit은 이런 흐름을 위한 패키지 진입점입니다.

## 링크

- Yolfi: <https://yolfi.com/ko>
- Agent Kit 페이지: <https://yolfi.com/ko/ai-agent-kit>
- 문서: <https://docs.yolfi.com/en/agent-kit>
- LLM 인덱스: <https://docs.yolfi.com/llms.txt>
- 전체 LLM 컨텍스트: <https://docs.yolfi.com/llms-full.txt>
- npm 패키지: <https://www.npmjs.com/package/@yolfi/agent>
- GitHub 저장소: <https://github.com/yolfinance/yolfi-agent>
- 연동 가이드: <https://yolfi.com/ko/blog/ai-agent-payment-integration-api>
