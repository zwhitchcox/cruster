const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const electron = require('electron');
const isDev = require('electron-is-dev');
const { getSettings } = require('./settings')
const { termListen } = require('./terminal')
const { actionsListen } = require('./actions')
const { scan } = require('./system-info')


const {ipcMain} = electron
const app = electron.app;
// const { scanner } = require('./lib/scanner')
const BrowserWindow = electron.BrowserWindow;

let mainWindow, settings;
async function createMainWindow() {
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
  mainWindow.loadURL(devUrl || isDev ? devUrl : prodUrl);
  // Prevent external resources from being loaded (like images)
  // when dropping them on the WebView.
  // See https://github.com/electron/electron/issues/5919
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('closed', () => mainWindow = null);
}
const init = async () => {
  if (!electron.app.requestSingleInstanceLock()) {
		electron.app.quit();
	} else {
		await electron.app.whenReady();
		const window = await createMainWindow();
		electron.app.on('second-instance', async (_event, argv) => {
			if (window.isMinimized()) {
				window.restore();
			}
			window.focus();
		});
	}
}

app.on('ready', init);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
ipcMain.on("get-dir", event => {
  event.returnValue = __dirname
})
electron.app.on('before-quit', () => {
	electron.app.releaseSingleInstanceLock();
	process.exit(0);
});

electron.app.on('window-all-closed', electron.app.quit);

ipcMain.on("get-platform", (event) => {
  event.returnValue = process.platform
})

ipcMain.on('home-dir', (event) => {
  event.returnValue = os.homedir()
})
ipcMain.on("kube-config-path", event => {
  event.returnValue = path.resolve(os.homedir(), ".kube", "config")
})