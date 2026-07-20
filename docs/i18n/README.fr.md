![Yolfi Agent Kit : intégration de paiement pour agents IA, page de paiement crypto, liens de paiement, MCP, CLI, SDK et webhooks](../../assets/ai-agent-payment.jpg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

Intégration de paiement pour agents IA avec page de paiement crypto. Yolfi Agent Kit est un SDK, une CLI, une compétence pour agents et un serveur MCP orientés JSON, qui permettent aux agents de programmation d'ajouter des paiements en stablecoins, des liens de paiement, le suivi de l'état du paiement, la vérification des signatures webhook et une logique d'accès basée sur les webhooks dans des applications via Yolfi.

Utilisez `@yolfi/agent` lorsque Codex, Claude Code, Cursor, OpenClaw, un hôte MCP ou un agent IA personnalisé peut construire le produit, mais a encore besoin d'une API de paiement fiable pour enregistrer un espace de travail Yolfi, créer un lien de paiement, configurer des webhooks et vérifier l'état d'un paiement crypto sans renvoyer l'utilisateur vers une configuration manuelle dans un tableau de bord.

[Site web](https://yolfi.com/fr) | [Agent Kit](https://yolfi.com/fr/ai-agent-kit) | [Documentation](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [Guide](https://yolfi.com/fr/blog/ai-agent-payment-integration-api)

## Langues

Lire ce guide du paquet en :
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

## Pourquoi Les Développeurs L'utilisent

- Ajouter des paiements pour agents IA à des produits SaaS, jeux, places de marché, pages de don, téléchargements numériques, outils internes et applications créées par agents.
- Donner aux agents un processus de paiement sûr : inspecter l'application, enregistrer ou réutiliser un espace de travail, demander à l'utilisateur le portefeuille et le prix, créer des liens de paiement, installer la page de paiement, vérifier les webhooks et contrôler l'état du paiement.
- Utiliser un seul paquet pour les paiements crypto via MCP, l'automatisation JSON en CLI, les appels SDK JavaScript, la vérification des signatures webhook et les instructions lisibles par les agents.
- Construire avec l'API Yolfi existante au lieu de maintenir une seconde API de paiement réservée aux agents.
- Aider les agents à découvrir Yolfi via npm, GitHub, les annuaires MCP, `llms.txt`, la documentation, les exemples et les guides d'intégration.

Yolfi gère l'infrastructure de paiement crypto, la page de paiement hébergée, les liens de paiement, les factures de paiement publiques, les réglages d'organisation, la configuration des portefeuilles de règlement et la livraison des webhooks. Votre agent gère l'inspection du projet, les changements de code, la confirmation utilisateur et l'intégration dans l'application cible.

## Ce Qu'il Peut Ajouter À Une Application

- Une page de paiement crypto hébergée via les liens de paiement Yolfi.
- Des liens de paiement à paiement unique pour produits numériques, crédits, fichiers, outils ou objets de jeu.
- Une configuration de paiements récurrents ou de type abonnement lorsque le compte Yolfi la prend en charge.
- Des pages de don et de soutien aux créateurs.
- Des routes serveur qui créent des factures de paiement publiques à partir d'un lien de paiement.
- Une consultation de l'état du paiement via les endpoints publics de paiement Yolfi.
- Des gestionnaires webhook qui vérifient `X-Yolfi-Signature`.
- Une logique d'accès basée sur les webhooks qui débloque l'accès uniquement après des événements de paiement confirmés.
- Des processus pour Codex, Claude Code, Cursor, OpenClaw et les automatisations personnalisées.

## Compétence Pour Agents

Ce paquet inclut la **Yolfi Payments Skill** dans `SKILL.md`. Utilisez-la avec des agents de programmation lorsque l'utilisateur demande d'ajouter des paiements crypto, des liens de paiement, une page de paiement, des abonnements, des dons, des téléchargements payants, un accès payant ou des droits basés sur les webhooks.

Processus sûr recommandé :

```txt
inspecter l'application -> vérifier YOLFI_API_KEY -> enregistrer si nécessaire -> demander portefeuille et prix -> configurer l'organisation -> créer ou réutiliser un lien de paiement -> ajouter la page de paiement -> ajouter la vérification webhook -> vérifier l'état
```

La compétence indique aux agents ce qu'ils peuvent faire automatiquement et quelles décisions doivent être demandées à l'utilisateur. Les agents ne doivent jamais inventer des adresses de portefeuille, prix, offres, devises, emplacements de secrets ou actions destructives sur les liens de paiement.

## Installation

Installer dans un projet :

```bash
npm install @yolfi/agent
```

Exécuter sans installation :

```bash
npx -y @yolfi/agent help
```

Démarrer le serveur MCP en stdio :

```bash
npx -y @yolfi/agent mcp
```

Pour le développement local dans ce dépôt :

```bash
node packages/yolfi-agent/src/cli.js help
```

## Authentification

Les commandes privées utilisent une clé API Yolfi explicite ou l’identifiant d’agent protégé enregistré localement :

```bash
export YOLFI_API_KEY="yolfi_..."
```

La CLI et le serveur MCP utilisent par défaut l'API et le checkout de production de Yolfi.

Pour un nouvel utilisateur, l’agent peut démarrer une inscription confirmée par e-mail après validation de l’e-mail et du nom du projet :

```bash
yolfi auth:agent-register \
  --email "owner@example.com" \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

L’e-mail doit être nouveau ; les comptes existants utilisent OAuth ou la configuration par navigateur. Le premier appel envoie un lien de confirmation et stocke de façon protégée le jeton de check-in en attente. Une fois le lien ouvert par le propriétaire, exécutez à nouveau la même commande. Le package stocke alors localement l’identifiant d’agent délivré une seule fois et retire la clé complète des sorties CLI et MCP.

## Démarrage Rapide

Vérifier l'espace de travail lié à la clé API :

```bash
yolfi auth:status
```

Configurer les portefeuilles de règlement après que l'utilisateur a fourni les adresses :

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Configurer la livraison des webhooks :

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

Lister les liens de paiement existants avant de créer des doublons :

```bash
yolfi paylinks:list --page 1 --rows 10
```

Créer un lien de paiement unique :

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

Créer une facture de paiement publique à partir d'un lien de paiement :

```bash
yolfi payments:create --json examples/payment.create.json
```

Vérifier l'état du paiement :

```bash
yolfi payments:status --id <paymentId>
```

Chaque commande CLI affiche du JSON pour que les agents puissent lire les résultats sans analyser du texte de terminal.

## Serveur MCP Pour Paiements Crypto

Yolfi Agent Kit inclut un serveur MCP en stdio dans le même paquet npm :

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

`yolfi_agent_register` appelle l'endpoint public d'enregistrement pour agents et ne nécessite pas `YOLFI_API_KEY`. Après ouverture du lien de confirmation, appelez de nouveau le même outil ; il stocke alors localement la clé API délivrée une seule fois. Les outils privés `yolfi-api` nécessitent cette clé. Les ressources `yolfi-knowledge` aident l'agent à comprendre le chemin d'intégration avant qu'une clé existe.

Outils MCP disponibles :

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

Lors de la création d’un endpoint webhook ou de la rotation de son secret, la CLI enregistre le secret de signature délivré une seule fois dans la configuration locale protégée de Yolfi et ne le renvoie jamais en clair dans les sorties CLI ou MCP. Transmettez `endpointId` à `yolfi_webhooks_verify` pour utiliser ce secret enregistré. Dans les environnements CI ou dotés d’un gestionnaire de secrets, un `YOLFI_WEBHOOK_SECRET` géré explicitement peut être fourni à la place.

Les outils destructifs comme `yolfi_paylinks_disable` ne doivent être exécutés qu'après confirmation explicite de l'utilisateur.

## Processus JSON Pour Agents

Les agents peuvent écrire une payload dans un fichier et la passer à la CLI :

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

Puis lancer :

```bash
yolfi paylinks:create --json ./paylink.json
```

Les agents doivent garder l'ID du lien de paiement retourné dans env/config de l'application cible et utiliser les endpoints publics de paiement Yolfi pour la page de paiement côté client et la vérification d'état.

## Commandes

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

## Matrice D'adaptation Des Endpoints

Yolfi Agent Kit ne crée pas une seconde API `/api/agent/*`. Il relie les actions de l'agent à l'API Yolfi actuelle :

| Action de l'agent | Endpoint API | Authentification |
| --- | --- | --- |
| Enregistrer un espace de travail Yolfi | `POST /api/auth/agent/register` | public ; aucune clé API requise |
| Vérifier le compte | `GET /api/private/organization/current` | bearer API key |
| Configurer l’organisation et les portefeuilles de règlement | `PUT /api/private/organization/current` | bearer API key |
| Créer un endpoint webhook | `POST /api/private/organization/webhook-endpoints` | bearer API key |
| Obtenir l'état de la clé API | `GET /api/private/organization/api-key` | bearer API key ou cookie |
| Créer un lien de paiement | `POST /api/private/paylinks/create` | bearer API key |
| Lister les liens de paiement | `GET /api/private/paylinks` | bearer API key |
| Obtenir un lien de paiement | `GET /api/private/paylinks/:id` | bearer API key |
| Modifier un lien de paiement | `POST /api/private/paylinks/edit` | bearer API key |
| Désactiver un lien de paiement | `POST /api/private/paylinks/disable` | bearer API key plus confirmation |
| Informations publiques de page de paiement | `GET /api/public/paylinks/:id` | public |
| Créer une facture de paiement publique | `POST /api/public/payments` | public |
| État du paiement | `GET /api/public/payments/:id` | public |
| Transactions marchand | `GET /api/private/transactions` | bearer API key |

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

## Vérification Des Webhooks

Yolfi signe les payloads webhook avec `X-Yolfi-Signature`. Vérifiez le corps brut de la requête avant de parser le JSON et de faire confiance à l'événement :

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

Ne considérez pas une redirection du navigateur comme preuve de paiement. Utilisez des webhooks vérifiés et les contrôles d'état de paiement Yolfi.

## Utilisation Avec Des Agents De Programmation IA

Yolfi Agent Kit est conçu pour les processus de paiement agentiques où l'utilisateur donne une instruction de haut niveau comme "ajouter des paiements", "vendre ce produit numérique", "ajouter un bouton de don", "faire payer ce jeu" ou "réserver cette fonctionnalité aux utilisateurs payants".

- Codex : inspecte le dépôt, ajoute des routes/composants de page de paiement, configure les variables env et relie les webhooks vérifiés à la logique d'accès existante.
- Claude Code : utilise le serveur MCP et l'Agent Skill pour ajouter des liens de paiement, des gestionnaires serveur et des vérifications d'état avec approbation utilisateur pour les décisions de portefeuille et de prix.
- Cursor : ajoute l'interface de paiement et les gestionnaires côté serveur tout en gardant les clés Yolfi hors du code commité.
- OpenClaw et agents personnalisés : relient les processus de création produit à Yolfi via CLI, SDK, outils MCP et payloads JSON.

Chemin d'agent recommandé :

```txt
auth:status -> organization:get -> paylinks:list -> approbation utilisateur -> settlement:configure -> webhooks:configure -> paylinks:create -> installer la page de paiement -> vérifier le webhook -> payments:status
```

## Recettes Pour Agents

Le dossier `examples/` contient des processus prêts à copier et des payloads JSON :

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## Ce Que Ce Paquet N'est Pas

- Ce n'est pas un tableau de bord Yolfi séparé.
- Ce n'est pas un fournisseur de portefeuille.
- Ce n'est pas une seconde API de paiement avec logique métier dupliquée.
- Il n'invente pas de portefeuilles de règlement, noms de produits, prix, devises, abonnements ni montants de don.
- Il ne contourne pas la confirmation utilisateur pour les actions destructives.
- Il ne stocke pas de secrets dans le code source.
- Il n'utilise pas les redirections comme confirmation de paiement.

## Limites Actuelles

- Le serveur MCP utilise actuellement le transport stdio.
- Les signatures webhook utilisent le secret protégé de chaque endpoint ; la clé API de l’organisation ne sert pas de secret de signature.
- L’enregistrement d’agent renvoie la clé API une seule fois lors du check-in confirmé ; le package local la stocke de façon protégée et la retire des sorties.
- La confirmation finale du paiement doit venir de webhooks vérifiés et de contrôles d'état du paiement, pas de redirections d'interface.
- L'approbation dans les annuaires MCP est séparée de ce paquet. N'annoncez pas d'approbation officielle d'un annuaire tant qu'un listing n'a pas été accepté.

## Requêtes De Recherche Ciblées Par Ce Paquet

Les développeurs et créateurs d'agents recherchent souvent :

- intégration de paiement pour agents IA
- paiements pour agents de programmation IA
- serveur MCP de paiement
- paiements crypto via MCP
- API de paiement crypto pour agents
- liens de paiement pour agents IA
- paiements en stablecoins pour applications
- vérification de paiement par webhook
- processus de paiement agentique
- ajouter des paiements crypto avec Codex, Claude Code ou Cursor

Yolfi Agent Kit est le point d'entrée du paquet pour ces processus.

## Liens

- Yolfi : <https://yolfi.com/fr>
- Page Agent Kit : <https://yolfi.com/fr/ai-agent-kit>
- Documentation : <https://docs.yolfi.com/en/agent-kit>
- Index LLM : <https://docs.yolfi.com/llms.txt>
- Contexte LLM complet : <https://docs.yolfi.com/llms-full.txt>
- Paquet npm : <https://www.npmjs.com/package/@yolfi/agent>
- Dépôt GitHub : <https://github.com/yolfinance/yolfi-agent>
- Guide d'intégration : <https://yolfi.com/fr/blog/ai-agent-payment-integration-api>
