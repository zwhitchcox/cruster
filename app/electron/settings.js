const electron = require('electron')
const { ipcMain } = electron
const fs = require('fs-extra')
const path = require('path')
const os = require('os')

const isDev = process.argv.includes("-d") || process.argv.includes("--development")
const storageDir = path.resolve(os.homedir(), ".config", "cruster")
// const storageDir = process.platform === "linux" ? linuxDir : path.resolve(__dirname, "..")
const storageFilePath = path.resolve(storageDir, `settings${isDev ? "" : "-prod"}.json`)
const getStorage = async () => {
  await fs.mkdirp(storageDir)
  if (!await fs.exists(storageFilePath)) {
    await fs.writeJSON(storageFilePath, {})
  }
  const storage = JSON.parse(await fs.readFile(storageFilePath))
  return {
    get: key => storage[key],
    set: (key, val) => {
      storage[key] = val
      fs.writeJSON(storageFilePath, storage)
    }
  }
}

const {stringify, parse} = JSON
const copy = obj => parse(stringify(obj))
const compare = (obj1, obj2) => stringify(obj1) === stringify(obj2)

const getInitialCrusterDir = async () => {
  let crusterDir;
  if (crusterDir = storage.get("cruster-dir")) {
    return crusterDir
  }

  if (await fs.exists(crusterDir = path.resolve(os.homedir(), "Desktop"))) {
    return path.resolve(crusterDir, "cruster")
  }

  if (await fs.exists(crusterDir = path.resolve(os.homedir(), "desktop"))) {
    return path.resolve(_crusterDir, "cruster")
  }

  crusterDir = path.resolve(os.homedir(), "cruster")
  imgPath = path.resolve(crusterDir, "node.img")
  return crusterDir
}

const getInitialPublicKeyFile = async () => {
  let publicKeyFile
  if (publicKeyFile = storage.get("public-key-file")) {
    return publicKeyFile
  }
  publicKeyFile = path.resolve(os.homedir(), ".ssh", "id_rsa.pub")
  if (!await fs.exists(publicKeyFile)) {
    return "Could not find a public key file. Please create or select one."
  }
  return publicKeyFile
}

const getInitialPrivateKeyFile = async () => {
  let privateKeyFile
  if (privateKeyFile = storage.get("private-key-file")) {
    return privateKeyFile
  }
  privateKeyFile = path.resolve(os.homedir(), ".ssh", "id_rsa")
  if (!await fs.exists(privateKeyFile)) {
    return "Could not find a private key file. Please create or select one."
  }
  return privateKeyFile
}

const changeCrusterDir = async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  if (!result.canceled) {
    crusterDir = result.filePaths[0]
    storage.set("cruster-dir", crusterDir)
  }
}

const changePublicKeyFile = async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: "Public Key File", extensions: ["pub"]}
    ]
  })
  if (!result.canceled) {
    const newKeyFile = result.filePaths[0]
    storage.set("public-key-file", newKeyFile)
    return newKeyFile
  }
  return settings.publicKeyFile
}

const changePrivateKeyFile = async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: "Private Key File", extensions: [""]}
    ]
  })
  if (!result.canceled) {
    const newKeyFile = result.filePaths[0]
    storage.set("private-key-file", newKeyFile)
    return newKeyFile
  }
  return settings.privateKeyFile
}

const camelize = str => {
  let arr = str.split('-');
  let capital = arr
    .map((item, index) => index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item);
  return capital.join("");
}

ipcMain.on('change-setting', async (evt, msg) => {
  const prevSettings = copy(settings)
  const { type } = msg
  switch (type) {
    case "public-key-file":
      settings.publicKeyFile = await changePublicKeyFile()
      break
    case "private-key-file":
      settings.privateKeyFile = await changePrivateKeyFile()
      break
    case "cruster-dir":
      settings.crusterDir = await changeCrusterDir()
      break
    case "default-ssid":
      settings.defaultSSID = msg.val
      storage.set(type, msg.val)
      break
    case "default-psk":
      settings.defaultPSK = msg.val
      storage.set(type, msg.val)
      break
    case "default-github-username":
      settings[camelize(type)] = msg.val
      storage.set(type, msg.val)
      break
    case "sudo-password":
      var saveVal = settings["persist-sudo-password"] ? settings.sudoPassword : ""
      storage.set("sudo-password", saveVal)
      settings.sudoPassword = msg.val
      break
    case "persist-sudo-password":
      settings.persistSudoPassword = msg.val
      storage.set(type, msg.val)
      var saveVal = msg.val ? settings.sudoPassword : ""
      storage.set("sudo-password", saveVal)
      break
    default:
      console.error("Could not find setting " + type)
  }
  // utility variable
  refreshImagePath()

  if (!compare(prevSettings, settings)) {
    mainWindow.send("settings-changed", settings)
  }
})

const settings = {
  crusterDir: "",
  pubKeyFile: "",
  privateKeyFile: "",
  sudoPassword: "",
  defaultSSID: "",
  defaultPSK: "",
}

ipcMain.on('get-settings', event => event.returnValue = settings)
const refreshImagePath = () => {
  settings.imagePath = path.resolve(settings.crusterDir, "node.img")
}

let mainWindow, storage;
module.exports.getSettings = async (opts) => {
  storage = await getStorage()
  mainWindow = opts.mainWindow
  settings.crusterDir = await getInitialCrusterDir()
  settings.publicKeyFile = await getInitialPublicKeyFile()
  settings.privateKeyFile = await getInitialPrivateKeyFile()
  settings.defaultSSID = storage.get("default-ssid")
  settings.defaultPSK = storage.get("default-psk")
  settings.sudoPassword = storage.get("sudo-password")
  settings.defaultGithubUsername = storage.get("default-github-username")
  mainWindow.send("settings-changed", settings)
  refreshImagePath()
  return settings
}