![Yolfi Agent Kit: pagos cripto con agentes de IA](../../assets/ai-agent-payment.png)

# Yolfi Agent Kit: pagos cripto con agentes de IA

Integra enlaces de pago con criptomonedas, checkout alojado y verificación de firmas de webhooks con tu agente de IA. El paquete incluye un servidor MCP local, una CLI JSON, un SDK de JavaScript y la habilidad Yolfi Payments para agentes.

```text
Añade pagos de Yolfi a este proyecto. Sigue https://docs.yolfi.com/ai
```

Envía este mensaje al agente dentro del proyecto. El agente inspecciona el código, elige una conexión compatible y continúa la implementación tras la autorización. El propietario solo aporta decisiones que falten, como la cartera receptora o el precio.

## Idiomas

[English](../../README.md), [Español](README.es.md), [Deutsch](README.de.md), [Français](README.fr.md), [简体中文](README.zh-CN.md), [Русский](README.ru.md), [हिन्दी](README.hi.md), [Türkçe](README.tr.md), [한국어](README.ko.md), [日本語](README.ja.md).

## Documentación

- [Integración con IA](https://docs.yolfi.com/en/agent-kit)
- [Conexiones del agente](https://docs.yolfi.com/en/agent-kit/connections)
- [API HTTP](https://docs.yolfi.com/en/api)
- [CLI](https://docs.yolfi.com/en/cli)
- [Guía completa del paquete en inglés](../../README.md)

## CLI local

Se requiere Node.js 18 o posterior. Usa npx; no hace falta una instalación global. Si falta autorización, el agente ejecuta setup, abre loginUrl para el propietario y continúa con checkin y auth:status. No configures un YOLFI_API_KEY de ejemplo: tiene prioridad sobre la credencial guardada.

```bash
npx -y @yolfi/agent help
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent setup --agent local-agent
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

## Conexión MCP

Un único servidor local ofrece herramientas, recursos y prompts. El cliente administra OAuth para https://app.yolfi.com/mcp. Comprueba la conexión remota con yolfi_auth_status en ese cliente; una CLI separada no lee su OAuth. Elige según las capacidades del entorno, no solo el nombre del agente.

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

## Reutilización y secretos

Lee primero la organización, carteras, enlaces relevantes, endpoints webhook y configuración del proyecto. Reutiliza valores aprobados y pregunta solo lo que falte. settlement:configure actualiza las redes indicadas mediante PATCH y conserva las demás. webhooks:add crea un endpoint independiente: busca y reutiliza uno existente antes.

```bash
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

Crea el archivo JSON dentro del proyecto antes de usar --json. npx no copia la carpeta examples del paquete al directorio de trabajo.

La CLI y MCP locales guardan el secreto de firma al crear o rotar un webhook y lo ocultan en la salida. Verifica con el ID del endpoint o YOLFI_WEBHOOK_SECRET. El SDK readWebhookSigningSecret(endpointId) permite transferirlo al gestor de secretos de la aplicación sin imprimirlo. Evita secretos en argumentos de comandos o herramientas.

```bash
npx -y @yolfi/agent webhooks:verify --endpoint-id <endpointId> --payload ./raw-webhook.json --signature <signature>
```

Los enlaces alojados y las consultas públicas de pagos no requieren una clave API de la aplicación. Crear Checkout Sessions privadas requiere una credencial de servidor independiente y una clave de idempotencia estable para reintentar el mismo pedido. OAuth del agente no es una credencial de la aplicación.

## Verificación

Distingue autorización, pruebas de código, instalación de secretos y verificación real del pago y la entrega de webhooks. Una conexión correcta o una redirección del navegador no prueba el flujo completo.
