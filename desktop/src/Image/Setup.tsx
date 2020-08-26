import React, { useState, useContext } from "react"
import "./Setup.css"
import { v4 } from 'uuid'
import SettingsContext from '../SettingsContext';

// const isDev = process.env.NODE_ENV === "development"
// const startGHUsername = isDev ? "zwhitchcox" : ""
// const startWifiSSID = isDev ? "Home" : ""
// const startWifiPassword = isDev ? "cherokee" : ""

const Setup = ({addToLog}) => {
  const settings = useContext(SettingsContext)
  // ssh keys
  const [ghUsername, setGHUsername] = useState(settings.defaultGithubUsername)
  const [whyGHUsername, setWhyGHUsername] = useState(false)
  const [overwriteKeys, setOverwriteKeys] = useState(false)

  const addKeys = () => {
    addToLog("Adding SSH keys from github...")
    if (ghUsername === "") {
      addToLog("No github username specified.")
      return
    }
    const id = v4()
    ipcRenderer.send("add-keys-github", {id, overwrite: overwriteKeys, ghUsername})

    const onCompleted = (event, arg) => {
      // TODO: change all these to just use id
      // and move their return to the main.js listener function
      if (id === arg.id) {
        addToLog("Keys added.")
        ipcRenderer.off("github-keys-added", onCompleted)
      }
    }
    ipcRenderer.on('github-keys-added', onCompleted)
  }
  const addKeysFromFile = () => {
    addToLog(`Adding SSH keys from ${settings.publicKeyFile}...`)
    const id = v4()
    ipcRenderer.send("add-public-key-file", {id, overwrite: overwriteKeys})

    const onCompleted = (event, msg) => {
      if (id === msg.id) {
        addToLog("Key added.")
        ipcRenderer.off("public-file-key-added", onCompleted)
      }
    }
    ipcRenderer.on('file-key-added', onCompleted)
  }

  // wifi password
  const [wifiPassword, setWifiPassword] = useState(settings.defaultPSK)
  const [ssid, setSSID] = useState(settings.defaultSSID)
  const addWifi = () => {
    addToLog(`Adding Wifi Credentials for ${ssid}...`)
    const id = v4()
    ipcRenderer.send("add-wifi-credentials", {id, ssid, wifiPassword})

    const onCompleted = (event, msg) => {
      if (id === msg.id) {
        addToLog("Wifi credentials added.")
        ipcRenderer.off("wifi-credentials-added", onCompleted)
      }
    }
    ipcRenderer.on('wifi-credentials-added', onCompleted)
  }

  return (
    <div className="boxed">
      <h3 className="top-margin">SSH Keys</h3>
      <label className="checkbox-container indent-1">
        <input type="checkbox"
          checked={overwriteKeys}
          onChange={() => setOverwriteKeys(!overwriteKeys)}
        />
        <span className="checkmark" />
        Overwrite Keys
      </label>
      <div className="text-input-container">
        <div className="label">
          Github Username:&nbsp;&nbsp;
          <span className="modal-link" onClick={() => setWhyGHUsername(!whyGHUsername)}>?</span>
        </div>
        <div>
          <input
            placeholder="Your Github Username"
            className="text-field-github"
            type="text"
            onChange={e => setGHUsername(e.target.value)}
            value={ghUsername}
          />
        </div>
      </div>
      {!whyGHUsername ? "" : (
        <div>
          <p className="note">
            {"We can retrieve the public keys from your github account, so the app you can communicate with your raspberry pi without having to copy your keys manually (from https://github.com/<your username>.keys)"}
          </p>
          <br />
        </div>
      )}
      <br />
      <button onClick={addKeys}>Add SSH Keys From Github</button>
      <br />
      <br />
      <div className="key-file">
        <div>
          Public key file: {settings.publicKeyFile}
        </div>
        <div>
          {/* <button onClick={}>Change</button> */}
        </div>
      </div>
      <button onClick={addKeysFromFile}>Add SSH Keys From File</button>
      <hr />
      <div>
        <h3 className="top-margin-2">Add Wifi Credentials</h3>
        <div className="text-input-container">
          <div className="label">
            SSID ( Wifi Name):&nbsp;&nbsp;
          </div>
          <div>
            <input
              placeholder="SSID"
              className="text-field-github"
              type="text"
              onChange={e => setSSID(e.target.value)}
              value={ssid}
            />
          </div>
        </div>
        <div className="text-input-container">
          <div className="label">
            Wifi Password:&nbsp;&nbsp;
          </div>
          <div>
            <input
              placeholder="Wifi Password"
              className="text-field-github"
              type="password"
              onChange={e => setWifiPassword(e.target.value)}
              value={wifiPassword}
            />
          </div>
        </div>
        <div>
          <button onClick={addWifi}>Add Wifi Credentials</button>
        </div>
      </div>
    </div>
  )
}

export default Setup