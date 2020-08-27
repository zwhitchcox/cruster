const path = require('path')
const { download, downloadStr } = require('./download')
const fs = require('fs-extra')
const unzipper = require('unzipper')
const { interact } = require('balena-image-fs')
const { promisify } = require('util')
const stream = require('stream')
const fetch = require('node-fetch')

const VERSION = "v0.0.1"

const downloadImg = async ({onProgress, force, downloadDir}) => {
  const downloadLocation = `https://github.com/zwhitchcox/cruster/releases/download/${VERSION}/node.zip`
  if (!await fs.exists(downloadDir)) {
    await fs.mkdir(downloadDir, {recursive: true})
  }
  const zipOutputPath = path.resolve(downloadDir, "node.zip")
  if (await fs.exists(zipOutputPath) && !force) {
    return "Already downloaded."
  }

  await download(downloadLocation, zipOutputPath, onProgress)
  return "Download complete."
}

const unzipImg = async ({zipPath, outputPath, onProgress}) => {
  let lastPercentage = 0
  let progress = 0
  return new Promise((res, rej) => {
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

            // measure percentage done
            entry
              .on('data', chunk => {
                const percentage = progress / total
                const diff = percentage - lastPercentage
                if (diff > .0005) {
                  lastPercentage = percentage
                  onProgress(percentage*100)
                }
                progress += chunk.length
              })
              .on('error', (data) => {
                rej('There was an error. ' + data.toString())
              })
              .on('finish', () => {
                res("Unzipped sucessfully.")
                cb()
              })
          } else {
            entry.autodrain()
          }
        }
      }))
  })
}

const rootSSHKeyFile = "/root/.ssh/authorized_keys"
const piSSHKeyFile = "/home/pi/.ssh/authorized_keys"
const addSSHKeys = async ({overwrite, imagePath, keys}) => {
  await interact(imagePath, 2, async fs => {
    if (!overwrite) {
      try {
        keys += await promisify(fs.readFile)(rootSSHKeyFile)
      } catch(e) {} // if the file doesn't exist, that doesn't matter
    }
    await promisify(fs.writeFile)(rootSSHKeyFile, keys, 'utf8')
    await promisify(fs.chmod)(rootSSHKeyFile, 0o644)
    await promisify(fs.writeFile)(piSSHKeyFile, keys, 'utf8')
    await promisify(fs.chown)(piSSHKeyFile, 1000, 1000)
  })
}


const addWifiCredentials = async ({ssid, wifiPassword, imagePath}) => {
  const file = "/etc/wpa_supplicant/wpa_supplicant.conf"
  const newWifiInfo = `
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="${ssid}"
    psk="${wifiPassword}"
}
`
  await interact(imagePath, 2, async fs => {
    let wifiInfo = ""
    await promisify(fs.writeFile)(file, wifiInfo + newWifiInfo, 'utf8')
  })
}

module.exports = {
  unzipImg,
  downloadImg,
  addSSHKeys,
  addWifiCredentials,
}