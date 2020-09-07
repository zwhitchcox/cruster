if (require('electron-squirrel-startup')) return;
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

const os = require('os')
const path = require('path')
const electron = require('electron');
const { getSettings } = require('./settings')
const { termListen } = require('./terminal')
const { actionsListen } = require('./actions')
const { scan } = require('./system-info')

const {ipcMain} = electron
const app = electron.app;
const isDev = process.argv.includes("--development") || process.argv.includes("-d")
const BrowserWindow = electron.BrowserWindow;
console.log('starting')


let mainWindow, settings;
async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 900 + 600 : 900,
    height: 1000, //680
    icon: isDev ? path.join(__dirname, "../public/icons/512x512.png") : path.join(__dirname, '../icons/512x512.png'),
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'lib', 'preload'),
    }
  });
  settings = await getSettings({mainWindow})
  termListen({mainWindow, settings})
  actionsListen({mainWindow, settings})
  await scan({mainWindow, settings})

  const devUrl = 'http://localhost:3000'
  const prodUrl = `file://${path.join(__dirname, '../react/index.html')}`
  mainWindow.loadURL(isDev ? devUrl : prodUrl);
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
ipcMain.on("is-dev", e => e.returnValue = isDev)

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}