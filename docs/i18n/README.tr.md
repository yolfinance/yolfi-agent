![Yolfi Agent Kit: yapay zeka ajanları için ödeme entegrasyonu, kripto ödeme sayfası, ödeme linkleri, MCP, CLI, SDK ve webhooklar](../../assets/ai-agent-payment.jpg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

Yapay zeka ajanları için kripto ödeme entegrasyonu. Yolfi Agent Kit; kodlama ajanlarının Yolfi üzerinden uygulamalara stablecoin ödemeleri, ödeme linkleri, ödeme durumu kontrolleri, webhook imza doğrulaması ve webhook tabanlı erişim mantığı eklemesini sağlayan JSON-first SDK, CLI, ajan becerisi ve MCP sunucusudur.

Codex, Claude Code, Cursor, OpenClaw, bir MCP ana makinesi ya da özel bir yapay zeka ajanı ürünü oluşturabiliyor ancak Yolfi çalışma alanı kaydetmek, ödeme linki oluşturmak, webhookları yapılandırmak ve kripto ödeme durumunu doğrulamak için güvenilir bir ödeme API'sine ihtiyaç duyuyorsa `@yolfi/agent` kullanın. Böylece kullanıcıyı manuel pano kurulumuna göndermek gerekmez.

[Web sitesi](https://yolfi.com/tr) | [Agent Kit](https://yolfi.com/tr/ai-agent-kit) | [Dokümantasyon](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [Rehber](https://yolfi.com/tr/blog/ai-agent-payment-integration-api)

## Diller

Bu paket rehberini şu dillerde okuyun:
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

## Geliştiriciler Neden Kullanır

- SaaS ürünlerine, oyunlara, pazaryerlerine, bağış sayfalarına, dijital indirmelere, iç araçlara ve ajanların oluşturduğu uygulamalara yapay zeka ajanı ödemeleri eklemek.
- Ajanlara güvenli bir ödeme akışı vermek: uygulamayı incelemek, çalışma alanı kaydetmek veya mevcut olanı kullanmak, kullanıcıdan cüzdan ve fiyat kararlarını almak, ödeme linkleri oluşturmak, ödeme sayfasını eklemek, webhookları doğrulamak ve ödeme durumunu kontrol etmek.
- MCP kripto ödemeleri, JSON CLI otomasyonu, JavaScript SDK çağrıları, webhook imza doğrulaması ve ajanların okuyabileceği talimatlar için tek paket kullanmak.
- Sadece ajanlara özel ikinci bir ödeme API'si tutmak yerine mevcut Yolfi API ile çalışmak.
- Ajanların Yolfi'yi npm, GitHub, MCP dizinleri, `llms.txt`, dokümantasyon, örnekler ve entegrasyon rehberleri üzerinden keşfetmesine yardımcı olmak.

Yolfi kripto ödeme altyapısını, barındırılan ödeme sayfasını, ödeme linklerini, herkese açık ödeme faturalarını, organizasyon ayarlarını, ödeme aktarımı cüzdanı yapılandırmasını ve webhook teslimini yönetir. Ajanınız proje incelemesini, kod değişikliklerini, kullanıcı onayını ve hedef uygulama entegrasyonunu yönetir.

## Bir Uygulamaya Ne Ekleyebilir

- Yolfi ödeme linkleriyle barındırılan kripto ödeme sayfası.
- Dijital ürünler, krediler, dosyalar, araçlar veya oyun öğeleri için tek seferlik ödeme linkleri.
- Yolfi hesabı destekliyorsa tekrarlayan ödeme veya abonelik benzeri ödeme linki kurulumu.
- Bağış ve içerik üretici destek sayfaları.
- Bir ödeme linkinden herkese açık ödeme faturası oluşturan sunucu rotaları.
- Yolfi herkese açık ödeme endpointleri üzerinden ödeme durumu sorgulama.
- `X-Yolfi-Signature` doğrulayan webhook işleyicileri.
- Erişimi yalnızca doğrulanmış ödeme olaylarından sonra açan webhook tabanlı yetkilendirme mantığı.
- Codex, Claude Code, Cursor, OpenClaw ve özel otomasyon için ajan akışları.

## Ajan Becerisi

Bu paket `SKILL.md` içinde **Yolfi Payments Skill** içerir. Kullanıcı kripto ödemeleri, ödeme linkleri, ödeme sayfası, abonelikler, bağışlar, ücretli indirmeler, ücretli erişim veya webhook tabanlı yetkilendirme istediğinde bunu kodlama ajanlarıyla kullanın.

Önerilen güvenli akış:

```txt
uygulamayı incele -> YOLFI_API_KEY kontrol et -> gerekiyorsa kaydet -> kullanıcıdan cüzdan ve fiyat iste -> organizasyonu yapılandır -> ödeme linki oluştur veya mevcut olanı kullan -> ödeme sayfası ekle -> webhook doğrulaması ekle -> durumu kontrol et
```

Beceri, ajanlara neyi otomatik yapabileceklerini ve hangi kararları kullanıcıya sormaları gerektiğini söyler. Ajanlar cüzdan adresleri, fiyatlar, planlar, para birimleri, sır saklama yerleri veya yıkıcı ödeme linki işlemleri uydurmamalıdır.

## Kurulum

Projeye kur:

```bash
npm install @yolfi/agent
```

Kurulum yapmadan çalıştır:

```bash
npx -y @yolfi/agent help
```

stdio MCP sunucusunu başlat:

```bash
npx -y @yolfi/agent mcp
```

Bu depo içinde yerel geliştirme için:

```bash
node packages/yolfi-agent/src/cli.js help
```

## Kimlik Doğrulama

Özel komutlar açıkça verilen Yolfi API anahtarını veya bu cihazda güvenli biçimde saklanan aracı kimlik bilgisini kullanır:

```bash
export YOLFI_API_KEY="yolfi_..."
```

CLI ve MCP sunucusu varsayılan olarak Yolfi'nin production API'sini ve ödeme sayfasını kullanır.

Yeni bir kullanıcı için aracı, e-posta ve proje adı onaylandıktan sonra e-posta doğrulamalı kaydı başlatabilir:

```bash
yolfi auth:agent-register \
  --email "owner@example.com" \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

E-posta yeni olmalıdır; mevcut hesaplar OAuth veya tarayıcı kurulumunu kullanır. İlk çağrı bir onay bağlantısı gönderir ve bekleyen check-in tokenını korumalı yerel ayarlarda saklar. Hesap sahibi bağlantıyı açtıktan sonra aynı komutu yeniden çalıştırın. Paket ancak o zaman bir kez teslim edilen aracı kimlik bilgisini saklar ve tam anahtarı CLI ile MCP çıktısından kaldırır.

## Hızlı Başlangıç

API anahtarına bağlı çalışma alanını kontrol et:

```bash
yolfi auth:status
```

Kullanıcı cüzdan adreslerini verdikten sonra ödeme aktarımı cüzdanlarını yapılandır:

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Webhook teslimini yapılandır:

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

Tekrar oluşturmadan önce mevcut ödeme linklerini listele:

```bash
yolfi paylinks:list --page 1 --rows 10
```

Tek seferlik ödeme linki oluştur:

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

Bir ödeme linkinden herkese açık ödeme faturası oluştur:

```bash
yolfi payments:create --json examples/payment.create.json
```

Ödeme durumunu kontrol et:

```bash
yolfi payments:status --id <paymentId>
```

Her CLI komutu JSON çıktısı verir, böylece ajanlar terminal metnini ayrıştırmadan sonuçları okuyabilir.

## Kripto Ödemeler İçin MCP Sunucusu

Yolfi Agent Kit aynı npm paketinde stdio MCP sunucusu içerir:

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

`yolfi_agent_register` herkese açık ajan kayıt endpointini çağırır ve `YOLFI_API_KEY` gerektirmez. Onay bağlantısını açtıktan sonra aynı aracı yeniden çağırın; bir kez teslim edilen API anahtarını yerel olarak saklar. Özel `yolfi-api` araçları bu anahtarı gerektirir. `yolfi-knowledge` kaynakları, anahtar yokken ajanın entegrasyon yolunu anlamasına yardım eder.

Kullanılabilir MCP araçları:

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

Webhook endpoint’i oluşturulduğunda veya sırrı yenilendiğinde CLI, bir kez teslim edilen imzalama gizli anahtarını korumalı yerel Yolfi yapılandırmasına kaydeder ve CLI ya da MCP çıktısında düz metin olarak hiçbir zaman döndürmez. Kaydedilen gizli anahtarı kullanmak için `endpointId` değerini `yolfi_webhooks_verify` aracına iletin. CI veya gizli anahtar yöneticisi ortamlarında bunun yerine açıkça yönetilen bir `YOLFI_WEBHOOK_SECRET` sağlanabilir.

`yolfi_paylinks_disable` gibi yıkıcı araçlar yalnızca kullanıcının açık onayından sonra çalıştırılmalıdır.

## Ajanlar İçin JSON Akışı

Ajanlar bir payload dosyası yazıp CLI'a verebilir:

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

Sonra çalıştır:

```bash
yolfi paylinks:create --json ./paylink.json
```

Ajanlar dönen ödeme linki ID'sini hedef uygulamanın env/config dosyasında tutmalı ve müşteriye dönük ödeme sayfası ile durum sorgulama için Yolfi herkese açık ödeme endpointlerini kullanmalıdır.

## Komutlar

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

## Endpoint Adaptör Matrisi

Yolfi Agent Kit ikinci bir `/api/agent/*` API oluşturmaz. Ajan eylemlerini mevcut Yolfi API'ye eşler:

| Ajan eylemi | API endpointi | Kimlik doğrulama |
| --- | --- | --- |
| Yolfi çalışma alanı kaydet | `POST /api/auth/agent/register` | public; API anahtarı gerekmez |
| Hesabı kontrol et | `GET /api/private/organization/current` | bearer API key |
| Organizasyonu ve ödeme aktarımı cüzdanlarını yapılandır | `PUT /api/private/organization/current` | bearer API key |
| Webhook endpoint’i oluştur | `POST /api/private/organization/webhook-endpoints` | bearer API key |
| API anahtarı durumunu al | `GET /api/private/organization/api-key` | bearer API key veya cookie |
| Ödeme linki oluştur | `POST /api/private/paylinks/create` | bearer API key |
| Ödeme linklerini listele | `GET /api/private/paylinks` | bearer API key |
| Ödeme linki getir | `GET /api/private/paylinks/:id` | bearer API key |
| Ödeme linki düzenle | `POST /api/private/paylinks/edit` | bearer API key |
| Ödeme linkini devre dışı bırak | `POST /api/private/paylinks/disable` | bearer API key ve onay |
| Herkese açık ödeme linki bilgisi | `GET /api/public/paylinks/:id` | public |
| Herkese açık ödeme faturası oluştur | `POST /api/public/payments` | public |
| Ödeme durumu | `GET /api/public/payments/:id` | public |
| Satıcı işlemleri | `GET /api/private/transactions` | bearer API key |

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

## Webhook Doğrulama

Yolfi webhook payloadlarını `X-Yolfi-Signature` ile imzalar. JSON'u ayrıştırmadan ve olaya güvenmeden önce ham istek gövdesini doğrulayın:

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

Tarayıcı yönlendirmesini ödeme kanıtı saymayın. Doğrulanmış webhookları ve Yolfi ödeme durumu kontrollerini kullanın.

## Yapay Zeka Kodlama Ajanlarıyla Kullanım

Yolfi Agent Kit, kullanıcının "ödeme ekle", "bu dijital ürünü sat", "bağış düğmesi ekle", "bu oyun için ödeme al" veya "bu özelliği ödeme arkasına koy" gibi üst seviye talimat verdiği ajan tabanlı ödeme akışları için tasarlanmıştır.

- Codex: repoyu inceler, ödeme sayfası rotaları/bileşenleri ekler, env değişkenlerini yapılandırır ve doğrulanmış webhookları mevcut erişim mantığına bağlar.
- Claude Code: MCP sunucusu ve Agent Skill kullanarak ödeme linkleri, sunucu işleyicileri ve durum kontrolleri ekler; cüzdan ve fiyat kararları için kullanıcı onayı alır.
- Cursor: Yolfi anahtarlarını commit edilen kaynak koddan uzak tutarak ödeme arayüzü ve sunucu tarafı işleyicileri ekler.
- OpenClaw ve özel ajanlar: ürün oluşturma akışlarını CLI, SDK, MCP araçları ve JSON payloadları üzerinden Yolfi'ye bağlar.

Önerilen ajan yolu:

```txt
auth:status -> organization:get -> paylinks:list -> kullanıcı onayı -> settlement:configure -> webhooks:configure -> paylinks:create -> ödeme sayfasını kur -> webhook doğrula -> payments:status
```

## Ajan Tarifleri

`examples/` klasörü kopyalanabilir akışlar ve JSON payloadları içerir:

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## Bu Paket Ne Değildir

- Ayrı bir Yolfi panosu değildir.
- Cüzdan sağlayıcısı değildir.
- Yinelenmiş iş mantığına sahip ikinci bir ödeme API'si değildir.
- Ödeme aktarımı cüzdanları, ürün adları, fiyatlar, para birimleri, abonelikler veya bağış tutarları uydurmaz.
- Yıkıcı eylemler için kullanıcı onayını atlamaz.
- Sırları kaynak kodda saklamaz.
- Yönlendirmeleri ödeme onayı olarak kullanmaz.

## Mevcut Sınırlar

- MCP sunucusu şu anda stdio transport kullanır.
- Webhook imzaları her endpoint’in korumalı gizli anahtarını kullanır; organizasyon API anahtarı imzalama gizli anahtarı olarak kullanılmaz.
- Ajan kaydı API anahtarını onaylanmış check-in sırasında yalnızca bir kez döndürür; yerel paket anahtarı korumalı biçimde saklar ve çıktıdan kaldırır.
- Nihai ödeme onayı, arayüz yönlendirmelerinden değil doğrulanmış webhooklardan ve ödeme durumu kontrollerinden gelmelidir.
- MCP dizin onayı bu paketten ayrıdır. Bir listing kabul edilmeden resmi dizin onayı iddia etmeyin.

## Bu Paketin Hedeflediği Arama İfadeleri

Geliştiriciler ve ajan geliştiricileri sıkça şunları arar:

- yapay zeka ajanı ödeme entegrasyonu
- yapay zeka kodlama ajanı ödemeleri
- ödeme için MCP sunucusu
- MCP kripto ödemeleri
- ajanlar için kripto ödeme API'si
- yapay zeka ajanları için ödeme linkleri
- uygulamalar için stablecoin ödeme
- webhook ödeme doğrulaması
- ajan tabanlı ödeme akışı
- Codex, Claude Code veya Cursor ile kripto ödeme ekleme

Yolfi Agent Kit bu akışlar için paket giriş noktasıdır.

## Bağlantılar

- Yolfi: <https://yolfi.com/tr>
- Agent Kit sayfası: <https://yolfi.com/tr/ai-agent-kit>
- Dokümantasyon: <https://docs.yolfi.com/en/agent-kit>
- LLM dizini: <https://docs.yolfi.com/llms.txt>
- Tam LLM bağlamı: <https://docs.yolfi.com/llms-full.txt>
- npm paketi: <https://www.npmjs.com/package/@yolfi/agent>
- GitHub deposu: <https://github.com/yolfinance/yolfi-agent>
- Entegrasyon rehberi: <https://yolfi.com/tr/blog/ai-agent-payment-integration-api>
