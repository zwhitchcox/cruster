const path = require('path')
const { download } = require('./util/download')
const fs = require('fs-extra')
const unzipper = require('unzipper')
const { interact } = require('balena-image-fs')
const { promisify } = require('util')
const stream = require('stream')
const { ipcMain } = require('electron')
const fetch = require('node-fetch')

const VERSION = "0.0.1"

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




  // const zip = new AdmZip(zipOutputPath)
  // zip.extractEntryTo("node.img", imgOutputPath)
}

const addSSHKeysByGithub = async ({ghUsername, addKeysID, overwrite, imgPath, mainWindow}) => {
  let keys = await fetch(`https://github.com/${ghUsername}.keys`)
  await interact(imgPath, 2, async fs => {
    await promisify(fs.mkdir)('/home/pi/.ssh')
    let prevContent = "";
    if (await promisify(fs.exists)('/home/pi.ssh/authorized_keys')) {
      prevContent = await promisify(fs.readFile)('/home/pi/.ssh/authorized_keys') + "\n"
    }
    if (!overwrite) {
      keys += prevContent
    }
    await promisify(fs.writeFile)('/home/pi/.ssh/authorized_keys', keys, 'utf8')
    mainWindow.send("github-keys-added", {addKeysID})
  })
}

module.exports = {
  unzipImg,
  downloadImg,
  addSSHKeysByGithub,
}