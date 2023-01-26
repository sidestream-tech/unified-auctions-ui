const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');

function createWindow() {
    const mainWindow = new BrowserWindow({ show: false });
    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
    });
    mainWindow.loadURL(
        url.format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, 'dist/index.html'),
        })
    );
    mainWindow.webContents.openDevTools();
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
