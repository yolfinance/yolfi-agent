![Yolfi Agent Kit: एआई एजेंट भुगतान एकीकरण, क्रिप्टो भुगतान पेज, भुगतान लिंक, MCP, CLI, SDK और Webhook](../../assets/ai-agent-payment.jpg)

# Yolfi Agent Kit

[![npm version](https://img.shields.io/npm/v/@yolfi/agent.svg)](https://www.npmjs.com/package/@yolfi/agent)
[![license](https://img.shields.io/npm/l/@yolfi/agent.svg)](../../LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-0b7f79)](../../package.json)

एआई एजेंटों के लिए क्रिप्टो भुगतान एकीकरण। Yolfi Agent Kit JSON-first SDK, CLI, एजेंट स्किल और MCP सर्वर है, जिससे कोडिंग एजेंट Yolfi के माध्यम से एप्लिकेशन में स्टेबलकॉइन भुगतान, भुगतान लिंक, भुगतान स्थिति जांच, Webhook हस्ताक्षर सत्यापन और Webhook आधारित पहुंच नियम जोड़ सकते हैं।

`@yolfi/agent` का उपयोग तब करें जब Codex, Claude Code, Cursor, OpenClaw, कोई MCP होस्ट या आपका अपना एआई एजेंट उत्पाद बना सकता है, लेकिन उसे Yolfi कार्यक्षेत्र पंजीकृत करने, भुगतान लिंक बनाने, Webhook सेट करने और क्रिप्टो भुगतान की स्थिति जांचने के लिए भरोसेमंद भुगतान API चाहिए, वह भी बिना उपयोगकर्ता को मैनुअल डैशबोर्ड सेटिंग में भेजे।

[वेबसाइट](https://yolfi.com/hi) | [Agent Kit](https://yolfi.com/hi/ai-agent-kit) | [दस्तावेज़](https://docs.yolfi.com/en/agent-kit) | [npm](https://www.npmjs.com/package/@yolfi/agent) | [GitHub](https://github.com/yolfinance/yolfi-agent) | [गाइड](https://yolfi.com/hi/blog/ai-agent-payment-integration-api)

## भाषाएं

यह पैकेज गाइड इन भाषाओं में पढ़ें:
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

## डेवलपर इसका उपयोग क्यों करते हैं

- SaaS उत्पादों, गेम, मार्केटप्लेस, दान पेज, डिजिटल डाउनलोड, आंतरिक टूल और एजेंट द्वारा बनाए गए ऐप में एआई एजेंट भुगतान जोड़ें।
- एजेंटों को सुरक्षित भुगतान प्रक्रिया दें: ऐप देखें, कार्यक्षेत्र पंजीकृत या पुन: उपयोग करें, उपयोगकर्ता से वॉलेट और कीमत पूछें, भुगतान लिंक बनाएं, भुगतान पेज जोड़ें, Webhook सत्यापित करें और भुगतान स्थिति जांचें।
- MCP क्रिप्टो भुगतान, JSON CLI स्वचालन, JavaScript SDK कॉल, Webhook हस्ताक्षर सत्यापन और एजेंट-पठनीय निर्देशों के लिए एक ही पैकेज का उपयोग करें।
- एजेंटों के लिए दूसरी अलग भुगतान API बनाए बिना मौजूदा Yolfi API के साथ काम करें।
- npm, GitHub, MCP निर्देशिकाओं, `llms.txt`, दस्तावेज़, उदाहरणों और एकीकरण गाइड के माध्यम से एजेंटों को Yolfi खोजने में मदद करें।

Yolfi क्रिप्टो भुगतान ढांचा, होस्टेड भुगतान पेज, भुगतान लिंक, सार्वजनिक भुगतान इनवॉइस, संगठन सेटिंग, सेटलमेंट वॉलेट कॉन्फ़िगरेशन और Webhook डिलीवरी संभालता है। आपका एजेंट परियोजना जांच, कोड बदलाव, उपयोगकर्ता पुष्टि और लक्षित ऐप में एकीकरण संभालता है।

## यह ऐप में क्या जोड़ सकता है

- Yolfi भुगतान लिंक के माध्यम से होस्टेड क्रिप्टो भुगतान पेज।
- डिजिटल उत्पादों, क्रेडिट, फाइलों, टूल या गेम आइटम के लिए एकबारगी भुगतान लिंक।
- Yolfi खाते में समर्थन होने पर नियमित भुगतान या सदस्यता जैसे भुगतान लिंक।
- दान और क्रिएटर समर्थन पेज।
- सर्वर रूट जो भुगतान लिंक से सार्वजनिक भुगतान इनवॉइस बनाते हैं।
- Yolfi सार्वजनिक भुगतान endpoints के माध्यम से भुगतान स्थिति जांच।
- Webhook हैंडलर जो `X-Yolfi-Signature` सत्यापित करते हैं।
- Webhook आधारित पहुंच नियम जो पुष्टि किए गए भुगतान इवेंट के बाद ही पहुंच खोलते हैं।
- Codex, Claude Code, Cursor, OpenClaw और अपने स्वचालन के लिए एजेंट प्रक्रियाएं।

## एजेंट स्किल

इस पैकेज में `SKILL.md` में **Yolfi Payments Skill** शामिल है। इसका उपयोग कोडिंग एजेंटों के साथ करें जब उपयोगकर्ता क्रिप्टो भुगतान, भुगतान लिंक, भुगतान पेज, सदस्यता, दान, भुगतान वाले डाउनलोड, भुगतान वाली पहुंच या Webhook आधारित अधिकार जोड़ने को कहे।

सुझाई गई सुरक्षित प्रक्रिया:

```txt
ऐप देखें -> YOLFI_API_KEY जांचें -> जरूरत हो तो पंजीकरण करें -> उपयोगकर्ता से वॉलेट और कीमत पूछें -> संगठन सेट करें -> भुगतान लिंक बनाएं या पुन: उपयोग करें -> भुगतान पेज जोड़ें -> Webhook सत्यापन जोड़ें -> स्थिति जांचें
```

यह स्किल एजेंटों को बताती है कि वे क्या अपने आप कर सकते हैं और किन फैसलों के लिए उपयोगकर्ता से पूछना जरूरी है। एजेंटों को वॉलेट पते, कीमतें, प्लान, मुद्राएं, सीक्रेट रखने की जगह या भुगतान लिंक पर विनाशकारी कार्रवाई कभी नहीं गढ़नी चाहिए।

## स्थापना

प्रोजेक्ट में स्थापित करें:

```bash
npm install @yolfi/agent
```

बिना स्थापित किए चलाएं:

```bash
npx -y @yolfi/agent help
```

stdio MCP सर्वर शुरू करें:

```bash
npx -y @yolfi/agent mcp
```

इस रिपॉजिटरी में स्थानीय विकास के लिए:

```bash
node packages/yolfi-agent/src/cli.js help
```

## प्रमाणीकरण

निजी कमांड स्पष्ट Yolfi API कुंजी या सुरक्षित रूप से स्थानीय स्तर पर सहेजे गए एजेंट क्रेडेंशियल का उपयोग करते हैं:

```bash
export YOLFI_API_KEY="yolfi_..."
```

CLI और MCP सर्वर डिफ़ॉल्ट रूप से Yolfi के प्रोडक्शन API और checkout का उपयोग करते हैं।

नए उपयोगकर्ता के लिए एजेंट ईमेल और प्रोजेक्ट नाम की पुष्टि के बाद ईमेल-सत्यापित पंजीकरण शुरू कर सकता है:

```bash
yolfi auth:agent-register \
  --email "owner@example.com" \
  --project-name "Space Shop" \
  --agent-name "Codex" \
  --integration-intent accept_payments \
  --ref npm
```

ईमेल नया होना चाहिए; मौजूदा खाते OAuth या ब्राउज़र सेटअप का उपयोग करते हैं। पहली कॉल पुष्टि लिंक भेजती है और लंबित check-in token को सुरक्षित रूप से स्थानीय कॉन्फ़िग में सहेजती है। मालिक के लिंक खोलने के बाद वही कमांड दोबारा चलाएँ। तभी पैकेज एक बार मिलने वाले एजेंट क्रेडेंशियल को सहेजता है और पूरी कुंजी को CLI तथा MCP आउटपुट से हटा देता है।

## त्वरित शुरुआत

API कुंजी से जुड़े कार्यक्षेत्र की जांच करें:

```bash
yolfi auth:status
```

उपयोगकर्ता द्वारा वॉलेट पते देने के बाद सेटलमेंट वॉलेट सेट करें:

```bash
yolfi settlement:configure --json examples/organization.settlement.json
```

Webhook डिलीवरी सेट करें:

```bash
yolfi webhooks:configure \
  --url https://example.com/api/yolfi/webhook \
  --adapter STRIPE
```

डुप्लिकेट बनाने से पहले मौजूदा भुगतान लिंक देखें:

```bash
yolfi paylinks:list --page 1 --rows 10
```

एकबारगी भुगतान लिंक बनाएं:

```bash
yolfi paylinks:create --json examples/paylink.one-time.json
```

भुगतान लिंक से सार्वजनिक भुगतान इनवॉइस बनाएं:

```bash
yolfi payments:create --json examples/payment.create.json
```

भुगतान स्थिति जांचें:

```bash
yolfi payments:status --id <paymentId>
```

हर CLI कमांड JSON लौटाता है, ताकि एजेंट टर्मिनल टेक्स्ट को पार्स किए बिना परिणाम पढ़ सकें।

## क्रिप्टो भुगतान के लिए MCP सर्वर

Yolfi Agent Kit उसी npm पैकेज में stdio MCP सर्वर शामिल करता है:

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

`yolfi_agent_register` सार्वजनिक एजेंट-पंजीकरण endpoint को कॉल करता है और इसके लिए `YOLFI_API_KEY` की जरूरत नहीं होती। पुष्टि लिंक खोलने के बाद उसी टूल को दोबारा कॉल करें; वह एक बार मिलने वाली API कुंजी को स्थानीय रूप से सहेजता है। निजी `yolfi-api` टूल को यह कुंजी चाहिए। `yolfi-knowledge` संसाधन कुंजी बनने से पहले एजेंट को एकीकरण का रास्ता समझने में मदद करते हैं।

उपलब्ध MCP टूल:

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

Webhook endpoint बनाते या उसका secret rotate करते समय CLI केवल एक बार मिलने वाले signing secret को सुरक्षित स्थानीय Yolfi config में सहेजती है और उसे CLI या MCP output में plaintext के रूप में कभी नहीं लौटाती। सहेजे गए secret का उपयोग करने के लिए `endpointId` को `yolfi_webhooks_verify` में दें। CI या secret-manager environment में इसके बदले स्पष्ट रूप से प्रबंधित `YOLFI_WEBHOOK_SECRET` दिया जा सकता है।

`yolfi_paylinks_disable` जैसे विनाशकारी टूल केवल उपयोगकर्ता की स्पष्ट अनुमति के बाद चलने चाहिए।

## एजेंटों के लिए JSON प्रक्रिया

एजेंट payload फाइल लिखकर उसे CLI को दे सकते हैं:

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

फिर चलाएं:

```bash
yolfi paylinks:create --json ./paylink.json
```

एजेंटों को लौटाए गए भुगतान लिंक ID को लक्षित ऐप की env/config में रखना चाहिए और ग्राहक-फेसिंग भुगतान पेज तथा स्थिति जांच के लिए Yolfi के सार्वजनिक भुगतान endpoints का उपयोग करना चाहिए।

## कमांड

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

## Endpoint एडेप्टर मैट्रिक्स

Yolfi Agent Kit दूसरी `/api/agent/*` API नहीं बनाता। यह एजेंट की कार्रवाइयों को मौजूदा Yolfi API से जोड़ता है:

| एजेंट कार्रवाई | API endpoint | प्रमाणीकरण |
| --- | --- | --- |
| Yolfi कार्यक्षेत्र पंजीकृत करें | `POST /api/auth/agent/register` | public; API कुंजी जरूरी नहीं |
| खाता जांचें | `GET /api/private/organization/current` | bearer API key |
| संगठन और सेटलमेंट वॉलेट सेट करें | `PUT /api/private/organization/current` | bearer API key |
| Webhook endpoint बनाएँ | `POST /api/private/organization/webhook-endpoints` | bearer API key |
| API कुंजी स्थिति देखें | `GET /api/private/organization/api-key` | bearer API key या cookie |
| भुगतान लिंक बनाएं | `POST /api/private/paylinks/create` | bearer API key |
| भुगतान लिंक सूचीबद्ध करें | `GET /api/private/paylinks` | bearer API key |
| भुगतान लिंक देखें | `GET /api/private/paylinks/:id` | bearer API key |
| भुगतान लिंक संपादित करें | `POST /api/private/paylinks/edit` | bearer API key |
| भुगतान लिंक बंद करें | `POST /api/private/paylinks/disable` | bearer API key और पुष्टि |
| सार्वजनिक भुगतान लिंक जानकारी | `GET /api/public/paylinks/:id` | public |
| सार्वजनिक भुगतान इनवॉइस बनाएं | `POST /api/public/payments` | public |
| भुगतान स्थिति | `GET /api/public/payments/:id` | public |
| व्यापारी लेनदेन | `GET /api/private/transactions` | bearer API key |

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

## Webhook सत्यापन

Yolfi Webhook payload पर `X-Yolfi-Signature` से हस्ताक्षर करता है। JSON पढ़ने और इवेंट पर भरोसा करने से पहले raw request body सत्यापित करें:

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

ब्राउज़र रीडायरेक्ट को भुगतान का प्रमाण न मानें। सत्यापित Webhook और Yolfi भुगतान स्थिति जांच का उपयोग करें।

## एआई कोडिंग एजेंटों के साथ उपयोग

Yolfi Agent Kit उन एजेंटिक भुगतान प्रक्रियाओं के लिए बनाया गया है जहां उपयोगकर्ता उच्च-स्तर का निर्देश देता है, जैसे "भुगतान जोड़ो", "यह डिजिटल उत्पाद बेचो", "दान बटन जोड़ो", "इस गेम के लिए भुगतान लो" या "इस सुविधा को भुगतान के पीछे रखो"।

- Codex: repo देखे, भुगतान पेज route/component जोड़े, env variables सेट करे और सत्यापित Webhook को मौजूदा access logic से जोड़े।
- Claude Code: MCP सर्वर और Agent Skill का उपयोग करके भुगतान लिंक, सर्वर हैंडलर और स्थिति जांच जोड़े, और वॉलेट/कीमत फैसलों के लिए उपयोगकर्ता से अनुमति ले।
- Cursor: Yolfi कुंजियों को कमिट किए गए स्रोत से बाहर रखते हुए भुगतान इंटरफ़ेस और सर्वर हैंडलर जोड़े।
- OpenClaw और अपने एजेंट: CLI, SDK, MCP टूल और JSON payloads के माध्यम से उत्पाद निर्माण प्रक्रियाओं को Yolfi से जोड़ें।

सुझाया गया एजेंट पथ:

```txt
auth:status -> organization:get -> paylinks:list -> उपयोगकर्ता पुष्टि -> settlement:configure -> webhooks:configure -> paylinks:create -> भुगतान पेज जोड़ें -> webhook सत्यापित करें -> payments:status
```

## एजेंट रेसिपी

`examples/` फ़ोल्डर में कॉपी करके उपयोग की जा सकने वाली प्रक्रियाएं और JSON payloads शामिल हैं:

- `examples/codex/add-yolfi-payments.md`
- `examples/claude-code/add-yolfi-payments.md`
- `examples/cursor/add-yolfi-payments.md`
- `examples/paylink.one-time.json`
- `examples/paylink.recurring.json`
- `examples/organization.settlement.json`
- `examples/payment.create.json`
- `examples/webhook.stripe-adapter.json`

## यह पैकेज क्या नहीं है

- यह अलग Yolfi डैशबोर्ड नहीं है।
- यह वॉलेट प्रदाता नहीं है।
- यह दोहराए गए व्यापारिक लॉजिक वाली दूसरी भुगतान API नहीं है।
- यह settlement wallets, product names, prices, currencies, subscriptions या donation amounts नहीं गढ़ता।
- यह destructive actions के लिए user confirmation को bypass नहीं करता।
- यह स्रोत कोड में सीक्रेट नहीं रखता।
- यह रीडायरेक्ट को भुगतान पुष्टि की तरह इस्तेमाल नहीं करता।

## मौजूदा सीमाएं

- MCP सर्वर अभी stdio transport का उपयोग करता है।
- Webhook signing के लिए हर endpoint का सुरक्षित secret उपयोग होता है; organization API key को signing secret की तरह उपयोग नहीं किया जाता।
- Agent registration पुष्ट check-in पर API key को केवल एक बार लौटाता है; स्थानीय package उसे सुरक्षित रूप से सहेजता है और output से हटा देता है।
- अंतिम भुगतान पुष्टि सत्यापित Webhook और भुगतान स्थिति जांच से आनी चाहिए, इंटरफ़ेस रीडायरेक्ट से नहीं।
- MCP directory approval इस package से अलग है। Listing accepted होने से पहले official directory approval का दावा न करें।

## यह पैकेज जिन खोज वाक्यों को कवर करता है

Developers और agent builders अक्सर खोजते हैं:

- एआई एजेंट भुगतान एकीकरण
- एआई कोडिंग एजेंट भुगतान
- भुगतान के लिए MCP सर्वर
- MCP क्रिप्टो भुगतान
- एजेंटों के लिए क्रिप्टो भुगतान API
- एआई एजेंटों के लिए भुगतान लिंक
- ऐप्स के लिए स्टेबलकॉइन भुगतान
- Webhook भुगतान सत्यापन
- एजेंटिक भुगतान प्रक्रिया
- Codex, Claude Code या Cursor से क्रिप्टो भुगतान जोड़ना

Yolfi Agent Kit इन प्रक्रियाओं के लिए package entry point है।

## लिंक

- Yolfi: <https://yolfi.com/hi>
- Agent Kit पेज: <https://yolfi.com/hi/ai-agent-kit>
- दस्तावेज़: <https://docs.yolfi.com/en/agent-kit>
- LLM index: <https://docs.yolfi.com/llms.txt>
- पूर्ण LLM context: <https://docs.yolfi.com/llms-full.txt>
- npm package: <https://www.npmjs.com/package/@yolfi/agent>
- GitHub repo: <https://github.com/yolfinance/yolfi-agent>
- Integration guide: <https://yolfi.com/hi/blog/ai-agent-payment-integration-api>
