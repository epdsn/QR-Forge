const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('qrForge', {
  encryptParams: (params, secret) =>
    ipcRenderer.invoke('encrypt-params', { params, secret }),
  generateQr: (text) => ipcRenderer.invoke('generate-qr', text),
  savePng: (dataUrl) => ipcRenderer.invoke('save-png', dataUrl),
  setWindowBg: (color) => ipcRenderer.invoke('set-window-bg', color),
});
