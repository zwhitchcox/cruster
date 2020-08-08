const electron = require('electron');
const {ipcMain} = electron
const app = electron.app;
const { scanner } = require('./lib/scanner')
const BrowserWindow = electron.BrowserWindow;


const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    }
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

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

var Client = require('node-ssdp').Client
  , client = new Client();

client.on('response', function (headers, statusCode, rinfo) {
  mainWindow.webContents.send("node-response", headers)
});

ipcMain.on('search-nodes', (event, arg) => {
  client.search('cruster:node');
})


scanner.on('attach', drive => {
  mainWindow.webContents.send("drive-attached", drive)
})

scanner.on('detach', (...args) => {
  mainWindow.webContents.send("drive-detached", drive)
})

scanner.on('error', error => {
  mainWindow.webContents.send("scanner-error", drive)
  scanner.stop();
});

scanner.start();