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

const sshKeyFile = "/root/.ssh/authorized_keys"
const addSSHKeys = async ({overwrite, imagePath, keys}) => {
  await interact(imagePath, 2, async fs => {
    if (!overwrite) {
      try {
        keys += await promisify(fs.readFile)(sshKeyFile)
      } catch(e) {
        console.error("couldn't read file")
      }
    }
    await promisify(fs.writeFile)(sshKeyFile, keys, 'utf8')
    // try {
    //   console.log('trying file')
    //   await promisify(fs.chown)(sshKeyFile, 0, 0)
    // } catch (err) {
    //   console.error(err, "chown")
    // }
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