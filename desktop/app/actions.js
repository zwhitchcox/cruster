const Client = require('ssh2').Client;
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
    throw new Error (err)
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
        case "start-ssh-term":
          status = await startSSHTerm(msg)
          break
        case "run-ssh-cmd":
          status = await runSSHCmd(msg)
          break
        case "ssh-data":
          status = await sshData(msg)
          break
        case "run-interactive":
          status = await runInteractive(msg)
          break
        case "end-ssh-term":
          status = await endSSHTerm(msg)
          break
        default:
          throw new Error("Could not find action " + msg.type)
      }
      mainWindow.send("complete", {id, status})
    } catch (error) {
      mainWindow.send("action-error", {id, error})
      console.log(error.stack)
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
  const addWifiCredentials = async ({ssid, wifiPassword}) => {
    const { imagePath } = settings
    await _addWifiCredentials({imagePath, ssid, wifiPassword})
  }

  const sshTerms = {}
  const sshStreams = {}
  const startSSHTerm = ({id, host, username, interactive}) => {
    username = typeof username === "undefined" ? "root" : username
    return new Promise(async (res, rej) => {
      const privateKey = (await fs.readFile(settings.privateKeyFile)).toString()
      const conn = new Client();
      sshTerms[id] = conn
      conn.on('ready', () => {
        if (!interactive) {
          res(`Started ssh terminal at ${host} sucessfully.`)
        }
        conn.shell((err, stream) => {
          if (err) {
            rej(err)
          }
          sshStreams[id] = stream
          stream.on('close', (code, signal) => {
            mainWindow.send('data', {
              id,
              type: "exit-code",
              code,
              signal,
            })
          }).on('data', data => {
            mainWindow.send('data', {
              id,
              type: "data",
              data: data.toString(),
            })
          }).stderr.on('data-error', data => {
            mainWindow.send('data', {
              type: "error",
              id,
              data: data.toString(),
            })
          })
          res(`Started ssh terminal at ${host} sucessfully.`)
        })
      })
      .on("error", (err) => {
        rej(`Could not connect to ssh term at ${host}.\n${err}`)
      })
      conn.connect({
        host,
        port: 22,
        username: username,
        privateKey,
      })
    })
  }

  const runSSHCmd = async ({id, cmd}) => {
    return new Promise((res, rej) => {
      const conn = sshTerms[id]
      if (!conn) {
        rej("Could not find that connection")
      }
      mainWindow.send('data', {
        id,
        type: "data",
        data: cmd,
      })
      conn.exec(cmd, { pty: { cols: 80, rows: 24 } }, (err, stream) => {
        if (err) {
          rej(err)
        }
        stream.on('close', function(code, signal) {
          mainWindow.send('data', {
            id,
            type: "exit-code",
            code,
            signal,
          })
          res(`Exit code: ${code}`)
        }).on('data', data => {
          mainWindow.send('data', {
            id,
            type: "data",
            data: data.toString(),
          })
        }).stderr.on('data-error', data => {
          if (/^reboot/.test(cmd)) {
            mainWindow.send('data', {
              id,
              type: "exit-code",
              code: 0,
              signal: "",
            })
            return
          }
          mainWindow.send('data', {
            type: "error",
            id,
            data: data.toString(),
          })
        })
      })
    })
  }

  const sshData = ({id, data}) => {
    return new Promise((res, rej) => {
      const conn = sshTerms[id]
      const stream = sshStreams[id]
      if (!conn) {
        rej("Could not find that connection")
      }
      if (!stream) {
        rej("That connection is not interactive")
      }
      stream.write(data)
      res()
    })
  }

  const runInteractive = ({id, procID, cmd}) => {
    return new Promise((res, rej) => {
      const conn = sshTerms[procID]
      const stream = sshStreams[procID]
      if (!conn) {
        rej("Interactive: Could not find that connection")
      }
      if (!stream) {
        rej("Interactive: That connection is not interactive")
      }
      stream.write(cmd + "\n")
      stream.write(`echo DONE > /tmp/${id}\n`)
      const interval = setInterval(() => {
        const conn = sshTerms[procID]
        if (!conn) {
          res()
          return
        }
        conn.exec(`cat /tmp/${id}`, (err, stream) => {
          if (err) console.error("error checking file", err);
          stream.on('close', (code, signal) => {
            if (code === 0) {
              clearInterval(interval)
              res(`ran ${cmd}`)
            }
          }).on('data', (data) => {
          }).stderr.on('data', (data) => {
          });
        });
      }, 1000)
    })
  }

  const endSSHTerm = ({id}) => {
    const conn = sshTerms[id]
    if (!conn) return
    conn.end()
    delete sshTerms[id]
    if (sshStreams[id]) {
      sshStreams[id].end()
      delete sshStreams[id]
    }
  }


  // not used - should delete
  const cmdChecker = ({id, procID, ip}) => {
    return new Promise((res, rej) => {
      const conn = sshTerms[procID]
      const stream = sshStreams[procID]
      if (!conn) {
        rej("Could not find that connection")
      }
      if (!stream) {
        rej("That connection is not interactive")
      }
      stream.write(`echo DONE > /tmp/${procID}\n`)
      const interval = setInterval(() => {
        conn.exec(`cat /tmp/${id}`, (err, stream) => {
          if (err) throw err;
          stream.on('close', (code, signal) => {
            if (code === 0) {
              clearInterval(interval)
              res()
            }
            conn.end();
          }).on('data', function(data) {
            console.log('STDOUT: ' + data);
          }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
          });
        });
      }, 1000)
    })
  }
}