![Yolfi Agent Kit: Zahlungsintegration für KI-Agenten, Krypto-Zahlungsseite, Zahlungslinks, MCP, CLI, SDK und Webhooks](../../assets/yolfi-agent-banner.svg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

Zahlungsintegration für KI-Agenten mit Krypto-Zahlungsseite. Yolfi Agent Kit ist ein JSON-first SDK, eine CLI, eine Agent Skill und ein MCP-Server, mit dem KI-Programmieragenten Stablecoin-Zahlungen, Zahlungslinks, Zahlungsstatus-Prüfungen, Webhook-Signaturprüfung und webhookbasierte Zugriffslogik über Yolfi in Anwendungen einbauen können.

Nutze `@yolfi/agent`, wenn Codex, Claude Code, Cursor, OpenClaw, ein MCP-Host oder ein eigener KI-Agent das Produkt bauen kann, aber noch eine zuverlässige Zahlungs-API braucht, um einen Yolfi-Arbeitsbereich zu registrieren, einen Zahlungslink zu erstellen, Webhooks zu konfigurieren und den Status einer Krypto-Zahlung zu prüfen, ohne den Nutzer durch manuelle Dashboard-Einrichtung zu schicken.

[Website](https://yolfi.com/de) | [Agent Kit](https://yolfi.com/de/ai-agent-kit) | [Dokumentation](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [Leitfaden](https://yolfi.com/de/blog/ai-agent-payment-integration-api)

## Sprachen

Lies diese Paket-Anleitung auf:
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

## Warum Entwickler Es Nutzen

- KI-Agenten-Zahlungen in SaaS-Produkte, Spiele, Marktplätze, Spendenseiten, digitale Downloads, interne Tools und agentenerstellte Apps einbauen.
- Agenten einen sicheren Zahlungsablauf geben: Anwendung prüfen, Arbeitsbereich registrieren oder wiederverwenden, Nutzer nach Wallet und Preis fragen, Zahlungslinks erstellen, Zahlungsseite einbauen, Webhooks prüfen und Zahlungsstatus kontrollieren.
- Ein Paket für MCP-Krypto-Zahlungen, JSON-CLI-Automatisierung, JavaScript-SDK-Aufrufe, Webhook-Signaturprüfung und agentenlesbare Anweisungen nutzen.
- Mit der bestehenden Yolfi-API arbeiten, statt eine zweite Zahlungs-API nur für Agenten zu pflegen.
- Agenten helfen, Yolfi über npm, GitHub, MCP-Verzeichnisse, `llms.txt`, Dokumentation, Beispiele und Integrationsleitfäden zu finden.

Yolfi übernimmt Krypto-Zahlungsinfrastruktur, gehostete Zahlungsseite, Zahlungslinks, öffentliche Zahlungsrechnungen, Organisationseinstellungen, Settlement-Wallet-Konfiguration und Webhook-Zustellung. Dein Agent übernimmt Projektprüfung, Codeänderungen, Nutzerbestätigung und Integration in die Zielanwendung.

## Was Es Einer Anwendung Hinzufügen Kann

- Eine gehostete Krypto-Zahlungsseite über Yolfi-Zahlungslinks.
- Einmalige Zahlungslinks für digitale Produkte, Credits, Dateien, Tools oder Spielgegenstände.
- Wiederkehrende Zahlungen oder abonnementartige Zahlungslink-Einrichtung, wenn der Yolfi-Account sie unterstützt.
- Spenden- und Creator-Support-Seiten.
- Serverrouten, die öffentliche Zahlungsrechnungen aus einem Zahlungslink erstellen.
- Zahlungsstatus-Abfrage über öffentliche Yolfi-Zahlungsendpunkte.
- Webhook-Handler, die `X-Yolfi-Signature` prüfen.
- Webhookbasierte Berechtigungslogik, die Zugriff erst nach bestätigten Zahlungsereignissen freischaltet.
- Agentenabläufe für Codex, Claude Code, Cursor, OpenClaw und eigene Automatisierung.

## Agent Skill

Dieses Paket enthält die **Yolfi Payments Skill** in `SKILL.md`. Nutze sie mit Programmieragenten, wenn der Nutzer Krypto-Zahlungen, Zahlungslinks, eine Zahlungsseite, Abonnements, Spenden, bezahlte Downloads, bezahlten Zugang oder webhookbasierte Berechtigungen hinzufügen möchte.

Empfohlener sicherer Ablauf:

```txt
Anwendung prüfen -> YOLFI_API_KEY prüfen -> bei Bedarf registrieren -> Nutzer nach Wallet und Preis fragen -> Organisation konfigurieren -> Zahlungslink erstellen oder wiederverwenden -> Zahlungsseite hinzufügen -> Webhook-Prüfung hinzufügen -> Status prüfen
```

Die Skill sagt Agenten, was sie automatisch tun dürfen und welche Entscheidungen sie dem Nutzer überlassen müssen. Agenten dürfen keine Wallet-Adressen, Preise, Tarife, Währungen, Speicherorte für Secrets oder destruktive Zahlungslink-Aktionen erfinden.

## Installation

In einem Projekt installieren:

```bash
npm install @yolfi/agent
```

Ohne Installation ausführen:

```bash
npx -y @yolfi/agent help
```

Den stdio-MCP-Server starten:

```bash
npx -y @yolfi/agent mcp
```

Für lokale Entwicklung in diesem Repository:

```bash
node packages/yolfi-agent/src/cli.js help
```

## Authentifizierung

Private Befehle verwenden einen Yolfi-Organisations-API-Schlüssel:

```bash
export YOLFI_API_KEY="yolfi_..."
export YOLFI_API_BASE_URL="https://app.yolfi.com/api"
export YOLFI_PAY_BASE_URL="https://pay.yolfi.com"
```

`YOLFI_API_BASE_URL` und `YOLFI_PAY_BASE_URL` sind optional, außer du musst eine nicht standardmäßige Yolfi-Umgebung ansprechen.

Wenn die Zielanwendung noch keinen `YOLFI_API_KEY` hat, kann ein Agent über den Agent-Registrierungsendpunkt einen Arbeitsbereich registrieren:

```bash
yolfi auth:agent-register \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

Der zurückgegebene API-Schlüssel wird einmal angezeigt. Speichere ihn in einer ignorierten Env-Datei, einem Deployment-Secret oder einem Secret-Manager. Gib den vollständigen Schlüssel nicht in Logs aus, committe ihn nicht und schreibe ihn nicht in README-Dateien des Zielprojekts.

## Schnellstart

Den mit dem API-Schlüssel verbundenen Arbeitsbereich prüfen:

```bash
yolfi auth:status
```

Settlement-Wallets konfigurieren, nachdem der Nutzer Wallet-Adressen bereitgestellt hat:

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Webhook-Zustellung konfigurieren:

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

Bestehende Zahlungslinks auflisten, bevor Du Duplikate erstellst:

```bash
yolfi paylinks:list --page 1 --rows 10
```

Einen einmaligen Zahlungslink erstellen:

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

Eine öffentliche Zahlungsrechnung aus einem Zahlungslink erstellen:

```bash
yolfi payments:create --json examples/payment.create.json
```

Zahlungsstatus prüfen:

```bash
yolfi payments:status --id <paymentId>
```

Jeder CLI-Befehl gibt JSON aus, damit Agenten Ergebnisse lesen können, ohne Terminaltext zu parsen.

## MCP-Server Für Krypto-Zahlungen

Yolfi Agent Kit enthält einen stdio-MCP-Server im selben npm-Paket:

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

`yolfi-api`-Tools rufen die Yolfi-API auf und benötigen `YOLFI_API_KEY`. `yolfi-knowledge`-Ressourcen helfen Agenten, den Integrationspfad zu verstehen, bevor ein Schlüssel vorhanden ist.

Verfügbare MCP-Tools:

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

Destruktive Tools wie `yolfi_paylinks_disable` dürfen nur nach ausdrücklicher Nutzerbestätigung laufen.

## JSON-Ablauf Für Agenten

Agenten können eine Payload-Datei schreiben und an die CLI übergeben:

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

Dann ausführen:

```bash
yolfi paylinks:create --json ./paylink.json
```

Agenten sollten die zurückgegebene Zahlungslink-ID in Env/Config der Zielanwendung speichern und die öffentlichen Yolfi-Zahlungsendpunkte für kundenseitige Zahlungsseite und Statusabfrage verwenden.

## Befehle

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

## Endpoint-Adapter-Matrix

Yolfi Agent Kit erstellt keine zweite `/api/agent/*`-API. Es ordnet Agentenaktionen der aktuellen Yolfi-API zu:

| Agentenaktion | API-Endpunkt | Auth |
| --- | --- | --- |
| Yolfi-Arbeitsbereich registrieren | `POST /api/auth/agent/register` | public |
| Konto prüfen | `GET /api/private/organization/current` | bearer API key |
| Organisation, Webhook und Settlement-Wallets konfigurieren | `PUT /api/private/organization/current` | bearer API key |
| API-Schlüsselstatus abrufen | `GET /api/private/organization/api-key` | bearer API key oder cookie |
| Zahlungslink erstellen | `POST /api/private/paylinks/create` | bearer API key |
| Zahlungslinks auflisten | `GET /api/private/paylinks` | bearer API key |
| Zahlungslink abrufen | `GET /api/private/paylinks/:id` | bearer API key |
| Zahlungslink bearbeiten | `POST /api/private/paylinks/edit` | bearer API key |
| Zahlungslink deaktivieren | `POST /api/private/paylinks/disable` | bearer API key plus Bestätigung |
| Öffentliche Zahlungsseiten-Information | `GET /api/public/paylinks/:id` | public |
| Öffentliche Zahlungsrechnung erstellen | `POST /api/public/payments` | public |
| Zahlungsstatus | `GET /api/public/payments/:id` | public |
| Händlertransaktionen | `GET /api/private/transactions` | bearer API key |

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

## Webhook-Prüfung

Yolfi signiert Webhook-Payloads mit `X-Yolfi-Signature`. Prüfe den rohen Request-Body, bevor Du JSON parst und dem Ereignis vertraust:

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

Behandle eine Browser-Weiterleitung nicht als Zahlungsnachweis. Nutze geprüfte Webhooks und Yolfi-Zahlungsstatusabfragen.

## Nutzung Mit KI-Programmieragenten

Yolfi Agent Kit ist für agentische Zahlungsabläufe gedacht, in denen der Nutzer eine übergeordnete Anweisung gibt wie "Zahlungen hinzufügen", "dieses digitale Produkt verkaufen", "einen Spendenbutton hinzufügen", "für dieses Spiel Geld verlangen" oder "diese Funktion hinter Zahlung schützen".

- Codex: Repository prüfen, Zahlungsseiten-Routen/Komponenten hinzufügen, Env-Variablen konfigurieren und geprüfte Webhooks in bestehende Berechtigungslogik einbinden.
- Claude Code: MCP-Server und Agent Skill nutzen, um Zahlungslinks, Server-Handler und Statusprüfungen mit Nutzerfreigabe für Wallet- und Preisentscheidungen hinzuzufügen.
- Cursor: Zahlungsoberfläche und serverseitige Handler hinzufügen, ohne Yolfi-Schlüssel in committeten Quellcode zu schreiben.
- OpenClaw und eigene Agenten: Produktbau-Abläufe über CLI, SDK, MCP-Tools und JSON-Payloads mit Yolfi verbinden.

Empfohlener Agentenpfad:

```txt
auth:status -> organization:get -> paylinks:list -> Nutzerfreigabe -> settlement:configure -> webhooks:configure -> paylinks:create -> Zahlungsseite installieren -> Webhook prüfen -> payments:status
```

## Agentenrezepte

Der Ordner `examples/` enthält kopierbare Abläufe und JSON-Payloads:

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## Was Dieses Paket Nicht Ist

- Es ist kein separates Yolfi-Dashboard.
- Es ist kein Wallet-Anbieter.
- Es ist keine zweite Zahlungs-API mit duplizierter Geschäftslogik.
- Es erfindet keine Settlement-Wallets, Produktnamen, Preise, Währungen, Abonnements oder Spendensummen.
- Es umgeht keine Nutzerbestätigung für destruktive Aktionen.
- Es speichert keine Secrets im Quellcode.
- Es nutzt keine Weiterleitungen als Zahlungsbestätigung.

## Aktuelle Grenzen

- Der MCP-Server verwendet derzeit stdio-Transport.
- Webhook-Signaturen nutzen den aktuellen Yolfi-Signaturvertrag. Wenn Yolfi Webhook-Secrets später von Organisations-API-Schlüsseln trennt, wird dieses Paket den neuen Konfigurationspfad bereitstellen.
- Die Agentenregistrierung gibt den API-Schlüssel einmal zurück. Agenten müssen ihn in einer ignorierten Env-Datei, einem Deployment-Secret oder einem Secret-Manager speichern.
- Die endgültige Zahlungsbestätigung sollte aus geprüften Webhooks und Zahlungsstatusabfragen kommen, nicht aus UI-Weiterleitungen.
- MCP-Verzeichnisfreigabe ist von diesem Paket getrennt. Behaupte keine offizielle Verzeichnisfreigabe, bevor ein Listing akzeptiert wurde.

## Suchphrasen, Die Dieses Paket Abdeckt

Entwickler und Agentenbauer suchen oft nach:

- Zahlungsintegration für KI-Agenten
- Zahlungen für KI-Programmieragenten
- MCP-Server für Zahlungen
- Krypto-Zahlungen über MCP
- Krypto-Zahlungs-API für Agenten
- Zahlungslinks für KI-Agenten
- Stablecoin-Zahlungen für Apps
- Zahlungsprüfung per Webhook
- agentischer Zahlungsablauf
- Krypto-Zahlungen mit Codex, Claude Code oder Cursor hinzufügen

Yolfi Agent Kit ist der Paket-Einstiegspunkt für diese Abläufe.

## Links

- Yolfi: <https://yolfi.com/de>
- Agent Kit Seite: <https://yolfi.com/de/ai-agent-kit>
- Dokumentation: <https://docs.yolfi.com/en/agent-kit>
- LLM-Index: <https://docs.yolfi.com/llms.txt>
- Vollständiger LLM-Kontext: <https://docs.yolfi.com/llms-full.txt>
- npm-Paket: <https://www.npmjs.com/package/@yolfi/agent>
- GitHub-Repository: <https://github.com/yolfinance/yolfi-agent>
- Integrationsleitfaden: <https://yolfi.com/de/blog/ai-agent-payment-integration-api>
