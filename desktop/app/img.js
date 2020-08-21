const path = require('path')
const { download } = require('./util/download')
const fs = require('fs-extra')
const unzipper = require('unzipper')
const { interact } = require('balena-image-fs')
const { promisify } = require('util')
const stream = require('stream')
const { ipcMain } = require('electron')
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

;(async () => {
  try {
    // const imgPath = path.resolve(__dirname, "downloads", "node.img")
    const imgPath = '/home/zwhitchcox/Desktop/cruster/node.img'
    console.log({imgPath})
    const contents = await interact(imgPath, 2, async (fs) => {
      if (!(await promisify(fs.exists)('/home/pi/.ssh'))) {
        console.log("making dir")
        await promisify(fs.mkdir)('/home/pi/.ssh', {recursive: true})
      }
      return await promisify(fs.readFile)('/etc/passwd')
    })
    console.log(contents.toString())
  } catch(err) {console.log(err)}
})()

const addSSHKeysByGithub = async ({ghUsername, addKeysID, overwrite, imgPath, mainWindow}) => {
  try {
    let keys = await fetch(`https://github.com/${ghUsername}.keys`).then(res => res.text())
    await interact(imgPath, 2, async fs => {
      if (!overwrite) {
        try {
          keys += await promisify(fs.readFile)("/home/pi/.ssh/authorized_keys")
        } catch(e) {}
      }
      await promisify(fs.writeFile)('/home/pi/.ssh/authorized_keys', keys, 'utf8')
      mainWindow.send("github-keys-added", {addKeysID})
    })
  } catch (error) {
    console.log("error", error.toString())
  }
}

module.exports = {
  unzipImg,
  downloadImg,
  addSSHKeysByGithub,
}