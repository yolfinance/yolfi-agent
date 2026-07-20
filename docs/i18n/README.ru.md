![Yolfi Agent Kit: интеграция платежей для ИИ-агентов, криптовалютная страница оплаты, платежные ссылки, MCP, командная строка, SDK и Webhook-события](../../assets/ai-agent-payment.jpg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

Интеграция платежей для ИИ-агентов через криптовалютную страницу оплаты. Yolfi Agent Kit — это JSON-first SDK, командная строка, навык для агентов и MCP-сервер, который позволяет агентам-разработчикам добавлять в приложения оплату в стейблкоинах, платежные ссылки, проверку статуса платежа, проверку Webhook-подписей и доступ на основе Webhook-событий через Yolfi.

Используйте `@yolfi/agent`, когда Codex, Claude Code, Cursor, OpenClaw, MCP-хост или собственный ИИ-агент может собрать продукт, но ему все еще нужен надежный платежный API, чтобы зарегистрировать рабочее пространство Yolfi, создать платежную ссылку, настроить Webhook-события и проверить статус криптовалютного платежа без ручной настройки через панель управления.

[Сайт](https://yolfi.com/ru) | [Agent Kit](https://yolfi.com/ru/ai-agent-kit) | [Документация](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [Руководство](https://yolfi.com/ru/blog/ai-agent-payment-integration-api)

## Языки

Читайте это руководство по пакету на других языках:
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

## Зачем Разработчики Используют Это

- Добавлять платежи для ИИ-агентов в SaaS-продукты, игры, маркетплейсы, страницы пожертвований, цифровые загрузки, внутренние инструменты и приложения, собранные агентами.
- Давать агентам безопасный платежный процесс: изучить приложение, зарегистрировать или переиспользовать рабочее пространство, спросить у пользователя кошелек и цену, создать платежные ссылки, установить страницу оплаты, проверить Webhook-события и статус платежа.
- Использовать один пакет для криптоплатежей через MCP, JSON-автоматизации через командную строку, вызовов JavaScript SDK, проверки Webhook-подписей и инструкций, понятных агентам.
- Работать с существующим API Yolfi, не поддерживая вторую платежную API только для агентов.
- Помогать агентам находить Yolfi через npm, GitHub, каталоги MCP, `llms.txt`, документацию, примеры и интеграционные руководства.

Yolfi отвечает за криптовалютную платежную инфраструктуру, размещенную страницу оплаты, платежные ссылки, публичные платежные счета, настройки организации, настройку кошельков для расчетов и доставку Webhook-событий. Ваш агент отвечает за изучение проекта, изменения в коде, подтверждения пользователя и интеграцию в целевое приложение.

## Что Можно Добавить В Приложение

- Размещенную криптовалютную страницу оплаты через платежные ссылки Yolfi.
- Одноразовые платежные ссылки для цифровых продуктов, кредитов, файлов, инструментов или игровых предметов.
- Настройку регулярных платежей или подписок через платежные ссылки, если аккаунт Yolfi это поддерживает.
- Страницы пожертвований и поддержки авторов.
- Серверные маршруты, которые создают публичные платежные счета на основе платежной ссылки.
- Проверку статуса платежа через публичные платежные endpoints Yolfi.
- Обработчики Webhook-событий, которые проверяют `X-Yolfi-Signature`.
- Логику доступа на основе Webhook-событий, которая открывает доступ только после подтвержденного платежа.
- Процессы для Codex, Claude Code, Cursor, OpenClaw и собственной автоматизации.

## Навык Для Агентов

В пакет входит **Yolfi Payments Skill** в файле `SKILL.md`. Используйте его с агентами-разработчиками, когда пользователь просит добавить криптоплатежи, платежные ссылки, страницу оплаты, подписки, пожертвования, платные загрузки, платный доступ или доступ на основе Webhook-событий.

Рекомендуемый безопасный процесс:

```txt
изучить приложение -> проверить YOLFI_API_KEY -> зарегистрировать при необходимости -> спросить кошелек и цену -> настроить организацию -> создать или переиспользовать платежную ссылку -> добавить страницу оплаты -> добавить проверку Webhook -> проверить статус
```

Навык объясняет агентам, что можно делать автоматически, а какие решения нужно спрашивать у пользователя. Агенты не должны придумывать адреса кошельков, цены, тарифы, валюты, места хранения секретов или разрушительные действия с платежными ссылками.

## Установка

Установить в проект:

```bash
npm install @yolfi/agent
```

Запустить без установки:

```bash
npx -y @yolfi/agent help
```

Запустить stdio MCP-сервер:

```bash
npx -y @yolfi/agent mcp
```

Для локальной разработки внутри этого репозитория:

```bash
node packages/yolfi-agent/src/cli.js help
```

## Авторизация

Закрытые команды используют явный API-ключ Yolfi или защищённые учётные данные агента, сохранённые локально:

```bash
export YOLFI_API_KEY="yolfi_..."
```

CLI и MCP-сервер по умолчанию используют production API и checkout Yolfi.

Для нового пользователя агент может начать регистрацию с подтверждением по почте после согласования адреса и названия проекта:

```bash
yolfi auth:agent-register \
  --email "owner@example.com" \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

Почта должна быть новой; существующие аккаунты используют OAuth или настройку через браузер. Первый вызов отправляет ссылку подтверждения и защищённо сохраняет локальный check-in token. После того как владелец откроет ссылку, запустите ту же команду ещё раз. Только тогда пакет сохранит одноразово выданные учётные данные агента и удалит полный ключ из вывода CLI и MCP.

## Быстрый Старт

Проверить рабочее пространство, связанное с API-ключом:

```bash
yolfi auth:status
```

Настроить кошельки для расчетов после того, как пользователь предоставит адреса:

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Настроить доставку Webhook-событий:

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

Перед созданием дублей посмотреть существующие платежные ссылки:

```bash
yolfi paylinks:list --page 1 --rows 10
```

Создать одноразовую платежную ссылку:

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

Создать публичный платежный счет на основе платежной ссылки:

```bash
yolfi payments:create --json examples/payment.create.json
```

Проверить статус платежа:

```bash
yolfi payments:status --id <paymentId>
```

Все команды выводят JSON, чтобы агенты могли читать результат без разбора текста терминала.

## MCP-Сервер Для Криптоплатежей

Yolfi Agent Kit включает stdio MCP-сервер в том же npm-пакете:

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

`yolfi_agent_register` вызывает публичный endpoint регистрации агента и не требует `YOLFI_API_KEY`. После открытия ссылки подтверждения вызовите тот же инструмент ещё раз: он локально сохранит API-ключ, который выдаётся один раз. Закрытым инструментам `yolfi-api` нужен этот ключ. Ресурсы `yolfi-knowledge` помогают агенту понять путь интеграции до появления ключа.

Доступные MCP-инструменты:

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

При создании Webhook endpoint или ротации его секрета CLI сохраняет одноразово выданный signing secret в защищённой локальной конфигурации Yolfi и никогда не возвращает его в открытом виде в выводе CLI или MCP. Чтобы использовать сохранённый секрет, передайте `endpointId` в `yolfi_webhooks_verify`. Для CI или окружений с менеджером секретов вместо него можно явно задать управляемый `YOLFI_WEBHOOK_SECRET`.

Разрушительные инструменты вроде `yolfi_paylinks_disable` можно запускать только после явного подтверждения пользователя.

## JSON-Процесс Для Агентов

Агенты могут записать payload в файл и передать его в командную строку:

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

Затем запустить:

```bash
yolfi paylinks:create --json ./paylink.json
```

Агентам стоит хранить возвращенный идентификатор платежной ссылки в env/config целевого приложения и использовать публичные платежные endpoints Yolfi для клиентской страницы оплаты и проверки статуса.

## Команды

```bash
yolfi auth:agent-register --email "owner@example.com" --project-name "App" --agent-name "Codex" --integration-intent accept_payments
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

## Матрица Adapter-Доступа К Endpoints

Yolfi Agent Kit не создает вторую API `/api/agent/*`. Он сопоставляет действия агента с текущим API Yolfi:

| Действие агента | API endpoint | Авторизация |
| --- | --- | --- |
| Зарегистрировать рабочее пространство Yolfi | `POST /api/auth/agent/register` | public; API-ключ не нужен |
| Проверить аккаунт | `GET /api/private/organization/current` | bearer API key |
| Настроить организацию и кошельки для расчетов | `PUT /api/private/organization/current` | bearer API key |
| Создать эндпоинт вебхука | `POST /api/private/organization/webhook-endpoints` | bearer API key |
| Проверить статус API-ключа | `GET /api/private/organization/api-key` | bearer API key или cookie |
| Создать платежную ссылку | `POST /api/private/paylinks/create` | bearer API key |
| Получить список платежных ссылок | `GET /api/private/paylinks` | bearer API key |
| Получить платежную ссылку | `GET /api/private/paylinks/:id` | bearer API key |
| Изменить платежную ссылку | `POST /api/private/paylinks/edit` | bearer API key |
| Отключить платежную ссылку | `POST /api/private/paylinks/disable` | bearer API key плюс подтверждение |
| Получить публичную информацию страницы оплаты | `GET /api/public/paylinks/:id` | public |
| Создать публичный платежный счет | `POST /api/public/payments` | public |
| Проверить статус платежа | `GET /api/public/payments/:id` | public |
| Транзакции продавца | `GET /api/private/transactions` | bearer API key |

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

## Проверка Webhook

Yolfi подписывает Webhook payload через `X-Yolfi-Signature`. Проверяйте сырое тело запроса до разбора JSON и доверия событию:

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

Не считайте редирект в браузере доказательством оплаты. Используйте проверенные Webhook-события и проверки статуса платежа Yolfi.

## Использование С ИИ-Агентами Для Разработки

Yolfi Agent Kit создан для агентных платежных процессов, где пользователь дает высокоуровневую команду вроде "добавь оплату", "продавай этот цифровой продукт", "добавь кнопку пожертвования", "сделай оплату для этой игры" или "закрой эту функцию платным доступом".

- Codex: изучает репозиторий, добавляет маршруты и компоненты страницы оплаты, настраивает env-переменные и подключает проверенные Webhook-события к существующей логике доступа.
- Claude Code: использует MCP-сервер и Agent Skill, чтобы добавлять платежные ссылки, серверные обработчики и проверки статуса с подтверждением пользователя для кошелька и цены.
- Cursor: добавляет платежный интерфейс и серверные обработчики, не записывая ключи Yolfi в исходный код.
- OpenClaw и собственные агенты: соединяют процессы сборки продукта с Yolfi через командную строку, SDK, MCP-инструменты и JSON payloads.

Рекомендуемый путь агента:

```txt
auth:status -> organization:get -> paylinks:list -> подтверждение пользователя -> settlement:configure -> webhooks:configure -> paylinks:create -> установить страницу оплаты -> проверить webhook -> payments:status
```

## Рецепты Для Агентов

Папка `examples/` содержит готовые процессы и JSON payloads:

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## Чем Этот Пакет Не Является

- Это не отдельная панель управления Yolfi.
- Это не провайдер кошельков.
- Это не вторая платежная API с дублирующей бизнес-логикой.
- Он не придумывает кошельки для расчетов, названия продуктов, цены, валюты, подписки или суммы пожертвований.
- Он не обходит подтверждение пользователя для разрушительных действий.
- Он не хранит секреты в исходном коде.
- Он не использует редиректы как подтверждение оплаты.

## Текущие Ограничения

- MCP-сервер сейчас использует stdio transport.
- Для Webhook-подписи используется защищённый секрет соответствующего endpoint; API-ключ организации не используется как signing secret.
- Регистрация агента возвращает API-ключ один раз при подтверждённом check-in; локальный пакет защищённо сохраняет его и удаляет из вывода.
- Финальное подтверждение платежа должно приходить из проверенных Webhook-событий и проверки статуса платежа, а не из UI-редиректов.
- Одобрение в каталогах MCP не входит в этот пакет. Не заявляйте об официальном одобрении каталога, пока listing не принят.

## Поисковые Фразы, Которые Закрывает Пакет

Разработчики и создатели агентов часто ищут:

- интеграция платежей для ИИ-агента
- платежи для ИИ-агентов-разработчиков
- MCP-сервер для платежей
- криптоплатежи через MCP
- криптовалютная платежная API для агентов
- платежные ссылки для ИИ-агентов
- оплата в стейблкоинах для приложений
- проверка платежа через Webhook
- агентный платежный процесс
- добавить криптоплатежи через Codex, Claude Code или Cursor

Yolfi Agent Kit — входная точка пакета для этих сценариев.

## Ссылки

- Yolfi: <https://yolfi.com/ru>
- Страница Agent Kit: <https://yolfi.com/ru/ai-agent-kit>
- Документация: <https://docs.yolfi.com/en/agent-kit>
- LLM index: <https://docs.yolfi.com/llms.txt>
- Полный LLM-контекст: <https://docs.yolfi.com/llms-full.txt>
- npm package: <https://www.npmjs.com/package/@yolfi/agent>
- GitHub repo: <https://github.com/yolfinance/yolfi-agent>
- Руководство по интеграции: <https://yolfi.com/ru/blog/ai-agent-payment-integration-api>
