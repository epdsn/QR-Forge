const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const QRCode = require('qrcode');

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
    width: 720,
    height: 940,
    minWidth: 560,
    minHeight: 760,
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

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('set-window-bg', (event, color) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && color) win.setBackgroundColor(color);
});

ipcMain.handle('encrypt-params', async (_event, { params, secret }) => {
  return encryptPayload(params, secret);
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
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save QR Code',
    defaultPath: 'qr-code.png',
    filters: [{ name: 'PNG Image', extensions: ['png'] }],
  });

  if (canceled || !filePath) return { ok: false };

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  return { ok: true, filePath };
});
