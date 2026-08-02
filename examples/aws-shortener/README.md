# QR Forge AWS shortener

Minimal shortener for QR Forge: **API Gateway HTTP API + Lambda + DynamoDB**.

- `POST /shorten` with `{ "url": "..." }` → `{ "shortUrl": "https://.../abc" }`
- `GET /{id}` → `302` redirect to the long URL

## Prerequisites

- AWS account + credentials configured (`aws configure`)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Deploy

```bash
cd examples/aws-shortener
npm install
sam build
sam deploy --guided
```

Optional API key during guided deploy (`ApiKey` parameter). If set, QR Forge must send the same value in **API key**.

## Connect QR Forge

1. From stack outputs, copy **ShortenerEndpoint**  
   (looks like `https://xxxx.execute-api.region.amazonaws.com/shorten`)
2. In QR Forge, enable **Shorten URL**
3. Paste that URL as **Shortener endpoint**
4. Paste the API key if you configured one
5. Click **Generate**

## Local smoke test

```bash
curl -X POST "$SHORTENER_ENDPOINT" \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d "{\"url\":\"https://example.com/path?code=test\"}"
```

You should get `{ "shortUrl": "..." }`. Opening that link in a browser redirects to the long URL.
