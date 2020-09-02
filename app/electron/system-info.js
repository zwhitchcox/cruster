// const { scanner } = require('./lib/scanner')
const electron = require('electron')
const { ipcMain } = electron
const fs = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch')

const {stringify, parse} = JSON
const copy = obj => parse(stringify(obj))
const compare = (obj1, obj2) => stringify(obj1) === stringify(obj2)

module.exports.scan = async ({mainWindow, settings}) => {
  // Nodes
  let curNodes = {}
  let nodes = curNodes
  var Client = require('node-ssdp').Client
    , client = new Client();
  client.on('response', (headers, statusCode, rinfo) => {
    if (headers["ST"] && headers["ST"] == "cruster:node") {
      const ip = headers["LOCATION"]
      getNodeInfo(ip)
    }
  })
  const getNodeInfo = ip => fetch(`http://${ip}:9090/node-info`)
    .then(r => {
      if (r.status > 399) {
        return Promise.reject(`Something went wrong getting the status for ${url}`)
      }
      return r.json()
    })
    .then(nodeInfo => {
      const newNodeInfo = {
        ...nodeInfo,
        ip,
        apiResponded: true,
      }
      if (!Object.keys(nodes).includes(ip)) {
        curNodes[ip] = newNodeInfo
      }
      curNodes[ip] = newNodeInfo
    })
    .catch(() => {
      curNodes[ip] = {
        ip,
        apiResponded: false,
      }
    })
  setInterval(() => {
    // Give nodes 3 seconds to answer
    nodes = curNodes
    curNodes = {}
    client.search('cruster:node')
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
      nodes: nodes,
      drives: drives,
    }
    if (!compare(systemInfo, prevSystemInfo) && mainWindow) {
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
