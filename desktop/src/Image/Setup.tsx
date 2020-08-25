import React, { useState } from "react"
import "./Setup.css"
import { v4 } from 'uuid'

const isDev = process.env.NODE_ENV === "development"
const startGHUsername = isDev ? "zwhitchcox" : ""
const startWifiSSID = isDev ? "Home" : ""
const startWifiPassword = isDev ? "cherokee" : ""

const Setup = ({addToLog}) => {
  const [_, setRefresh] = useState(false)
  // force update
  const refresh = () => {
    setRefresh(true)
    setRefresh(false)
  }
  // ssh keys
  const [ghUsername, setGHUsername] = useState(startGHUsername)
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

  const pubKeyFile = ipcRenderer.sendSync("get-key-file")

  const pickFile = () => {
    ipcRenderer.send("change-key-file")
    const onChange = () => {
      refresh()
      ipcRenderer.off("file-picked", onChange)
    }
    ipcRenderer.on("file-picked", onChange)
  }
  const addKeysFromFile = () => {
    addToLog(`Adding SSH keys from ${pubKeyFile}...`)
    const id = v4()
    ipcRenderer.send("add-key-file", {id, overwrite: overwriteKeys})

    const onCompleted = (event, msg) => {
      if (id === msg.id) {
        addToLog("Key added.")
        ipcRenderer.off("file-key-added", onCompleted)
      }
    }
    ipcRenderer.on('file-key-added', onCompleted)
  }

  // wifi password
  const [wifiPassword, setWifiPassword] = useState(startWifiPassword)
  const [ssid, setSSID] = useState(startWifiSSID)
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
          Public key file: {pubKeyFile}
        </div>
        <div>
          <button className="button-two" onClick={pickFile}>Change</button>
        </div>
      </div>
      <button onClick={addKeysFromFile}>Add SSH Keys From File</button>
      <hr />
      <div>
        <h3 className="top-margin">Add Wifi Credentials</h3>
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