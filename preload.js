const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('qrForge', {
  generateQr: (text) => ipcRenderer.invoke('generate-qr', text),
  savePng: (dataUrl) => ipcRenderer.invoke('save-png', dataUrl),
});
