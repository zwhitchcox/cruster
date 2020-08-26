import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import Clusters from './Clusters/Clusters';
import Image from './Image/Image'
import Settings from './Cmpt/Settings';
import GearIcon from './Cmpt/GearIcon.svg'
import SettingsContext from './Contexts/SettingsContext'
import { v4 } from 'uuid'
import ActionsContext from './Contexts/ActionsContext';

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
  })
  const [log, setLog] = useState("")
  const addToLog = item => {
    if (_log > log) {
      return setLog(_log = _log + "\n" + item)
    }
    setLog(_log = (log + "\n" + item))
  }
  // TODO: could make this promise I guess
  const runAction = ({type, status, args, onComplete, onProgress, onError}) => {
    const id = v4()
    const _onProgress = (_, msg) => {
      if (msg.id !== id) return
      addToLog(status)
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
    }
    const _onError = (_, msg) => {
      if (msg.id !== id) return
      addToLog(msg.error)
      if (typeof onError === "function") {
        onError(msg)
      }
      cleanUp()
    }
    const cleanUp = () => {
      ipcRenderer.off("error", _onError)
      ipcRenderer.off("progress", _onProgress)
      ipcRenderer.off("complete", _onComplete)
    }

    ipcRenderer.on("error", _onError)
    ipcRenderer.on("progress", _onProgress)
    ipcRenderer.on("complete", _onComplete)

    ipcRenderer.send("run-action", {id, type, ...args})
  }

  return (
    <Router>
    <SettingsContext.Provider value={{
      ...settings,
      showSettings,
      closeSettings,
      }}>
    <ActionsContext.Provider value={{runAction, addToLog}} >
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
        <br />
        <br />
        {/* <pre>{JSON.stringify(nodes, null, 2)}</pre> */}
      </nav>
      <main>
      <Settings {...({closeSettings, settingsOpen})} />
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
    </ActionsContext.Provider>
    </SettingsContext.Provider>
    </Router>
  )
}

export default App;