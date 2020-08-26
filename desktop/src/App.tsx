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
import Modal from './Modal';
import Settings from './Settings';
import GearIcon from './GearIcon.svg'
import SettingsContext from './SettingsContext'

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

  return (
    <Router>
    <SettingsContext.Provider value={{
      ...settings,
      showSettings,
      closeSettings,
      }}>
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
    </SettingsContext.Provider>
    </Router>
  )
}

export default App;