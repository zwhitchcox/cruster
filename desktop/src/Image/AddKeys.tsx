import React, { useState } from "react"
import { v4 } from 'uuid'

const isDev = process.env.NODE_ENV === "development"
const startGHUsername = isDev ? "zwhitchcox" : ""

const AddKeys = ({addToLog}) => {
  const [ghUsername, setGHUsername] = useState(startGHUsername)
  const [whyGHUsername, setWhyGHUsername] = useState(false)
  const [overwriteKeys, setOverwriteKeys] = useState(false)
  const addKeys = () => {
    addToLog("Adding SSH keys from github...")
    if (ghUsername === "") {
      addToLog("No github username specified.")
      return
    }
    const addKeysID = v4()
    ipcRenderer.send("add-keys-github", {addKeysID, overwrite: overwriteKeys, ghUsername})

    const onCompleted = (event, arg) => {
      if (addKeysID === arg.addKeysID) {
        addToLog("Keys added.")
        ipcRenderer.off("github-keys-added", onCompleted)
      }
    }
    ipcRenderer.on('github-keys-added', onCompleted)
  }

  return (
    <div>
      <div className="text-input-container">
        <div className="label">
          Github Username:&nbsp;&nbsp;
          <span className="modal-link" onClick={() => setWhyGHUsername(!whyGHUsername)}>?</span>
        </div>
        <div>
          <input
            placeholder="Your Github Username"
            className="text-field"
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
      <label className="checkbox-container indent-1">
        <input type="checkbox"
          checked={overwriteKeys}
          onChange={() => setOverwriteKeys(!overwriteKeys)}
        />
        <span className="checkmark" />
        Overwrite Keys
      </label>
      <br />
      <button onClick={addKeys}>Add Keys From Github</button>

    </div>
  )
}

export default AddKeys