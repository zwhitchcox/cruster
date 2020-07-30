const electron = require('electron');
const {ipcMain} = electron
const app = electron.app;
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
  client.search('picluster:node');
})
// const { app, BrowserWindow, ipcMain } = require('electron');
// const isDev = require('electron-is-dev');
// const path = require('path');

// let mainWindow;

// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width:800,
//         height:600,
//         show: false
//     });
//     const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

//     mainWindow.loadURL(startURL);

//     mainWindow.once('ready-to-show', () => mainWindow.show());
//     mainWindow.on('closed', () => {
//         mainWindow = null;
//     });
// }
// app.on('ready', createWindow);

// var Client = require('node-ssdp').Client
//   , client = new Client();
// client.on('response', function (headers, statusCode, rinfo) {
//   console.log('Got a response to an m-search.');
// });
// ipcMain.on('search-nodes', () => {
//   client.search('ssdp:all');
// })