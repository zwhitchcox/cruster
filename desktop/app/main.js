const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const electron = require('electron');
const fetch = require('isomorphic-fetch')
const isDev = require('electron-is-dev');
const storage = require('electron-json-storage')
const pty = require('node-pty');
const { runSSH } = require("./run-ssh.js")
const { interactiveSSH } = require('./interactive-ssh')
const { dialog } = require('electron')
const { interact } = require('balena-image-fs')
const { downloadStr } = require('./util/download')
const split = require('split2');
const {
  downloadImg,
  unzipImg,
  addSSHKeysByGithub,
  addSSHKeyByFile,
  addWifiCredentials,
} = require('./img');
const { kill } = require('process');

const {ipcMain} = electron
const app = electron.app;
// const { scanner } = require('./lib/scanner')
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 900 + 600 : 900,
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

ipcMain.on("get-platform", (event) => {
  event.returnValue = process.platform
})

// Node Scanner

const CHECK_INTERVAL = 3 * 1000 // check for new/deleted nodes every 3 seconds
let nodes = {}
let _prevNodes = {};

var Client = require('node-ssdp').Client
  , client = new Client();

const getNodeInfo = url => fetch(`${url}/node-info`)
  .then(r => {
    if (r.status > 399) {
      return Promise.reject(`Something went wrong getting the status for ${url}`)
    }
    return r.json()
  })
  .then(nodeInfo => {
    nodes[url] = {
    ...nodeInfo,
    apiResponded: true,
  }})
  .catch(() => {
    nodes[url] = {
      apiResponded: false,
    }
  })

client.on('response', (headers, statusCode, rinfo) => {
  if (headers["ST"] && headers["ST"] == "cruster:node") {
    const url = headers["LOCATION"]
    getNodeInfo(url)
  }
})

const {stringify, parse} = JSON
const copy = obj => parse(stringify(obj))
const compare = (obj1, obj2) => stringify(obj1) === stringify(obj2)
const check = () => {
  client.search('cruster:node')
  if (!compare(_prevNodes, nodes)) {
    mainWindow.send('nodes', _prevNodes = copy(nodes))
  }
  nodes = {}
  setTimeout(check, CHECK_INTERVAL)
}
check()

ipcMain.on('send-nodes', (event, arg) => {
  mainWindow.send('nodes', nodes)
})

// SSH Connection
let key;
try {
key = fs.readFileSync(path.join(os.homedir(), ".ssh", "id_rsa")).toString()
} catch (e) {
  console.log("no key")
}
ipcMain.on('get-key', (event) => {
  event.returnValue = key
})

// SSH Run
ipcMain.on('run-cmd', (event, msg) => {
  const {cmd, host, key, id} = msg
  runSSH({
    id,
    cmd,
    host,
    key,
    mainWindow,
  })
})

// SSH Interactive
ipcMain.on('create-interactive', (_, msg) => {
  const {host, key, id} = msg
  interactiveSSH({
    id,
    host,
    key,
    mainWindow,
  })
})

const DONE_LINE = "__DONE__"
// Local Terminal
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
let curTerm;
const killCurTerm = () => {
  if (curTerm) {
    curTerm.kill()
  }
}
process.on('exit', killCurTerm)
process.on('unhandledException', killCurTerm)
ipcMain.on('kill-cur-term', killCurTerm)
ipcMain.on('local-terminal', (event, {id, sudoPassword}) => {
  let scriptQueue = []
  killCurTerm()
  const term = curTerm = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  })

  term.on('data', data => {
    // TODO: don't write DONE_LINE
    mainWindow.send("local-terminal-data", {id, data})
  })

  term
    .pipe(split())
    .on('data', line => {
      if (line === DONE_LINE) {
        if (scriptQueue.length) {
          const script = scriptQueue.shift()
          runScript(script)
        } else {
          mainWindow.send('local-terminal-complete', {id})
        }
      }
    })

  term.on('error', err => {
    mainWindow.send("local-terminal-data", {id, data: err})
  })

  const writeData = (event, msg) => {
    if (msg.id === id) {
      term.write(msg.data)
    }
  }

  const runScript = (script) => {
    const scriptPath = path.resolve(__dirname, "scripts", script + ".sh")
    term.write(`bash ${scriptPath}\n`)
    term.write(`echo ${DONE_LINE}\n`)
  }

  const runScripts = async (event, msg) => {
    if (msg.id === id) {
      for (const key in (msg.env || {})) {
        term.write(`export ${key}=${msg.env[key]}\n`)
      }
      scriptQueue = scriptQueue.concat(msg.scripts)
      runScript(scriptQueue.shift())
    }
  }

  const endTerm = (event, msg) => {
    if (msg.id === id) {
      killCurTerm()
      ipcMain.off('local-terminal-end', endTerm)
      ipcMain.off("local-terminal-data", writeData)
      ipcMain.off('local-terminal-run-scripts', runScripts)
      ipcMain.off('local-terminal-unmount-exit', unmountExit)
    }
  }

  const unmountExit = (event, msg) => {
    if (id === msg.id) {
      term.write("exit\n")
      runScript("unmount")
      // TODO: possible race condition if they switch back really quickly
      // should put lock on
      setTimeout(() => endTerm({}, {id}), 1000)
    }
  }
  ipcMain.on('local-terminal-run-scripts', runScripts)
  ipcMain.on('local-terminal-end', endTerm)
  ipcMain.on("local-terminal-data", writeData)
  ipcMain.on('local-terminal-unmount-exit', unmountExit)
  // const onKill = () => {
  //   endTerm({}, {id})
  //   killCurTerm()
  //   // const unmountScriptPath = path.resolve(__dirname, "scripts", "unmount.sh")
  // }

  // ipcMain.on('kill-cur-term', onKill)
  mainWindow.send("local-terminal-ready", {id})
})

