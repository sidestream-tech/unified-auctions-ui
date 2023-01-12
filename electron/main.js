const { app, BrowserWindow } = require('electron');
const serve = require('electron-serve');

const loadURL = serve({ directory: '../frontend/dist' });

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ show: false });
    mainWindow.maximize();
    loadURL(mainWindow);
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
