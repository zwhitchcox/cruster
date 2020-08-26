const { scanner } = require('./lib/scanner')
const electron = require('electron')
const { ipcMain } = electron
const fs = require('fs-extra')
const path = require('path')
const {stringify, parse} = JSON
const copy = obj => parse(stringify(obj))
const compare = (obj1, obj2) => stringify(obj1) === stringify(obj2)

// TODO: move these to a context and consolidate
module.exports.scan = async ({mainWindow, settings}) => {
  const {imagePath} = settings
  //Check if image exists
  let imageExists;
  const checkImageExists = async () => {
    imageExists = await fs.exists(imagePath)
  }
  setInterval(checkImageExists, 3 * 1000)
  await checkImageExists
  ipcMain.on("image-exists", event => {
    checkImageExists()
    event.returnValue = imageExists
  })

  // Check if image is mounted
  let imageMounted;
  const checkImageMounted = async () => {
    imageMounted = await fs.exists(path.resolve("/mnt", "node"))
  }
  setInterval(checkImageMounted, 3 * 1000)
  ipcMain.on("image-mounted", event => {
    checkImageMounted()
    event.returnValue = imageMounted
  })

  // Node Scanner
  const CHECK_INTERVAL = 3 * 1000 // check for new/deleted nodes every 3 seconds
  let nodes = []
  let _prevNodes = []

  var Client = require('node-ssdp').Client
    , client = new Client();

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

  client.on('response', (headers, statusCode, rinfo) => {
    if (headers["ST"] && headers["ST"] == "cruster:node") {
      const url = headers["LOCATION"]
      nodes.push(url)
    }
  })

  const check = () => {
    client.search('cruster:node')
    if (!compare(_prevNodes, nodes)) {
      mainWindow.send('nodes', _prevNodes = copy(nodes))
    }
    nodes = []
    setTimeout(check, CHECK_INTERVAL)
  }
  check()

  ipcMain.on('send-nodes', (event, arg) => {
    mainWindow.send('nodes', nodes)
  })


  // Drive Scanner

  scanner.on('attach', drive => {
    mainWindow.send("drive-attached", drive)
  })

  scanner.on('detach', drive => {
    mainWindow.send("drive-detached", drive)
  })

  scanner.on('error', error => {
    mainWindow.send("scanner-error", drive)
  });
  ipcMain.on('restart-scanner', () => {
    scanner.stop();
    scanner.start();
  })

  scanner.start()
}
