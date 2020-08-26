const { dialog, ipcMain } = require('electron')
const {
  downloadImg,
  unzipImg,
  addSSHKeysByGithub,
  addSSHKeyByFile,
  addWifiCredentials,
} = require('./lib/img');

module.exports.actionsListen = ({mainWindow, settings}) => {
  ipcMain.on("run-action", async (event, msg) => {
    switch (msg.type) {
      case "add-public-key-file":
        addPublicKeyFile()
      default:
        console.error("Could not find action " + msg.type)
    }

  })
  ipcMain.on('add-public-key-file', async (event, {id, overwrite }) => {
    const { imgPath } = settings
    try {
      await addSSHKeyByFile({imgPath, overwrite, file: settings.publicKeyFile})
      mainWindow.send('public-file-key-added', {id})
    } catch (err) {
      showError(err)
    }
  })


  // Download

  ipcMain.on('download-image', async (event, {downloadID, force}) => {
    try {
      await downloadImg({
        mainWindow,
        downloadID,
        force,
        downloadDir: settings.crusterDir,
      })
    } catch (err) {
      showError(err)
    }
  })


  // unzip

  ipcMain.on('unzip-image', async (event, {unzipID, force}) => {
    const outputPath = settings.crusterDir
    const zipPath = path.resolve(outputPath, "node.zip")
    if (!force && await fs.exists(path.resolve(outputPath, "node.img"))) {
      mainWindow.send("already-unzipped", {unzipID})
      return
    }
    try {
      await unzipImg({
        zipPath,
        outputPath,
        unzipID,
        mainWindow,
      })
    } catch (err) {
      showError
    }
  })

  // add keys
  ipcMain.on("add-keys-github", async (event, {id, overwrite, ghUsername}) => {
    const { imagePath } = settings
    try {
      await addSSHKeysByGithub({ghUsername, overwrite, imagePath, mainWindow})
      mainWindow.send("github-keys-added", {id})
    } catch (err) {
      showError(err)
    }
  })

  const showError = err => {
    dialog.showErrorBox("Error", err.toString() + "\n" + err.stack)
  }

  // wifi

  ipcMain.on('add-wifi-credentials', async (event, {id, ssid, wifiPassword}) => {
    const { imgPath } = settings
    try {
      await addWifiCredentials({imgPath, ssid, wifiPassword})
      mainWindow.send('wifi-credentials-added', {id})
    } catch (err) {
      showError(err)
    }
  })

  // Writer

  ipcMain.on('write', (event, drives) => {
    console.log("drives", drives)
  })
}