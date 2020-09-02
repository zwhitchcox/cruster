const fs = require('fs-extra')
const path = require('path')
const { interactiveSSH } = require('./lib/interactive-ssh')
const { runSSH } = require("./lib/run-ssh.js")
const electron = require('electron')
const { ipcMain } = electron
const split = require('split2');
const pty = require('node-pty');
const os = require('os')

module.exports.termListen = ({mainWindow, settings}) => {
  // SSH Run
  ipcMain.on('run-cmd', (event, msg) => {
    const {cmd, host, privateKey, id} = msg
    runSSH({
      id,
      cmd,
      host,
      privateKey,
      mainWindow,
    })
  })

  // SSH Interactive
  ipcMain.on('create-interactive', async (_, msg) => {
    const {host, id} = msg
    const privateKey = (await fs.readFile(settings.privatekeyFile)).toString()
    interactiveSSH({
      id,
      host,
      privateKey,
      mainWindow,
    })
  })

  const DONE_LINE = "__DONE__"
  // Local Terminal
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  let curTerm;
  const killCurTerm = () => {
    if (curTerm) {
      curTerm.kill()
    }
  }
  process.on('exit', killCurTerm)
  process.on('unhandledException', killCurTerm)
  ipcMain.on('kill-cur-term', killCurTerm)
  ipcMain.on('local-terminal', (event, {id, sudoPassword}) => {
    let scriptQueue = []
    killCurTerm()
    const term = curTerm = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env,
    })

    term.on('data', data => {
      // TODO: don't write DONE_LINE
      mainWindow.send("local-terminal-data", {id, data})
    })

    term
      .pipe(split())
      .on('data', line => {
        if (line === DONE_LINE) {
          if (scriptQueue.length) {
            const script = scriptQueue.shift()
            runScript(script)
          } else {
            mainWindow.send('local-terminal-complete', {id})
          }
        }
      })

    term.on('error', err => {
      mainWindow.send("local-terminal-data", {id, data: err})
    })

    const writeData = (event, msg) => {
      if (msg.id === id) {
        term.write(msg.data)
      }
    }

    const runScript = (script) => {
      const scriptPath = path.resolve(__dirname, "scripts", script + ".sh")
      term.write(`bash ${scriptPath}\n`)
      term.write(`echo ${DONE_LINE}\n`)
    }

    const runScripts = async (event, msg) => {
      if (msg.id === id) {
        for (const key in (msg.env || {})) {
          term.write(`export ${key}=${msg.env[key]}\n`)
        }
        scriptQueue = scriptQueue.concat(msg.scripts)
        runScript(scriptQueue.shift())
      }
    }

    const endTerm = (event, msg) => {
      if (msg.id === id) {
        killCurTerm()
        ipcMain.off('local-terminal-end', endTerm)
        ipcMain.off("local-terminal-data", writeData)
        ipcMain.off('local-terminal-run-scripts', runScripts)
        ipcMain.off('local-terminal-unmount-exit', unmountExit)
      }
    }

    const unmountExit = (event, msg) => {
      if (id === msg.id) {
        term.write("exit\n")
        runScript("unmount")
        // TODO: possible race condition if they switch back really quickly
        // should put lock on
        setTimeout(() => endTerm({}, {id}), 1000)
      }
    }
    ipcMain.on('local-terminal-run-scripts', runScripts)
    ipcMain.on('local-terminal-end', endTerm)
    ipcMain.on("local-terminal-data", writeData)
    ipcMain.on('local-terminal-unmount-exit', unmountExit)
    // const onKill = () => {
    //   endTerm({}, {id})
    //   killCurTerm()
    //   // const unmountScriptPath = path.resolve(__dirname, "scripts", "unmount.sh")
    // }

    // ipcMain.on('kill-cur-term', onKill)
    mainWindow.send("local-terminal-ready", {id})
  })
}