/*
 *
 * Image
 *
*/

// directory
const getDownloadDir = () => {
  return path.resolve(crusterDir)
}
let crusterDir, imgPath;
;(async function getCrusterDir() {
  let _crusterDir = storage.get("cruster-dir");
  if (_crusterDir) {
    return crusterDir = _crusterDir
  }

  if (await fs.exists(_crusterDir = path.resolve(os.homedir(), "Desktop"))) {
    return crusterDir = path.resolve(_crusterDir, "cruster")
  }


  if (await fs.exists(_crusterDir = path.resolve(os.homedir(), "desktop"))) {
    return crusterDir = path.resolve(_crusterDir, "cruster")
  }

  crusterDir = path.resolved(os.homedir(), "cruster")
  imgPath = path.resolve(crusterDir, "node.img")
  checkImageExists()
})()


ipcMain.on('get-cruster-dir', (event) => {
  event.returnValue = crusterDir
})

ipcMain.on('change-cruster-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  if (!result.canceled) {
    crusterDir = result.filePaths[0]
    storage.set("cruster-dir", crusterDir)
  }
  mainWindow.send("cruster-dir-changed", {crusterDir})
})

let imageExists;
const checkImageExists = async () => {
  imageExists = await fs.exists(path.resolve(crusterDir, "node.img"))
}
// I know this won't give the actual value
// but it will the next time, and renders happen often
ipcMain.on("image-exists", event => {
  checkImageExists()
  event.returnValue = imageExists
})

let imageMounted;
const checkImageMounted = async () => {
  imageMounted = await fs.exists(path.resolve("/mnt", "node"))
}
ipcMain.on("image-mounted", event => {
  checkImageMounted()
  event.returnValue = imageMounted
})

// Download

ipcMain.on('download-image', async (event, {downloadID, force}) => {
  try {
    await downloadImg({
      mainWindow,
      downloadID,
      force,
      downloadDir: getDownloadDir(),
    })
  } catch (err) {
    showError(err)
  }
})


// unzip

ipcMain.on('unzip-image', async (event, {unzipID, force}) => {
  const outputPath = getDownloadDir()
  const zipPath = path.resolve(outputPath, "node.zip")
  if (!force && await fs.exists(path.resolve(outputPath, "node.img"))) {
    mainWindow.send("already-unzipped", {unzipID})
    return
  }
  try {
    await unzipImg({
      zipPath,
      outputPath,
      unzipID,
      mainWindow,
    })
  } catch (err) {
    showError
  }
})

// add keys
ipcMain.on("add-keys-github", async (event, {id, overwrite, ghUsername}) => {
  const imgPath = path.resolve(getDownloadDir(), "node.img")
  try {
    await addSSHKeysByGithub({ghUsername, overwrite, imgPath, mainWindow})
    mainWindow.send("github-keys-added", {id})
  } catch (err) {
    showError(err)
  }
})

ipcMain.on('home-dir', (event) => {
  event.returnValue = os.homedir()
})

let keyFile;
;(async function getKeyFile() {
  keyFile = storage.get("key-file");
  if (!keyFile) {
    keyFile = path.resolve(os.homedir(), ".ssh", "id_rsa.pub")
  }
})()


ipcMain.on('get-key-file', (event) => {
  event.returnValue = keyFile
})

ipcMain.on('change-key-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: "Pub Key File", extensions: ["pub"]}
    ]
  })
  if (!result.canceled) {
    keyFile = result.filePaths[0]
    storage.set("key-file", keyFile)
  }
  mainWindow.send("file-picked")
})

ipcMain.on('add-key-file', async (event, {id, overwrite }) => {
  const imgPath = path.resolve(crusterDir, "node.img")
  try {
    await addSSHKeyByFile({imgPath, overwrite, file: keyFile})
    mainWindow.send('file-key-added', {id})
  } catch (err) {
    showError(err)
  }
})
const showError = err => {
  dialog.showErrorBox("Error", err.toString() + "\n" + err.stack)
}

// wifi

ipcMain.on('add-wifi-credentials', async (event, {id, ssid, wifiPassword}) => {
  const imgPath = path.resolve(crusterDir, "node.img")
  try {
    await addWifiCredentials({imgPath, ssid, wifiPassword})
    mainWindow.send('wifi-credentials-added', {id})
  } catch (err) {
    showError(err)
  }
})

// this breaks whole app for some reason...find out why
// // hostname

// let hostname = ""
// const refreshHostname = async () => {
//   const imgPath = path.resolve(crusterDir, "node.img")
//   try {
//     hostname = await readHostname({imgPath})
//   } catch (err) {
//     hostname = "Err: Could not read hostname"
//   }
// }
// ipcMain.on('get-hostname', evt => (refreshHostname(), evt.returnValue = hostname))

// const writeHostname = async (evt, msg) => {

// }