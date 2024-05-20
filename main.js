const { app, BrowserWindow } = require('electron');
const Store = require('electron-store');

Store.initRenderer();

function createWindow() {
    const mainWindow = new BrowserWindow({
        fullscreen: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            //devTools: false
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
