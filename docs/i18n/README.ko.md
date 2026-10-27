![Yolfi Agent Kit: AI 에이전트로 암호화폐 결제 연동](../../assets/ai-agent-payment.png)

# Yolfi Agent Kit: AI 에이전트로 암호화폐 결제 연동

AI 에이전트로 암호화폐 결제 링크, 호스팅 체크아웃, 웹훅 서명 검증을 연동하세요. 로컬 MCP 서버, JSON CLI, JavaScript SDK, Yolfi Payments Agent Skill을 제공합니다.

```text
이 프로젝트에 Yolfi 결제를 추가해 주세요. https://docs.yolfi.com/ai 를 따라 주세요.
```

대상 프로젝트에서 에이전트에 이 메시지를 보내세요. 에이전트가 코드를 확인하고 가능한 연결 방식을 선택한 뒤 인증 후에도 구현을 계속합니다. 소유자는 수신 지갑이나 가격처럼 빠진 결정만 제공합니다.

## 언어

[English](../../README.md), [Español](README.es.md), [Deutsch](README.de.md), [Français](README.fr.md), [简体中文](README.zh-CN.md), [Русский](README.ru.md), [हिन्दी](README.hi.md), [Türkçe](README.tr.md), [한국어](README.ko.md), [日本語](README.ja.md).

## 문서

- [AI 통합 가이드](https://docs.yolfi.com/en/agent-kit)
- [에이전트 연결](https://docs.yolfi.com/en/agent-kit/connections)
- [HTTP API](https://docs.yolfi.com/en/api)
- [CLI](https://docs.yolfi.com/en/cli)
- [전체 영문 패키지 가이드](../../README.md)

## 로컬 CLI

Node.js 18 이상이 필요합니다. npx를 사용하면 전역 설치가 필요 없습니다. 인증이 없으면 에이전트가 setup을 실행하고 소유자를 위해 loginUrl을 연 뒤 checkin과 auth:status를 실행합니다. 임시 YOLFI_API_KEY 값은 저장된 인증정보보다 우선하므로 설정하지 마세요.

```bash
npx -y @yolfi/agent help
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent setup --agent local-agent
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

## MCP 연결

하나의 로컬 서버가 도구, 리소스, 프롬프트를 제공합니다. https://app.yolfi.com/mcp 의 OAuth는 호스트가 관리합니다. 같은 호스트에서 yolfi_auth_status로 확인하세요. 별도 CLI는 그 OAuth를 읽지 않습니다. 에이전트 이름이 아니라 환경의 기능에 따라 연결을 선택하세요.

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

## 재사용과 비밀값

먼저 조직, 지갑, 관련 결제 링크, 웹훅 엔드포인트와 프로젝트 설정을 읽으세요. 승인된 값을 재사용하고 빠진 정보만 질문하세요. settlement:configure는 PATCH로 지정된 네트워크만 갱신하고 나머지를 보존합니다. webhooks:add는 별도 엔드포인트를 생성하므로 기존 항목을 먼저 찾아 재사용하세요.

```bash
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

--json을 사용하기 전에 대상 프로젝트에 JSON 파일을 만드세요. npx는 패키지의 examples 폴더를 작업 디렉터리에 복사하지 않습니다.

로컬 CLI/MCP는 웹훅 생성 및 교체 시 서명 비밀값을 보호된 설정에 저장하고 출력에서는 숨깁니다. 엔드포인트 ID 또는 YOLFI_WEBHOOK_SECRET로 검증하세요. SDK readWebhookSigningSecret(endpointId)를 사용하면 값을 출력하지 않고 앱의 비밀 관리 시스템에 전달할 수 있습니다. 명령이나 도구 인수에 비밀값을 넣지 마세요.

```bash
npx -y @yolfi/agent webhooks:verify --endpoint-id <endpointId> --payload ./raw-webhook.json --signature <signature>
```

호스팅 결제 링크와 공개 결제 조회에는 앱 API 키가 필요 없습니다. 비공개 Checkout Session 생성에는 별도의 서버 인증정보와 같은 주문의 재시도에 사용할 고정 멱등성 키가 필요합니다. 에이전트 OAuth는 앱 인증정보가 아닙니다.

## 검증

계정 인증, 코드 테스트, 실행 환경 비밀값 설치, 실제 결제 및 웹훅 전송 검증을 구분해 보고하세요. 연결 성공이나 브라우저 리다이렉트만으로 전체 결제 흐름을 검증할 수 없습니다.
