import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga'
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import './App.css';
import Clusters from './Clusters/Clusters';
import Image from './Image/Image'
import Settings from './Cmpt/Settings';
import GearIcon from './Cmpt/GearIcon.svg'
import LogIcon from './Cmpt/LogIcon.svg'
import Log from './Cmpt/Log'
import SettingsContext from './Contexts/SettingsContext'
import { v4 } from 'uuid'
import ActionsContext from './Contexts/ActionsContext';
import SystemInfoContext from './Contexts/SystemInfoContext';
import { Terminal } from 'xterm'
import "xterm/css/xterm.css"


let _log = ""
function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const showSettings = () => setSettingsOpen(true)
  const closeSettings = () => setSettingsOpen(false)
  const [settings, setSettings] = useState(ipcRenderer.sendSync('get-settings'))
  useEffect(() => {
    ipcRenderer.on("settings-changed", (event, newSettings) => {
      setSettings(newSettings)
    })
  }, [])

  const [showLog,setShowLog] = useState(false)
  const toggleLog = () => setShowLog(!showLog)
  const [log, setLog] = useState("")
  const addToLog = item => {
    if (_log > log) {
      return setLog(_log = _log + "\n" + item)
    }
    setLog(_log = (log + "\n" + item))
  }
  const runAction = ({type, status, args, onComplete, onProgress, onError, onData, id}) => {
    return new Promise((res,rej) => {
      addToLog(status)
      id = id || v4()
      const _onData = (_, msg) => {
        if (msg.id !== id) return
        if (typeof onData === "function") {
          onData(msg)
        }
      }
      const _onProgress = (_, msg) => {
        if (msg.id !== id) return
        if (typeof onProgress === "function") {
          onProgress(msg)
        }
      }
      const _onComplete = (_, msg) => {
        if (msg.id !== id) return
        addToLog(msg.status)
        if (typeof onComplete === "function") {
          onComplete(msg)
        }
        cleanUp()
        res(msg)
      }
      const _onError = (_, msg) => {
        if (msg.id !== id) return
        addToLog(msg.error)
        if (typeof onError === "function") {
          onError(msg)
        }
        cleanUp()
        rej(msg)
      }
      const cleanUp = () => {
        ipcRenderer.off("data", _onData)
        ipcRenderer.off("error", _onError)
        ipcRenderer.off("progress", _onProgress)
        ipcRenderer.off("complete", _onComplete)
      }

      ipcRenderer.on("data", _onData)
      ipcRenderer.on("error", _onError)
      ipcRenderer.on("progress", _onProgress)
      ipcRenderer.on("complete", _onComplete)

      ipcRenderer.send("run-action", {id, type, ...args})
    })
  }
  const sshTerm = ({host, username, interactive}) => {
    const term = new Terminal({ cols: 80, rows: 24})
    const id = v4()
    if (interactive) {
      term.onData(data => {
        ipcRenderer.send("run-action", {
          type: "ssh-data",
          id,
          data,
        })
      })
      ipcRenderer.on('data', (_, msg) => {
        if (msg.id !== id) return
        if (["data", "error"].includes(msg.type)) {
          term.write(msg.data)
        }
        if (msg.type === "exit-code") {
          addToLog("exit status: " + msg.code)
        }
      })
    }
    const startTerm = () => runAction(({
      status: "Starting ssh term ",
      type: "start-ssh-term",
      args: {
        host,
        interactive,
      },
      id,
    }) as any)
    const curData = {
      gathering: false,
      data: "",
    }
    const runCmd = ({cmd, status}) => {
      return runAction(({
        type: "run-ssh-cmd",
        status,
        id,
        args: {cmd},
        onData: msg => {
          if (["data", "error"].includes(msg.type)) {
            if (curData.gathering) {
              curData.data += msg.data
            }
            term.write(msg.data)
          }
          if (msg.type === "exit-code") {
            addToLog("exit status: " + msg.code)
          }
        }
      }) as any)
    }
    const runCmdInteractive = async ({cmd}) => {
      // ipcRenderer.send("run-action", {
      //   type: "ssh-data",
      //   id,
      //   data: cmd + "\n",
      // })

      await runAction({
        type: "run-interactive",
        args: {
          cmd,
          procID: id,
          ip: host,
        },
      } as any)
    }

    const getOutput = async ({cmd}) => {
      curData.gathering = true
      await runCmd({cmd, status: `Gathering output for ${cmd}`})
      const result = curData.data
      curData.gathering = false
      curData.data = ""
      return result
    }

    const endTerm = () => (
      runAction(({
        status: `Ending terminal session ${username}@${host}`,
        type: "end-ssh-term",
        id,
      }) as any)
    )

    return {
      term,
      runCmd: interactive ? runCmdInteractive : runCmd,
      endTerm,
      startTerm,
      getOutput,
    }
  }

  const multiSSH = ({ips, username, interactive}) => {
    const processes = ips.map(ip => ({...sshTerm({host: ip, username, interactive}), ip}))
    const runAll = async ({cmd, status}) => {
      await Promise.all(processes.map(({ip, runCmd}) => runCmd({cmd, status: `${status} on ${ip}`})))
    }
    const startAll = async() => (
      await Promise.all(processes.map(({startTerm}) => startTerm()))
    )
    const endAll = async() => (
      await Promise.all(processes.map(({endTerm}) => endTerm()))
    )
    const getOutput = async({cmd}) => (
      await Promise.all(processes.map(({getOutput}) => getOutput(cmd)))
    )

    return {
      processes,
      runAll,
      startAll,
      endAll,
      getOutput
    }
  }


  const [systemInfo, setSystemInfo] = useState(ipcRenderer.sendSync("get-system-info"))
  useEffect(() => {
    ipcRenderer.on("system-info-changed", (evt, msg) => {
      setSystemInfo(msg)
    })
    setSystemInfo(ipcRenderer.sendSync('get-system-info'))
  }, [])
  useEffect(() => {
    try {
      ReactGA.initialize('G-VP5JKR4EEG')
    } catch(e) {
      // want users to be able to use even with no internet
    }
  }, [])


  return (
    <Router>
    <SettingsContext.Provider value={{
      ...settings,
      showSettings,
      closeSettings,
      }}>
    <ActionsContext.Provider value={{runAction, addToLog, sshTerm, multiSSH}} >
    <SystemInfoContext.Provider value={systemInfo}>
    {showLog ? <Log log={log} /> : ""}
    <div className="App-container">
    <img
      src={LogIcon}
      alt="Log Icon"
      className="log-icon"
      onClick={toggleLog} />
    <img
      src={GearIcon}
      alt="Settings Icon"
      className="settings-icon"
      onClick={showSettings} />
    <div className="App">
      <nav>
        <h1>CRUSTER</h1>
        <div className="justified-container">
          <Link to="/image">
            <div className="btn btn-one">
              <span>Image</span>
            </div>
          </Link>
          <Link to="/clusters">
          <div className="btn btn-one">
            <span>Clusters</span>
          </div>
          </Link>
        </div>
        {/* <pre>{JSON.stringify(nodes, null, 2)}</pre> */}
      </nav>
      <main>
      <Settings {...({closeSettings, settingsOpen})} />
      <br />
      <Switch>
        <Route path="/clusters">
          <Clusters />
        </Route>
        <Route path="/image">
          <Image />
        </Route>
      </Switch>
      </main>
    </div>
    </div>
    </SystemInfoContext.Provider>
    </ActionsContext.Provider>
    </SettingsContext.Provider>
    </Router>
  )
}

export default App;