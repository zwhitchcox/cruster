import React, { useContext, useState } from 'react'
import SettingsContext from '../../Contexts/SettingsContext';
import ActionsContext from '../../Contexts/ActionsContext';
const Keys = () => {
  const settings = useContext(SettingsContext)
  const { runAction, addToLog } = useContext(ActionsContext)
  const [ghUsername, setGHUsername] = useState(settings.defaultGithubUsername)
  const [whyGHUsername, setWhyGHUsername] = useState(false)
  const [overwrite, setOverwrite] = useState(false)
  const addKeysFromGithub = () => {
    if (ghUsername === "") {
      addToLog("No github username specified.")
      return
    }
    runAction({
      type: "add-public-keys-github",
      status: "Adding SSH keys from github...",
      args: {
        overwrite,
        ghUsername,
      }
    })
  }
  const addKeysFromFile = () => runAction({
    type: "add-public-keys-file",
    status: `Adding SSH keys from ${settings.publicKeyFile}...`,
    args: {
      overwrite,
    }
  })
  return (
    <section>
      <h3 className="top-margin">SSH Keys</h3>
      <label className="checkbox-container indent-1">
        <input type="checkbox"
          checked={overwrite}
          onChange={() => setOverwrite(!overwrite)}
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
      <button onClick={addKeysFromGithub}>Add SSH Keys From Github</button>
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
    </section>
  )
}
export default Keys