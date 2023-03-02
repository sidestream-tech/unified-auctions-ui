const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getUpdateUrl: () => ipcRenderer.invoke('getUpdateUrl'),
    getAppVersion: () => ipcRenderer.invoke('getAppVersion'),
    getReleasesLink: () => ipcRenderer.invoke('getReleasesLink'),
    getUpdateErrorCode: () => ipcRenderer.invoke('getUpdateErrorCode'),
});
