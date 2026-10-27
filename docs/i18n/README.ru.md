![Yolfi Agent Kit: криптоплатежи через ИИ-агентов](../../assets/ai-agent-payment.png)

# Yolfi Agent Kit: криптоплатежи через ИИ-агентов

Подключайте криптовалютные платежные ссылки, готовую страницу оплаты и проверку подписей вебхуков через своего ИИ-агента. Пакет включает локальный MCP-сервер, JSON CLI, JavaScript SDK и навык Yolfi Payments для агентов.

```text
Добавь платежи Yolfi в этот проект. Следуй документации: https://docs.yolfi.com/ai
```

Отправьте это сообщение агенту в нужном проекте. Он изучит код, выберет доступный способ подключения и продолжит реализацию после авторизации. Владелец предоставляет только недостающие решения, например адрес получения средств или цену.

## Языки

[English](../../README.md), [Español](README.es.md), [Deutsch](README.de.md), [Français](README.fr.md), [简体中文](README.zh-CN.md), [Русский](README.ru.md), [हिन्दी](README.hi.md), [Türkçe](README.tr.md), [한국어](README.ko.md), [日本語](README.ja.md).

## Документация

- [Интеграция через ИИ](https://docs.yolfi.com/en/agent-kit)
- [Подключение агента](https://docs.yolfi.com/en/agent-kit/connections)
- [HTTP API](https://docs.yolfi.com/en/api)
- [CLI](https://docs.yolfi.com/en/cli)
- [Полное руководство пакета на английском](../../README.md)

## Локальный CLI

Требуется Node.js 18 или новее. Используйте npx, глобальная установка не обязательна. Если авторизация отсутствует, агент запускает setup, открывает loginUrl для владельца, затем выполняет checkin и auth:status. Не устанавливайте фиктивный YOLFI_API_KEY: он перекрывает сохраненный ключ.

```bash
npx -y @yolfi/agent help
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent setup --agent local-agent
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

## Подключение MCP

Один локальный сервер предоставляет все инструменты, ресурсы и подсказки. Для удаленного сервера https://app.yolfi.com/mcp авторизацией OAuth управляет клиент. Проверяйте ее через yolfi_auth_status в этом клиенте; отдельный CLI не читает его OAuth. Выбор способа зависит от возможностей среды, а не названия агента.

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

## Повторное использование и секреты

Сначала прочитайте организацию, кошельки, все подходящие платежные ссылки, вебхуки и настройки проекта. Используйте существующие согласованные значения и спрашивайте только недостающие. settlement:configure обновляет переданные сети через PATCH, сохраняя остальные. webhooks:add создает отдельный endpoint: сначала найдите и используйте существующий.

```bash
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

Создайте JSON-файл в целевом проекте перед вызовом --json. Папка examples из пакета не появляется в рабочем каталоге после запуска npx.

Локальные CLI/MCP сохраняют signing secret при создании или ротации вебхука в защищенной конфигурации и скрывают его из вывода. Проверяйте подпись через endpoint ID или YOLFI_WEBHOOK_SECRET. SDK readWebhookSigningSecret(endpointId) позволяет передать секрет в хранилище секретов приложения без вывода в журнал. Не передавайте секреты в аргументах команд или инструментов.

```bash
npx -y @yolfi/agent webhooks:verify --endpoint-id <endpointId> --payload ./raw-webhook.json --signature <signature>
```

Для готовой платежной ссылки и публичной проверки платежа API-ключ приложения не нужен. Приватное создание Checkout Session требует отдельного серверного ключа и постоянного idempotency key для повторов одного заказа. OAuth агента не является ключом приложения.

## Проверка

Отдельно укажите авторизацию, тесты кода, установку секретов в среду приложения и реальную проверку оплаты/доставки вебхука. Подключение аккаунта и переход браузера не доказывают работоспособность полного платежного процесса.
