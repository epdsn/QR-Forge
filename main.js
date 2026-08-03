const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const QRCode = require('qrcode');
const packageJson = require('./package.json');

const DEFAULT_PREFS = {
  theme: 'light',
  lastSaveDir: null,
  shortenerEndpoint: '',
  shortenerApiKey: '',
};

function prefsPath() {
  return path.join(app.getPath('userData'), 'preferences.json');
}

function workspaceCachePath() {
  return path.join(app.getPath('userData'), 'workspace.json');
}

function readJson(filePath, fallback) {
  try {
    return { ...fallback, ...JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch {
    return { ...fallback };
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function readPrefs() {
  return readJson(prefsPath(), DEFAULT_PREFS);
}

function writePrefs(partial) {
  const next = { ...readPrefs(), ...partial };
  writeJson(prefsPath(), next);
  return next;
}

function readWorkspaceCache() {
  try {
    return JSON.parse(fs.readFileSync(workspaceCachePath(), 'utf8'));
  } catch {
    return null;
  }
}

function writeWorkspaceCache(workspace) {
  writeJson(workspaceCachePath(), workspace);
  return workspace;
}

function encryptPayload(params, secret) {
  if (!secret) {
    throw new Error('Encryption secret is required');
  }

  const key = crypto.createHash('sha256').update(String(secret), 'utf8').digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(params), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: base64url(iv || tag || ciphertext) — decrypt with the same secret
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1120,
    height: 860,
    minWidth: 480,
    minHeight: 700,
    title: 'QR Forge',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#ecebf8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
}

let aboutWindow = null;

function showAboutWindow() {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 360,
    height: 380,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    closable: true,
    title: 'About QR Forge',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#ecebf8',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  aboutWindow.setMenu(null);
  aboutWindow.once('ready-to-show', () => {
    if (aboutWindow && !aboutWindow.isDestroyed()) {
      aboutWindow.show();
    }
  });
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
  aboutWindow.loadFile('about.html', {
    query: { v: packageJson.version },
  });
}

function buildAppMenu() {
  const aboutItem = {
    label: 'About QR Forge',
    click: () => showAboutWindow(),
  };

  const template =
    process.platform === 'darwin'
      ? [
          {
            label: app.name,
            submenu: [
              aboutItem,
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
          { role: 'editMenu' },
          { role: 'windowMenu' },
        ]
      : [
          { role: 'fileMenu' },
          { role: 'editMenu' },
          { role: 'viewMenu' },
          { role: 'windowMenu' },
          {
            label: 'Help',
            submenu: [aboutItem],
          },
        ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildAppMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-preferences', () => readPrefs());

ipcMain.handle('set-preferences', (_event, partial) => writePrefs(partial || {}));

ipcMain.handle('get-workspace-cache', () => readWorkspaceCache());

ipcMain.handle('set-workspace-cache', (_event, workspace) =>
  writeWorkspaceCache(workspace)
);

ipcMain.handle('save-workspace', async (_event, workspace) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save Workspace',
    defaultPath: 'qr-forge-workspace.json',
    filters: [{ name: 'QR Forge Workspace', extensions: ['json'] }],
  });

  if (canceled || !filePath) return { ok: false };

  writeJson(filePath, workspace);
  writeWorkspaceCache(workspace);
  return { ok: true, filePath };
});

ipcMain.handle('open-workspace', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Open Workspace',
    filters: [{ name: 'QR Forge Workspace', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (canceled || !filePaths?.[0]) return { ok: false };

  try {
    const workspace = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'));
    writeWorkspaceCache(workspace);
    return { ok: true, filePath: filePaths[0], workspace };
  } catch {
    return { ok: false, error: 'Could not read workspace file' };
  }
});

ipcMain.handle('set-window-bg', (event, color) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && color) win.setBackgroundColor(color);
});

ipcMain.on('close-about-window', () => {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.destroy();
  }
});

ipcMain.handle('encrypt-params', async (_event, { params, secret }) => {
  return encryptPayload(params, secret);
});

/**
 * Calls a shortener / ID API you host (e.g. AWS API Gateway + Lambda).
 *
 * Request:  POST { url: "<long url>" }
 * Headers:  Content-Type: application/json
 *           Authorization: Bearer <apiKey>  (if set)
 *           x-api-key: <apiKey>             (if set)
 * Response: { "shortUrl": "https://..." }
 *           also accepts short_url or url
 */
ipcMain.handle('shorten-url', async (_event, { url, endpoint, apiKey }) => {
  const target = String(endpoint || '').trim();
  const longUrl = String(url || '').trim();

  if (!target) {
    throw new Error('Shortener endpoint is required');
  }
  if (!longUrl) {
    throw new Error('URL to shorten is required');
  }

  let parsedEndpoint;
  try {
    parsedEndpoint = new URL(target);
  } catch {
    throw new Error('Shortener endpoint must be a valid URL');
  }
  if (parsedEndpoint.protocol !== 'https:' && parsedEndpoint.protocol !== 'http:') {
    throw new Error('Shortener endpoint must use http or https');
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const key = String(apiKey || '').trim();
  if (key) {
    headers.Authorization = `Bearer ${key}`;
    headers['x-api-key'] = key;
  }

  const response = await fetch(target, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: longUrl }),
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      (data && (data.error || data.message)) ||
      text ||
      `HTTP ${response.status}`;
    throw new Error(`Shortener failed: ${detail}`);
  }

  const shortUrl = data?.shortUrl || data?.short_url || data?.url;
  if (!shortUrl || typeof shortUrl !== 'string') {
    throw new Error('Shortener response missing shortUrl');
  }

  try {
    new URL(shortUrl);
  } catch {
    throw new Error('Shortener returned an invalid shortUrl');
  }

  return shortUrl;
});

ipcMain.handle('generate-qr', async (_event, text) => {
  const dataUrl = await QRCode.toDataURL(text, {
    width: 560,
    margin: 2,
    color: {
      dark: '#12171d',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
  return dataUrl;
});

ipcMain.handle('save-png', async (_event, dataUrl) => {
  const prefs = readPrefs();
  const defaultPath = prefs.lastSaveDir
    ? path.join(prefs.lastSaveDir, 'qr-code.png')
    : 'qr-code.png';

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save QR Code',
    defaultPath,
    filters: [{ name: 'PNG Image', extensions: ['png'] }],
  });

  if (canceled || !filePath) return { ok: false };

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  writePrefs({ lastSaveDir: path.dirname(filePath) });
  return { ok: true, filePath };
});
