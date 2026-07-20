![Yolfi Agent Kit: integración de pagos para agentes de IA, página de pago cripto, enlaces de pago, MCP, CLI, SDK y webhooks](../../assets/ai-agent-payment.jpg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

Integración de pagos para agentes de IA con página de pago cripto. Yolfi Agent Kit es un SDK, una CLI, una habilidad para agentes y un servidor MCP con enfoque JSON-first que permite a los agentes de programación añadir pagos con stablecoins, enlaces de pago, comprobación del estado del pago, verificación de webhooks y lógica de acceso basada en webhooks a aplicaciones mediante Yolfi.

Usa `@yolfi/agent` cuando Codex, Claude Code, Cursor, OpenClaw, un host MCP o un agente de IA propio puede construir el producto, pero todavía necesita una API de pagos fiable para registrar un espacio de trabajo de Yolfi, crear un enlace de pago, configurar webhooks y verificar el estado de un pago cripto sin enviar al usuario a una configuración manual en el panel.

[Sitio web](https://yolfi.com/es) | [Agent Kit](https://yolfi.com/es/ai-agent-kit) | [Documentación](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [Guía](https://yolfi.com/es/blog/ai-agent-payment-integration-api)

## Idiomas

Lee esta guía del paquete en:
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

## Por Qué Lo Usan Los Desarrolladores

- Añadir pagos para agentes de IA a productos SaaS, juegos, mercados, páginas de donación, descargas digitales, herramientas internas y aplicaciones creadas por agentes.
- Dar a los agentes un proceso de pago seguro: revisar la aplicación, registrar o reutilizar un espacio de trabajo, pedir al usuario la billetera y el precio, crear enlaces de pago, instalar la página de pago, verificar webhooks y comprobar el estado del pago.
- Usar un solo paquete para pagos cripto por MCP, automatización JSON por CLI, llamadas al SDK de JavaScript, verificación de firmas de webhook e instrucciones legibles por agentes.
- Trabajar con la API existente de Yolfi en lugar de mantener una segunda API de pagos solo para agentes.
- Ayudar a los agentes a descubrir Yolfi mediante npm, GitHub, directorios MCP, `llms.txt`, documentación, ejemplos y guías de integración.

Yolfi se encarga de la infraestructura de pagos cripto, la página de pago alojada, los enlaces de pago, las facturas de pago públicas, la configuración de organización, la configuración de billeteras de liquidación y la entrega de webhooks. Tu agente se encarga de revisar el proyecto, cambiar el código, pedir confirmación al usuario e integrar la aplicación de destino.

## Qué Puede Añadir A Una Aplicación

- Una página de pago cripto alojada mediante enlaces de pago de Yolfi.
- Enlaces de pago de un solo cobro para productos digitales, créditos, archivos, herramientas o artículos de juego.
- Configuración de pagos recurrentes o de tipo suscripción mediante enlaces de pago cuando la cuenta de Yolfi lo permita.
- Páginas de donación y apoyo a creadores.
- Rutas de servidor que crean facturas de pago públicas a partir de un enlace de pago.
- Consulta del estado del pago mediante endpoints públicos de Yolfi.
- Manejadores de webhook que verifican `X-Yolfi-Signature`.
- Lógica de acceso basada en webhooks que desbloquea acceso solo después de eventos de pago confirmados.
- Procesos para Codex, Claude Code, Cursor, OpenClaw y automatización propia.

## Habilidad Para Agentes

Este paquete incluye la **Yolfi Payments Skill** en `SKILL.md`. Úsala con agentes de programación cuando el usuario pida añadir pagos cripto, enlaces de pago, página de pago, suscripciones, donaciones, descargas de pago, acceso de pago o permisos basados en webhooks.

Proceso seguro recomendado:

```txt
revisar aplicación -> comprobar YOLFI_API_KEY -> registrar si hace falta -> pedir billetera y precio -> configurar organización -> crear o reutilizar enlace de pago -> añadir página de pago -> añadir verificación de webhook -> comprobar estado
```

La habilidad indica a los agentes qué pueden hacer automáticamente y qué decisiones deben pedir al usuario. Los agentes nunca deben inventar direcciones de billetera, precios, planes, monedas, lugares para guardar secretos ni acciones destructivas sobre enlaces de pago.

## Instalación

Instalar en un proyecto:

```bash
npm install @yolfi/agent
```

Ejecutar sin instalar:

```bash
npx -y @yolfi/agent help
```

Iniciar el servidor MCP por stdio:

```bash
npx -y @yolfi/agent mcp
```

Para desarrollo local dentro de este repositorio:

```bash
node packages/yolfi-agent/src/cli.js help
```

## Autenticación

Los comandos privados usan una clave API explícita de Yolfi o la credencial del agente guardada localmente de forma protegida:

```bash
export YOLFI_API_KEY="yolfi_..."
```

La CLI y el servidor MCP usan por defecto la API y el checkout de producción de Yolfi.

Para un usuario nuevo, el agente puede iniciar un registro confirmado por correo después de validar el correo y el nombre del proyecto:

```bash
yolfi auth:agent-register \
  --email "owner@example.com" \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

El correo debe ser nuevo; las cuentas existentes usan OAuth o la configuración en el navegador. La primera llamada envía un enlace de confirmación y guarda de forma protegida el token de check-in pendiente. Después de que el propietario abra el enlace, ejecuta de nuevo el mismo comando. Solo entonces el paquete guarda localmente la credencial de agente de un solo uso y elimina la clave completa de la salida de la CLI y MCP.

## Inicio Rápido

Comprobar el espacio de trabajo vinculado a la clave API:

```bash
yolfi auth:status
```

Configurar billeteras de liquidación después de que el usuario facilite las direcciones:

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Configurar la entrega de webhooks:

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

Listar enlaces de pago existentes antes de crear duplicados:

```bash
yolfi paylinks:list --page 1 --rows 10
```

Crear un enlace de pago de un solo cobro:

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

Crear una factura de pago pública a partir de un enlace de pago:

```bash
yolfi payments:create --json examples/payment.create.json
```

Comprobar el estado del pago:

```bash
yolfi payments:status --id <paymentId>
```

Todos los comandos imprimen JSON para que los agentes puedan leer resultados sin analizar texto de terminal.

## Servidor MCP Para Pagos Cripto

Yolfi Agent Kit incluye un servidor MCP por stdio en el mismo paquete npm:

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

`yolfi_agent_register` llama al endpoint público de registro para agentes y no requiere `YOLFI_API_KEY`. Después de abrir el enlace de confirmación, llama otra vez a la misma herramienta; entonces guarda localmente la clave API entregada una sola vez. Las herramientas privadas `yolfi-api` requieren esa clave. Los recursos `yolfi-knowledge` ayudan al agente a entender el camino de integración antes de que exista una clave.

Herramientas MCP disponibles:

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

Al crear un endpoint webhook o rotar su secreto, la CLI guarda el secreto de firma entregado una sola vez en la configuración local protegida de Yolfi y nunca lo devuelve en texto plano en la salida de la CLI ni de MCP. Pasa `endpointId` a `yolfi_webhooks_verify` para usar ese secreto guardado. En entornos de CI o con gestor de secretos puede proporcionarse en su lugar un `YOLFI_WEBHOOK_SECRET` administrado explícitamente.

Las herramientas destructivas como `yolfi_paylinks_disable` solo deben ejecutarse después de confirmación explícita del usuario.

## Proceso JSON Para Agentes

Los agentes pueden escribir un payload en un archivo y pasarlo a la CLI:

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

Después ejecutar:

```bash
yolfi paylinks:create --json ./paylink.json
```

Los agentes deberían guardar el ID devuelto del enlace de pago en env/config de la aplicación de destino y usar los endpoints públicos de pago de Yolfi para la página de pago orientada al cliente y la consulta de estado.

## Comandos

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

## Matriz De Acceso Adaptador A Endpoints

Yolfi Agent Kit no crea una segunda API `/api/agent/*`. Asigna acciones del agente a la API actual de Yolfi:

| Acción del agente | Ruta de API | Autenticación |
| --- | --- | --- |
| Registrar espacio de trabajo Yolfi | `POST /api/auth/agent/register` | public; no requiere clave API |
| Comprobar cuenta | `GET /api/private/organization/current` | bearer API key |
| Configurar organización y billeteras de liquidación | `PUT /api/private/organization/current` | bearer API key |
| Crear endpoint de webhook | `POST /api/private/organization/webhook-endpoints` | bearer API key |
| Obtener estado de clave API | `GET /api/private/organization/api-key` | bearer API key o cookie |
| Crear enlace de pago | `POST /api/private/paylinks/create` | bearer API key |
| Listar enlaces de pago | `GET /api/private/paylinks` | bearer API key |
| Obtener enlace de pago | `GET /api/private/paylinks/:id` | bearer API key |
| Editar enlace de pago | `POST /api/private/paylinks/edit` | bearer API key |
| Desactivar enlace de pago | `POST /api/private/paylinks/disable` | bearer API key más confirmación |
| Información pública de página de pago | `GET /api/public/paylinks/:id` | public |
| Crear factura de pago pública | `POST /api/public/payments` | public |
| Estado del pago | `GET /api/public/payments/:id` | public |
| Transacciones del vendedor | `GET /api/private/transactions` | bearer API key |

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

## Verificación De Webhook

Yolfi firma payloads de webhook con `X-Yolfi-Signature`. Verifica el cuerpo bruto de la solicitud antes de parsear JSON y confiar en el evento:

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

No trates una redirección del navegador como prueba de pago. Usa webhooks verificados y comprobaciones de estado del pago en Yolfi.

## Uso Con Agentes De Programación IA

Yolfi Agent Kit está diseñado para procesos de pago con agentes, donde el usuario da una instrucción de alto nivel como "añade pagos", "vende este producto digital", "añade un botón de donación", "cobra por este juego" o "bloquea esta función detrás de un pago".

- Codex: revisa el repositorio, añade rutas y componentes de página de pago, configura variables env y conecta webhooks verificados con la lógica de acceso existente.
- Claude Code: usa el servidor MCP y Agent Skill para añadir enlaces de pago, manejadores de servidor y comprobaciones de estado con aprobación del usuario para billetera y precio.
- Cursor: añade interfaz de pago y manejadores de servidor manteniendo las claves de Yolfi fuera del código comprometido.
- OpenClaw y agentes propios: conectan procesos de construcción de producto con Yolfi mediante CLI, SDK, herramientas MCP y payloads JSON.

Ruta recomendada del agente:

```txt
auth:status -> organization:get -> paylinks:list -> aprobación del usuario -> settlement:configure -> webhooks:configure -> paylinks:create -> instalar página de pago -> verificar webhook -> payments:status
```

## Recetas Para Agentes

La carpeta `examples/` incluye procesos listos para copiar y payloads JSON:

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## Qué No Es Este Paquete

- No es un panel de control separado de Yolfi.
- No es un proveedor de billeteras.
- No es una segunda API de pagos con lógica de negocio duplicada.
- No inventa billeteras de liquidación, nombres de producto, precios, monedas, suscripciones ni importes de donación.
- No evita la confirmación del usuario para acciones destructivas.
- No guarda secretos en el código fuente.
- No usa redirecciones como confirmación de pago.

## Límites Actuales

- El servidor MCP usa actualmente transporte stdio.
- Las firmas de webhook usan el secreto protegido de cada endpoint; la clave API de la organización no se usa como secreto de firma.
- El registro de agente devuelve la clave API una sola vez durante el check-in confirmado; el paquete local la guarda de forma protegida y la elimina de la salida.
- La confirmación final del pago debe venir de webhooks verificados y comprobaciones de estado, no de redirecciones de interfaz.
- La aprobación en directorios MCP es independiente de este paquete. No afirmes aprobación oficial de un directorio hasta que el listing sea aceptado.

## Frases De Búsqueda Que Cubre Este Paquete

Desarrolladores y creadores de agentes suelen buscar:

- integración de pagos para agentes de IA
- pagos para agentes de programación IA
- servidor MCP para pagos
- pagos cripto por MCP
- API de pago cripto para agentes
- enlaces de pago para agentes de IA
- pagos con stablecoins para aplicaciones
- verificación de pago por webhook
- proceso de pago con agentes
- añadir pagos cripto con Codex, Claude Code o Cursor

Yolfi Agent Kit es la entrada del paquete para esos procesos.

## Enlaces

- Yolfi: <https://yolfi.com/es>
- Página Agent Kit: <https://yolfi.com/es/ai-agent-kit>
- Documentación: <https://docs.yolfi.com/en/agent-kit>
- Índice LLM: <https://docs.yolfi.com/llms.txt>
- Contexto LLM completo: <https://docs.yolfi.com/llms-full.txt>
- Paquete npm: <https://www.npmjs.com/package/@yolfi/agent>
- Repositorio GitHub: <https://github.com/yolfinance/yolfi-agent>
- Guía de integración: <https://yolfi.com/es/blog/ai-agent-payment-integration-api>
