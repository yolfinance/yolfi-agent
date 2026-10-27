![Yolfi Agent Kit: Krypto-Zahlungen mit KI-Agenten](../../assets/ai-agent-payment.png)

# Yolfi Agent Kit: Krypto-Zahlungen mit KI-Agenten

Integriere Krypto-Zahlungslinks, gehosteten Checkout und Webhook-Signaturprüfung mit deinem KI-Agenten. Das Paket bietet einen lokalen MCP-Server, eine JSON-CLI, ein JavaScript-SDK und den Yolfi Payments Agent Skill.

```text
Füge diesem Projekt Yolfi-Zahlungen hinzu. Folge https://docs.yolfi.com/ai
```

Sende diese Nachricht im Zielprojekt an den Agenten. Er untersucht den Code, wählt eine unterstützte Verbindung und setzt die Implementierung nach der Autorisierung fort. Der Eigentümer ergänzt nur fehlende Entscheidungen, etwa Empfangswallet oder Preis.

## Sprachen

[English](../../README.md), [Español](README.es.md), [Deutsch](README.de.md), [Français](README.fr.md), [简体中文](README.zh-CN.md), [Русский](README.ru.md), [हिन्दी](README.hi.md), [Türkçe](README.tr.md), [한국어](README.ko.md), [日本語](README.ja.md).

## Dokumentation

- [KI-Integration](https://docs.yolfi.com/en/agent-kit)
- [Agentenverbindung](https://docs.yolfi.com/en/agent-kit/connections)
- [HTTP-API](https://docs.yolfi.com/en/api)
- [CLI](https://docs.yolfi.com/en/cli)
- [Vollständige Paketanleitung auf Englisch](../../README.md)

## Lokale CLI

Node.js 18 oder neuer ist erforderlich. Verwende npx; eine globale Installation ist nicht nötig. Fehlt die Autorisierung, startet der Agent setup, öffnet loginUrl für den Eigentümer und fährt mit checkin und auth:status fort. Setze keinen Platzhalter für YOLFI_API_KEY: Er überschreibt die gespeicherte Zugangsdatenquelle.

```bash
npx -y @yolfi/agent help
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent setup --agent local-agent
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

## MCP-Verbindung

Ein lokaler Server stellt Werkzeuge, Ressourcen und Prompts bereit. Für https://app.yolfi.com/mcp verwaltet der Host OAuth. Prüfe diese Verbindung mit yolfi_auth_status im selben Host; eine separate CLI liest dessen OAuth nicht. Entscheidend sind die verfügbaren Fähigkeiten, nicht der Name des Agenten.

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

## Wiederverwendung und Geheimnisse

Lies zuerst Organisation, Wallets, relevante Zahlungslinks, Webhook-Endpunkte und Projektkonfiguration. Verwende genehmigte Werte erneut und frage nur nach fehlenden Angaben. settlement:configure aktualisiert angegebene Netzwerke per PATCH und erhält die übrigen. webhooks:add erstellt einen eigenen Endpunkt: Suche vorher nach einem passenden vorhandenen.

```bash
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

Erstelle die JSON-Datei im Zielprojekt, bevor du --json verwendest. npx kopiert den examples-Ordner des Pakets nicht in das Arbeitsverzeichnis.

Lokale CLI/MCP-Aufrufe speichern Webhook-Signaturgeheimnisse beim Erstellen oder Rotieren geschützt und blenden sie in der Ausgabe aus. Prüfe über die Endpunkt-ID oder YOLFI_WEBHOOK_SECRET. Mit readWebhookSigningSecret(endpointId) kann ein lokales SDK-Skript das Geheimnis ohne Ausgabe an die Geheimnisverwaltung der Anwendung übergeben. Vermeide Geheimnisse in Befehls- oder Werkzeugargumenten.

```bash
npx -y @yolfi/agent webhooks:verify --endpoint-id <endpointId> --payload ./raw-webhook.json --signature <signature>
```

Gehostete Zahlungslinks und öffentliche Zahlungsabfragen benötigen keinen API-Schlüssel der Anwendung. Private Checkout Sessions brauchen separate Server-Zugangsdaten und einen stabilen Idempotenzschlüssel für Wiederholungen derselben Bestellung. Agenten-OAuth ist keine Anwendungsberechtigung.

## Prüfung

Berichte Autorisierung, Codetests, installierte Geheimnisse und echte Zahlungs-/Webhook-Prüfung getrennt. Eine erfolgreiche Verbindung oder Browserweiterleitung beweist nicht den gesamten Zahlungsablauf.
