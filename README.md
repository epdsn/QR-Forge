# QR Forge

A simple desktop QR code generator for **Windows** and **macOS**. Enter a base URL, add the data you need in the query string (device ID, customer ID, or anything else), generate a QR code on screen, and save it as a PNG.

![Platforms](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-1a2b3a)
![License](https://img.shields.io/badge/license-MIT-0f766e)

## Features

- **Base URL + optional parameters** — build plain URLs or query strings as needed
- **Optional encryption** — pack parameters (or an empty payload) into a single AES-encrypted `code=` query value
- **Optional URL shortener** — on Generate, POST the long URL to your API and encode the short link in the QR
- **Live URL preview** — see the final link update as you type
- **On-screen QR code** — generate without leaving the window
- **PNG export** — save the code with a native Save dialog
- **Add / remove fields** — start with one optional parameter row; remove all if you only need the base URL
- **Self-contained installers** — no Node.js required on the end user’s machine

## Download

Build an installer from this repo (see below), or use a release artifact if one is published:

| Platform | Artifact |
|----------|----------|
| Windows  | `QR Forge Setup x.x.x.exe` |
| macOS    | `QR Forge-x.x.x.dmg` |

> **Note:** Windows installers are built on Windows; macOS `.dmg` files must be built on a Mac.

## Quick start (developers)

**Requirements:** [Node.js](https://nodejs.org/) 18+

```bash
npm install
npm start
```

## Build installers

```bash
# Windows (.exe installer) — run on Windows
npm run dist -- --win

# macOS (.dmg) — run on macOS
npm run dist -- --mac
```

Output lands in the `dist/` folder:

- Windows: `dist/QR Forge Setup 1.0.0.exe`
- macOS: `dist/QR Forge-1.0.0.dmg`

The Windows installer lets users choose the install folder and creates Start Menu and desktop shortcuts.

## How to use

1. Enter a **base URL** (e.g. `https://example.com/path`)
2. Optionally fill in parameter **keys** and **values**, or remove them for a plain URL
3. Optionally enable **Encrypt parameters** and enter a shared secret
4. Optionally enable **Shorten URL** and enter your shortener API endpoint
5. Confirm the **resulting URL** preview
6. Click **Generate**
7. Click **Save as PNG** to export the image

### Encryption mode

When encryption is on, plain query params are replaced with a single `code` parameter:

```
https://example.com/path?code=<base64url>
```

**Algorithm**

| Piece | Detail |
|-------|--------|
| Cipher | AES-256-GCM |
| Key | `SHA-256(utf8 secret)` → 32 bytes |
| IV | 12 random bytes |
| Payload | JSON object of your parameter key/value pairs |
| `code` value | base64url(`iv \|\| authTag \|\| ciphertext`) |

Layout of the decoded `code` bytes: **12-byte IV** + **16-byte auth tag** + **ciphertext**.

Example Node.js decrypt:

```js
const crypto = require('crypto');

function decryptCode(code, secret) {
  const buf = Buffer.from(code, 'base64url');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const key = crypto.createHash('sha256').update(secret, 'utf8').digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const json = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  return JSON.parse(json);
}
```

### URL shortener

When **Shorten URL** is on, Generate builds the full URL first (plain or encrypted), then `POST`s it to your endpoint. The QR encodes only the returned short link — ideal for large encrypted `code=` values.

**Request**

```http
POST /shorten
Content-Type: application/json
Authorization: Bearer <optional api key>
x-api-key: <optional api key>

{ "url": "https://example.com/path?code=..." }
```

**Response**

```json
{ "shortUrl": "https://go.example.com/x7K2" }
```

Also accepts `short_url` or `url` as the response field name.

Your AWS API can either redirect that short ID to the long URL, or resolve an ID to a stored payload — QR Forge only needs the `shortUrl` back.

A ready-to-deploy example lives in [`examples/aws-shortener`](examples/aws-shortener).

## Project structure

```
├── main.js        # Electron main process (QR generation, save dialog)
├── preload.js     # Secure bridge to the renderer
├── renderer.js    # UI logic
├── index.html     # App layout
├── styles.css     # Styling
├── package.json   # Dependencies and electron-builder config
└── examples/
    └── aws-shortener/   # API Gateway + Lambda + DynamoDB shortener
```

## Tech stack

- [Electron](https://www.electronjs.org/) — desktop shell
- [qrcode](https://www.npmjs.com/package/qrcode) — QR encoding
- [electron-builder](https://www.electron.build/) — Windows / macOS packaging

## License

MIT
