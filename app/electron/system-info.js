// const { scanner } = require('./lib/scanner')
const electron = require('electron')
const os = require('os')
const { ipcMain } = electron
const fs = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch')

const {stringify, parse} = JSON
const copy = obj => parse(stringify(obj))
const compare = (obj1, obj2) => stringify(obj1) === stringify(obj2)

const isDev = process.argv.includes("-d") || process.argv.includes("--development")
const storageDir = path.resolve(os.homedir(), ".config", "cruster")
// const storageDir = process.platform === "linux" ? linuxDir : path.resolve(__dirname, "..")
const storageFilePath = path.resolve(storageDir, `ip-cache${isDev ? "" : "-prod"}.json`)
const getStorage = async () => {
  await fs.mkdirp(storageDir)
  if (!await fs.exists(storageFilePath)) {
    await fs.writeJSON(storageFilePath, {})
  }
  const storage = JSON.parse(await fs.readFile(storageFilePath))
  return {
    get: key => storage[key],
    set: (key, val) => {
      storage[key] = val
      fs.writeJSON(storageFilePath, storage)
    }
  }
}

module.exports.scan = async ({mainWindow, settings}) => {
  // Nodes
  const storage = await getStorage()
  const ipCache = storage.get('ip-cache') || {}
  const saveIPCache = () => storage.set('ip-cache', ipCache)
  const curIPs = {}
  const nodes = {}
  var Client = require('node-ssdp').Client
    , client = new Client();
  client.on('response', (headers, statusCode, rinfo) => {
    if (headers["ST"] && headers["ST"] == "cruster:node") {
      const ip = headers["LOCATION"]
      if (ip in curIPs) return
      ipCache[ip] = true
      curIPs[ip] = true
      saveIPCache()
      getNodeInfo(ip)
    }
  })

  const getNodeInfo = async ip => {
    try {
      const nodeInfo = await fetch(`http://${ip}:9090/node-info`)
        .then(r => {
          if (r.status > 399) {
            return Promise.reject(`Something went wrong getting the status for ${url}`)
          }
          return r.json()
        })
      const newNodeInfo = {
        ...nodeInfo,
        apiResponded: true,
        ip,
      }
      nodes[ip] = newNodeInfo
      curIPs[ip] = true
      ipCache[ip] = true
    } catch (e) {
      if (nodes[ip]) {
        delete nodes[ip]
      }
    }
  }

  // first check all cached IPs in case windows
  // doesn't feel like fulfilling our ssdp request
  for (const ip in ipCache) {
    getNodeInfo(ip)
  }

  const refreshNodes = () => {
    for (const ip in curIPs) {
      getNodeInfo(ip)
    }
  }

  // Give nodes 3 seconds to answer
  setInterval(() => {
    client.search('cruster:node')
    refreshNodes()
    saveIPCache()
  }, 3000)

  // Drives
  const drives = {}
  // scanner.on('attach', drive => {
  //   if (!drive.drive.isSystem) {
  //     drives[drive.path] = drive
  //   }
  // })
  // scanner.on('detach', drive => {
  //   delete drives[drive.path]
  // })
  // scanner.start()

  // loop through system info and emit when changed every second
  let systemInfo = {
    imageExists: false,
    imageMounted: false,
    nodes: [],
    drives: {},
  }

  const loop = async () => {
    const prevSystemInfo = copy(systemInfo)
    systemInfo = {
      imageExists: await fs.exists(settings.imagePath),
      imageMounted: await fs.exists(path.resolve("/mnt", "node")),
      nodes,
      drives,
    }
    if (true || !compare(systemInfo, prevSystemInfo) && mainWindow) {
      mainWindow.send('system-info-changed', systemInfo)
    }
  }
  ipcMain.on('get-system-info', evt => {
    evt.returnValue = systemInfo
  })
  const interval = setInterval(loop, 1000)
  const onClose = () => {
    clearInterval(interval)
    mainWindow.off('close', onClose)
  }
  mainWindow.on('close', onClose)
}
