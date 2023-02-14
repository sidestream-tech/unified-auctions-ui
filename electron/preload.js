const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getUpdateVersion: () => ipcRenderer.invoke('update-version'),
});
