![Yolfi Agent Kit: AI aracılarıyla kripto ödeme entegrasyonu](../../assets/ai-agent-payment.png)

# Yolfi Agent Kit: AI aracılarıyla kripto ödeme entegrasyonu

AI aracınızla kripto ödeme bağlantıları, barındırılan ödeme sayfası ve Webhook imza doğrulaması ekleyin. Paket yerel MCP sunucusu, JSON CLI, JavaScript SDK ve Yolfi Payments Agent Skill içerir.

```text
Bu projeye Yolfi ödemelerini ekle. https://docs.yolfi.com/ai adresini izle.
```

Bu mesajı hedef projedeki aracınıza gönderin. Aracı kodu inceler, desteklenen bağlantıyı seçer ve yetkilendirmeden sonra uygulamaya devam eder. Hesap sahibi yalnızca alıcı cüzdan veya fiyat gibi eksik kararları sağlar.

## Diller

[English](../../README.md), [Español](README.es.md), [Deutsch](README.de.md), [Français](README.fr.md), [简体中文](README.zh-CN.md), [Русский](README.ru.md), [हिन्दी](README.hi.md), [Türkçe](README.tr.md), [한국어](README.ko.md), [日本語](README.ja.md).

## Belgeler

- [AI entegrasyonu](https://docs.yolfi.com/en/agent-kit)
- [Aracı bağlantısı](https://docs.yolfi.com/en/agent-kit/connections)
- [HTTP API](https://docs.yolfi.com/en/api)
- [CLI](https://docs.yolfi.com/en/cli)
- [İngilizce tam paket rehberi](../../README.md)

## Yerel CLI

Node.js 18 veya üzeri gerekir. npx kullanın; genel kurulum zorunlu değildir. Yetkilendirme yoksa aracı setup çalıştırır, hesap sahibi için loginUrl açar ve ardından checkin ile auth:status çalıştırır. YOLFI_API_KEY için örnek değer koymayın; kayıtlı kimlik bilgisinden önceliklidir.

```bash
npx -y @yolfi/agent help
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent setup --agent local-agent
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

## MCP bağlantısı

Tek yerel sunucu araçları, kaynakları ve istemleri sunar. https://app.yolfi.com/mcp için OAuth istemci tarafından yönetilir. Aynı istemcide yolfi_auth_status ile doğrulayın; ayrı CLI onun OAuth bilgisini okumaz. Yöntemi yalnızca aracı adına göre değil, ortam yeteneklerine göre seçin.

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

## Yeniden kullanım ve sırlar

Önce organizasyonu, cüzdanları, ilgili ödeme bağlantılarını, Webhook uç noktalarını ve proje ayarlarını okuyun. Onaylı değerleri yeniden kullanın ve yalnızca eksikleri sorun. settlement:configure belirtilen ağları PATCH ile günceller, diğerlerini korur. webhooks:add bağımsız uç nokta oluşturur; önce mevcut olanı arayın.

```bash
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

--json kullanmadan önce JSON dosyasını hedef projede oluşturun. npx paketteki examples klasörünü çalışma dizinine kopyalamaz.

Yerel CLI/MCP, Webhook oluşturma veya döndürmede imzalama sırrını korumalı yapılandırmada saklar ve çıktıda gizler. Uç nokta kimliği veya YOLFI_WEBHOOK_SECRET ile doğrulayın. SDK readWebhookSigningSecret(endpointId) sırrı yazdırmadan uygulamanın sır yöneticisine aktarabilir. Komut veya araç argümanlarında sır kullanmayın.

```bash
npx -y @yolfi/agent webhooks:verify --endpoint-id <endpointId> --payload ./raw-webhook.json --signature <signature>
```

Barındırılan ödeme bağlantıları ve herkese açık ödeme sorguları uygulama API anahtarı gerektirmez. Özel Checkout Session oluşturma ayrı sunucu kimliği ve aynı siparişin yeniden denemeleri için sabit idempotency key gerektirir. Aracı OAuth bilgisi uygulama kimliği değildir.

## Doğrulama

Hesap yetkilendirmesini, kod testlerini, çalışma ortamı sır kurulumunu ve gerçek ödeme/Webhook teslim doğrulamasını ayrı raporlayın. Başarılı bağlantı veya tarayıcı yönlendirmesi tüm ödeme akışını kanıtlamaz.
