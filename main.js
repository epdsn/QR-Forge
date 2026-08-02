const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

function createWindow() {
  const win = new BrowserWindow({
    width: 720,
    height: 860,
    minWidth: 560,
    minHeight: 700,
    title: 'QR Forge',
    backgroundColor: '#dce5ee',
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
