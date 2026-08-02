const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('qrForge', {
  encryptParams: (params, secret) =>
    ipcRenderer.invoke('encrypt-params', { params, secret }),
  generateQr: (text) => ipcRenderer.invoke('generate-qr', text),
  savePng: (dataUrl) => ipcRenderer.invoke('save-png', dataUrl),
  setWindowBg: (color) => ipcRenderer.invoke('set-window-bg', color),
  getPreferences: () => ipcRenderer.invoke('get-preferences'),
  setPreferences: (partial) => ipcRenderer.invoke('set-preferences', partial),
  getWorkspaceCache: () => ipcRenderer.invoke('get-workspace-cache'),
  setWorkspaceCache: (workspace) =>
    ipcRenderer.invoke('set-workspace-cache', workspace),
  saveWorkspace: (workspace) => ipcRenderer.invoke('save-workspace', workspace),
  openWorkspace: () => ipcRenderer.invoke('open-workspace'),
  shortenUrl: (url, endpoint, apiKey) =>
    ipcRenderer.invoke('shorten-url', { url, endpoint, apiKey }),
});
