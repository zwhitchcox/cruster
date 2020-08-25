const path = require('path')
const { download, downloadStr } = require('./lib/download')
const fs = require('fs-extra')
const unzipper = require('unzipper')
const { interact } = require('balena-image-fs')
const { promisify } = require('util')
const stream = require('stream')
const fetch = require('node-fetch')

const VERSION = "v0.0.1"

const downloadImg = async ({downloadID, mainWindow, force, downloadDir}) => {
  const downloadLocation = `https://github.com/zwhitchcox/cruster/releases/download/${VERSION}/node.zip`
  if (!await fs.exists(downloadDir)) {
  await fs.mkdir(downloadDir, {recursive: true})
  }
  const zipOutputPath = path.resolve(downloadDir, "node.zip")
  if (await fs.exists(zipOutputPath) && !force) {
  mainWindow.send("already-downloaded", {downloadID})
  return
  }

  await download(downloadLocation, zipOutputPath, percentage => {
  mainWindow.send("download-progress", {downloadID, percentage})
  })

  mainWindow.send("download-complete", {downloadID})
}

const unzipImg = async ({zipPath, outputPath, unzipID, mainWindow}) => {
  let lastPercentage = 0
  let progress = 0
  fs.createReadStream(zipPath)
    .pipe(unzipper.Parse())
    .pipe(stream.Transform({
      objectMode: true,
      transform: (entry, e, cb) => {
        const filename = entry.path;
        const total = entry.vars.uncompressedSize
        if (filename === "node.img") {
          entry
            .pipe(fs.createWriteStream(path.resolve(outputPath, "node.img")))
          entry
            .on('data', chunk => {
              const percentage = progress / total
              const diff = percentage - lastPercentage
              if (diff > .0005) {
                lastPercentage = percentage
                mainWindow.send("unzip-progress", {unzipID, percentage: percentage*100})
              }
              progress += chunk.length
            })
            .on('finish', () => {
              cb()
              mainWindow.send('unzip-complete', {unzipID})
            })
        } else {
          entry.autodrain()
        }
      }
    }))
}

const addSSHKeysByGithub = async ({ghUsername, overwrite, imgPath, mainWindow}) => {
  const keysFile = "/home/pi/.ssh/authorized_keys"
  const piUID = 1000
  const piGID = 1000
  try {
    let keys = await fetch(`https://github.com/${ghUsername}.keys`).then(resp => resp.text())
    await interact(imgPath, 2, async fs => {
      if (!overwrite) {
        try {
          keys += await promisify(fs.readFile)(keysFile)
        } catch(e) {}
      }
      await promisify(fs.writeFile)(keysFile, keys, 'utf8')
      await promisify(fs.chown)(keysFile, piUID, piGID)
    })
  } catch (error) {
    console.log("error", error.toString())
  }
}

const addSSHKeyByFile = async ({overwrite, imgPath, file}) => {
  if (!await fs.exists(file)) {
    throw new Error(`Could not find file ${file}`)
  }
  let keys = (await fs.readFile(file)).toString()
  await interact(imgPath, 2, async fs => {
    if (!overwrite) {
      try {
        // can't get fs.exists to work right now
        keys += await promisify(fs.readFile)("/root/.ssh/authorized_keys")
      } catch(e) {}
    }
    await promisify(fs.writeFile)('/root/.ssh/authorized_keys', keys, 'utf8')
  })
}

const addWifiCredentials = async ({ssid, wifiPassword, imgPath}) => {
  const file = "/etc/wpa_supplicant/wpa_supplicant.conf"
  const newWifiInfo = `
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="${ssid}"
    psk="${wifiPassword}"
}
`
  await interact(imgPath, 2, async fs => {
    let wifiInfo = ""
    // Commented code reads currentwifi file in case we want to append.
    // try {
    //   // can't get fs.exists to work right now
    //   wifiInfo += await promisify(fs.readFile)(file)
    // } catch(e) {
    //   throw new Error("Couldn't find wifi supplicant file on this disk.")
    // }
    await promisify(fs.writeFile)(file, wifiInfo + newWifiInfo, 'utf8')
  })
}

module.exports = {
  unzipImg,
  downloadImg,
  addSSHKeysByGithub,
  addSSHKeyByFile,
  addWifiCredentials,
}