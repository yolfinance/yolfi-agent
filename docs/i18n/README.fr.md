![Yolfi Agent Kit : paiements crypto avec des agents IA](../../assets/ai-agent-payment.png)

# Yolfi Agent Kit : paiements crypto avec des agents IA

Intégrez des liens de paiement en cryptomonnaies, un checkout hébergé et la vérification des signatures webhook avec votre agent IA. Le paquet comprend un serveur MCP local, une CLI JSON, un SDK JavaScript et la compétence Yolfi Payments pour les agents.

```text
Ajoute les paiements Yolfi à ce projet. Suis https://docs.yolfi.com/ai
```

Envoyez ce message à votre agent dans le projet concerné. Il inspecte le code, choisit une connexion compatible et poursuit la réalisation après autorisation. Le propriétaire fournit uniquement les décisions manquantes, comme le portefeuille de réception ou le prix.

## Langues

[English](../../README.md), [Español](README.es.md), [Deutsch](README.de.md), [Français](README.fr.md), [简体中文](README.zh-CN.md), [Русский](README.ru.md), [हिन्दी](README.hi.md), [Türkçe](README.tr.md), [한국어](README.ko.md), [日本語](README.ja.md).

## Documentation

- [Intégration avec IA](https://docs.yolfi.com/en/agent-kit)
- [Connexion de l’agent](https://docs.yolfi.com/en/agent-kit/connections)
- [API HTTP](https://docs.yolfi.com/en/api)
- [CLI](https://docs.yolfi.com/en/cli)
- [Guide complet du paquet en anglais](../../README.md)

## CLI locale

Node.js 18 ou ultérieur est requis. Utilisez npx sans installation globale. Si l’autorisation manque, l’agent lance setup, ouvre loginUrl pour le propriétaire, puis exécute checkin et auth:status. Ne définissez pas un YOLFI_API_KEY fictif : il prime sur les identifiants enregistrés.

```bash
npx -y @yolfi/agent help
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent setup --agent local-agent
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

## Connexion MCP

Un seul serveur local fournit outils, ressources et prompts. Pour https://app.yolfi.com/mcp, le client gère OAuth. Vérifiez cette connexion avec yolfi_auth_status dans ce client ; une CLI distincte ne lit pas son OAuth. Choisissez selon les capacités de l’environnement, pas seulement le nom de l’agent.

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

## Réutilisation et secrets

Lisez d’abord l’organisation, les portefeuilles, les liens pertinents, les endpoints webhook et la configuration du projet. Réutilisez les valeurs approuvées et demandez seulement ce qui manque. settlement:configure met à jour les réseaux indiqués par PATCH et préserve les autres. webhooks:add crée un endpoint indépendant : cherchez un endpoint existant avant.

```bash
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

Créez le fichier JSON dans le projet cible avant --json. npx ne copie pas le dossier examples du paquet dans le répertoire de travail.

La CLI et le MCP locaux enregistrent le secret de signature à la création ou rotation et le masquent dans la sortie. Vérifiez avec l’ID de l’endpoint ou YOLFI_WEBHOOK_SECRET. Le SDK readWebhookSigningSecret(endpointId) permet de le transmettre au gestionnaire de secrets de l’application sans l’afficher. Évitez les secrets dans les arguments des commandes ou outils.

```bash
npx -y @yolfi/agent webhooks:verify --endpoint-id <endpointId> --payload ./raw-webhook.json --signature <signature>
```

Les liens hébergés et les requêtes publiques de paiement ne nécessitent pas de clé API de l’application. La création privée de Checkout Sessions nécessite un identifiant serveur distinct et une clé d’idempotence stable pour les nouvelles tentatives d’une même commande. OAuth de l’agent n’est pas un identifiant d’application.

## Vérification

Distinguez autorisation, tests du code, installation des secrets et vérification réelle du paiement et de la livraison des webhooks. Une connexion réussie ou une redirection ne prouve pas le parcours complet.
