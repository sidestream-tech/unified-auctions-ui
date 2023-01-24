const { app, BrowserWindow } = require('electron');
const serve = require('electron-serve');
const path = require('path')

const loadURL = serve({ directory: path.join(__dirname, '../frontend/dist/') });

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
        }
    });
    mainWindow.maximize();
    loadURL(mainWindow);
}

app.whenReady().then(() => {
    createWindow();
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
