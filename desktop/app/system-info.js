const { scanner } = require('./lib/scanner')
const electron = require('electron')
const { ipcMain } = electron
const fs = require('fs-extra')
const path = require('path')

const {stringify, parse} = JSON
const copy = obj => parse(stringify(obj))
const compare = (obj1, obj2) => stringify(obj1) === stringify(obj2)
const ipFromUrl = url => url.replace("http://", "").replace(":9090", "")
const lastNumIP = ip => Number(ipFromUrl(ip).split('.')[3])
const sortByIP = (a, b) => lastNumIP(a) - lastNumIP(b)

module.exports.scan = async ({mainWindow, settings}) => {
  // Nodes
  let curNodes = []
  let nodes = curNodes
  var Client = require('node-ssdp').Client
    , client = new Client();
  client.on('response', (headers, statusCode, rinfo) => {
    if (headers["ST"] && headers["ST"] == "cruster:node") {
      const url = headers["LOCATION"]
      if (!nodes.includes(url)) {
        nodes.push(url)
      }
      curNodes.push(url)
    }
  })
  setInterval(() => {
    // Give nodes 3 seconds to answer
    nodes = curNodes
    nodes.sort(sortByIP)
    curNodes = []
    client.search('cruster:node')
  }, 3000)


  // Drives
  const drives = {}
  scanner.on('attach', drive => {
    if (!drive.drive.isSystem) {
      drives[drive.path] = drive
    }
  })
  scanner.on('detach', drive => {
    delete drives[drive.path]
  })
  scanner.start()

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
    if (!compare(systemInfo, prevSystemInfo)) {
      mainWindow.send('system-info-changed', systemInfo)
    }
  }
  ipcMain.on('get-system-info', evt => {
    evt.returnValue = systemInfo
  })
  setInterval(loop, 1000)
}

  // const getNodeInfo = url => fetch(`${url}/node-info`)
  //   .then(r => {
  //     if (r.status > 399) {
  //       return Promise.reject(`Something went wrong getting the status for ${url}`)
  //     }
  //     return r.json()
  //   })
  //   .then(nodeInfo => {
  //     nodes[url] = {
  //     ...nodeInfo,
  //     apiResponded: true,
  //   }})
  //   .catch(() => {
  //     nodes[url] = {
  //       apiResponded: false,
  //     }
  //   })