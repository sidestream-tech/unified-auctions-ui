const path = require('path');
const url = require('url');
const semverGt = require('semver/functions/gt');
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const { version, repository } = require('./package.json');

autoUpdater.autoDownload = false;

function createWindow() {
    const mainWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
    });

    // open dist/index.html using file protocol
    mainWindow.loadURL(
        url.format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, 'dist/index.html'),
        })
    );

    // open external links in the default browser instead of a new window
    mainWindow.webContents.setWindowOpenHandler(details => {
        if (!details.url.startsWith('/')) {
            shell.openExternal(details.url);
        }
        return {
            action: 'deny',
        };
    });
}

app.whenReady().then(() => {
    createWindow();

    // check for updates
    ipcMain.handle('getUpdateUrl', async () => {
        const updateCheckResult = await autoUpdater.checkForUpdates();
        const isNewerVersionAvailable = semverGt(updateCheckResult.updateInfo.version, version);
        return isNewerVersionAvailable ? `${repository.url}/releases/latest` : undefined;
    });

    autoUpdater.on('error', (error, _message) => {
        ipcMain.handle('getUpdateErrorCode', () => {
            return error.code;
        });
    });

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
