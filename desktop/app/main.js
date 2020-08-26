const os = require('os')
const path = require('path')
const electron = require('electron');
const isDev = require('electron-is-dev');
const { getSettings } = require('./settings')
const { termListen } = require('./terminal')
const { actionsListen } = require('./actions')
const { scan } = require('./scan')



const {ipcMain} = electron
const app = electron.app;
// const { scanner } = require('./lib/scanner')
const BrowserWindow = electron.BrowserWindow;

let mainWindow, settings;
async function init() {
  mainWindow = new BrowserWindow({
    width: isDev ? 900 + 600 : 900,
    height: 1000, //680
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'lib', 'preload.js')
    }
  });
  settings = await getSettings({mainWindow})
  termListen({mainWindow, settings})
  actionsListen({mainWindow, settings})
  await scan({mainWindow, settings})

  const devUrl = 'http://localhost:3000'
  const prodUrl = `file://${path.join(__dirname, '../build/index.html')}`
  mainWindow.loadURL(isDev ? devUrl : prodUrl);
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', init);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("get-platform", (event) => {
  event.returnValue = process.platform
})

ipcMain.on('home-dir', (event) => {
  event.returnValue = os.homedir()
})