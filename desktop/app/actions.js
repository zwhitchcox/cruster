const { dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs-extra')
const fetch = require('node-fetch')
const {
  downloadImg,
  unzipImg,
  addSSHKeys,
  addWifiCredentials: _addWifiCredentials,
} = require('./lib/img');

module.exports.actionsListen = ({mainWindow, settings}) => {
  const showError = err => {
    dialog.showErrorBox("Error", err.toString() + "\n" + err.stack)
  }

  ipcMain.on("run-action", async (event, msg) => {
    let status
    const {id} = msg
    try {
      switch (msg.type) {
        case "add-public-keys-file":
          status = await addPublicKeysFile(msg)
          break
        case "add-public-keys-github":
          status = await addPublicKeysGithub(msg)
          break
        case "download-image":
          status = await downloadImage(msg)
          break
        case "unzip-image":
          status = await unzipImage(msg)
          break
        case "add-wifi-credentials":
          status = await addWifiCredentials(msg)
          break
        case "write":
          console.log("drives", drives)
          break
        default:
          console.error("Could not find action " + msg.type)
          break
      }
      mainWindow.send("complete", {id, status})
    } catch (error) {
      mainWindow.send("action-error", {id, error})
      showError(error)
    }
  })

  // Keys
  const addPublicKeysFile = async ({overwrite}) => {
    const { imagePath } = settings
    const keys = await fs.readFile(settings.publicKeyFile)
    await addSSHKeys({imagePath, overwrite, keys})
    return `Keys added from ${settings.publicKeyFile} successfully.`
  }

  const addPublicKeysGithub = async ({ghUsername, overwrite}) => {
    let keys
    try {
      keys = await fetch(`https://github.com/${ghUsername}.keys`)
        .then(resp => {
          if (resp.status >= 400) {
            throw new Error(resp.status)
          }
          return resp
        })
        .then(resp => resp.text())
    } catch (error) {
      throw new Error("There was an error retrieving keys for " + ghUsername + ". " + error.toString())
    }
    const { imagePath } = settings
    addSSHKeys({keys, ghUsername, overwrite, imagePath})
    return `Keys added from Github successfully.`
  }

  // Download
  const downloadImage = async ({force, id}) => {
    return await downloadImg({
      onProgress: percentage => {
        mainWindow.send("progress", {id, percentage})
      },
      force,
      downloadDir: settings.crusterDir,
    })
  }


  // Unzip
  const unzipImage = async ({force, id}) => {
    const outputPath = settings.crusterDir
    const zipPath = path.resolve(outputPath, "node.zip")
    let status = ""
    if (await fs.exists(path.resolve(outputPath, "node.img"))) {
      if (force) {
        status += "Overwrote node.img. "
      } else {
        return "Already unzipped, not overwriting."
      }
    }
    await unzipImg({
      zipPath,
      outputPath,
      onProgress: percentage => {
        mainWindow.send("progress", {id, percentage})
      }
    })
    return status + "Unzipped sucessfully."
  }


  // wifi
  const addWifiCredentials = async ({id, ssid, wifiPassword}) => {
    const { imagePath } = settings
    await _addWifiCredentials({imagePath, ssid, wifiPassword})
  }
}