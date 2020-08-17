const path = require('path')
const { download } = require('./util/download')
const fs = require('fs')
const unzipper = require('unzipper')
const { interact } = require('balena-image-fs')
const { promisify } = require('util')

const zipOutputPath = path.resolve(__dirname, "downloads", "node.zip")
const VERSION = "0.0.1"

const downloadImg = () => {
  const downloadLocation = `https://github.com/zwhitchcox/cruster/releases/download/${VERSION}/node.zip`
  download(downloadLocation, zipOutputPath)
}

const imgOutputPath = path.resolve(__dirname, "downloads")
const unzipImg = () => {
  fs.createReadStream(zipOutputPath)
    .pipe(unzipper.Extract({path: imgOutputPath}))
  // const zip = new AdmZip(zipOutputPath)
  // zip.extractEntryTo("node.img", imgOutputPath)
}

const imgOutputFilePath = path.resolve(imgOutputPath, "node.img")
const addSSHKeysByGithub = async () => {
  await interact(imgOutputFilePath, 2, async fs => {
    await promisify(fs.mkdir)('/home/pi/.ssh')
    await promisify(fs.writeFile)('/home/pi/.ssh/id_rsa', 'this is my key', 'utf8')
    const contents = await promisify(fs.readFile)('/home/pi/.ssh/id_rsa')
    console.log('contents', contents.toString())
  })
}

addSSHKeysByGithub()

module.exports = {
  unzipImg,
  downloadImg,
  addSSHKeysByGithub,
}