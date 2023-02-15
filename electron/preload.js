const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getUpdateUrl: () => ipcRenderer.invoke('getUpdateUrl'),
});
