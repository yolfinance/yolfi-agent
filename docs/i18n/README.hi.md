![Yolfi Agent Kit: AI एजेंट से क्रिप्टो भुगतान](../../assets/ai-agent-payment.png)

# Yolfi Agent Kit: AI एजेंट से क्रिप्टो भुगतान

अपने AI एजेंट से क्रिप्टो भुगतान लिंक, होस्टेड चेकआउट और वेबहुक हस्ताक्षर सत्यापन जोड़ें। पैकेज में स्थानीय MCP सर्वर, JSON CLI, JavaScript SDK और Yolfi Payments Agent Skill शामिल हैं।

```text
इस प्रोजेक्ट में Yolfi भुगतान जोड़ें। https://docs.yolfi.com/ai का पालन करें।
```

लक्षित प्रोजेक्ट में एजेंट को यह संदेश भेजें। एजेंट कोड देखता है, उपलब्ध कनेक्शन चुनता है और अनुमति मिलने के बाद कार्यान्वयन जारी रखता है। मालिक केवल अनुपलब्ध निर्णय देता है, जैसे प्राप्तकर्ता वॉलेट या कीमत।

## भाषाएँ

[English](../../README.md), [Español](README.es.md), [Deutsch](README.de.md), [Français](README.fr.md), [简体中文](README.zh-CN.md), [Русский](README.ru.md), [हिन्दी](README.hi.md), [Türkçe](README.tr.md), [한국어](README.ko.md), [日本語](README.ja.md).

## दस्तावेज़

- [AI एकीकरण](https://docs.yolfi.com/en/agent-kit)
- [एजेंट कनेक्शन](https://docs.yolfi.com/en/agent-kit/connections)
- [HTTP API](https://docs.yolfi.com/en/api)
- [CLI](https://docs.yolfi.com/en/cli)
- [पूरा अंग्रेज़ी पैकेज गाइड](../../README.md)

## स्थानीय CLI

Node.js 18 या नया संस्करण आवश्यक है। npx से चलाएँ; वैश्विक स्थापना ज़रूरी नहीं। अनुमति न होने पर एजेंट setup चलाता है, मालिक के लिए loginUrl खोलता है और फिर checkin तथा auth:status चलाता है। YOLFI_API_KEY में नकली मान न डालें; वह सहेजे गए क्रेडेंशियल से अधिक प्राथमिकता रखता है।

```bash
npx -y @yolfi/agent help
npx -y @yolfi/agent auth:status
npx -y @yolfi/agent setup --agent local-agent
npx -y @yolfi/agent checkin --agent local-agent
npx -y @yolfi/agent auth:status
```

## MCP कनेक्शन

एक स्थानीय सर्वर सभी टूल, संसाधन और प्रॉम्प्ट देता है। https://app.yolfi.com/mcp का OAuth होस्ट संभालता है। उसी होस्ट में yolfi_auth_status से जाँचें; अलग CLI उसका OAuth नहीं पढ़ता। तरीका वातावरण की क्षमताओं से चुनें, केवल एजेंट के नाम से नहीं।

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

## पुनः उपयोग और सीक्रेट

पहले संगठन, वॉलेट, संबंधित भुगतान लिंक, वेबहुक एंडपॉइंट और प्रोजेक्ट सेटिंग पढ़ें। स्वीकृत मानों का पुनः उपयोग करें और केवल गायब जानकारी पूछें। settlement:configure PATCH द्वारा दिए नेटवर्क अपडेट करता है और बाकी बचाता है। webhooks:add अलग एंडपॉइंट बनाता है, इसलिए पहले मौजूदा एंडपॉइंट खोजें।

```bash
npx -y @yolfi/agent organization:get
npx -y @yolfi/agent paylinks:list
npx -y @yolfi/agent webhooks:list
```

--json चलाने से पहले लक्षित प्रोजेक्ट में JSON फ़ाइल बनाएँ। npx पैकेज के examples फ़ोल्डर को कार्य डायरेक्टरी में कॉपी नहीं करता।

स्थानीय CLI/MCP वेबहुक बनाने या घुमाने पर हस्ताक्षर सीक्रेट सुरक्षित कॉन्फ़िगरेशन में सहेजता है और आउटपुट में छिपाता है। एंडपॉइंट ID या YOLFI_WEBHOOK_SECRET से सत्यापन करें। SDK readWebhookSigningSecret(endpointId) सीक्रेट को बिना प्रिंट किए ऐप के सीक्रेट मैनेजर तक पहुँचा सकता है। कमांड या टूल आर्ग्युमेंट में सीक्रेट न डालें।

```bash
npx -y @yolfi/agent webhooks:verify --endpoint-id <endpointId> --payload ./raw-webhook.json --signature <signature>
```

होस्टेड भुगतान लिंक और सार्वजनिक भुगतान जाँच के लिए ऐप API कुंजी नहीं चाहिए। निजी Checkout Session बनाने के लिए अलग सर्वर क्रेडेंशियल और उसी ऑर्डर की दोबारा कोशिशों के लिए स्थिर idempotency key चाहिए। एजेंट OAuth ऐप क्रेडेंशियल नहीं है।

## सत्यापन

खाता अनुमति, कोड टेस्ट, रनटाइम सीक्रेट स्थापना और वास्तविक भुगतान/वेबहुक डिलीवरी की जाँच अलग बताएं। सफल कनेक्शन या ब्राउज़र रीडायरेक्ट पूरे भुगतान प्रवाह का प्रमाण नहीं है।
