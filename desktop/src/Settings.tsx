import React, { useState, useEffect, useContext } from 'react'
import "./Settings.css"
import Modal from './Modal';
import SettingsContext from './SettingsContext';
import { settings } from 'cluster';

const Settings = ({closeSettings, settingsOpen}) => {
  const settings = useContext(SettingsContext)
  const changeAsync = type => () => {
    ipcRenderer.send("change-setting", {
      type,
    })
  }
  const changeStr = (type) => e => {
    ipcRenderer.send("change-setting", {
      type,
      val: e.target.value,
    })
  }
  const changePersist = () => {
    ipcRenderer.send("change-setting", {
      type: "persist-sudo-password",
      val: !settings.persistSudoPassword,
    })
  }

  return (
    <Modal isModalOpen={settingsOpen} closeModal={closeSettings}>
      <div className="settings">
      <h4>General</h4>
      <div className="dir-container">
        <div>Cruster Directory: &nbsp;{settings.crusterDir}</div>
        <button onClick={changeAsync("cruster-dir")}>Change</button>
      </div>
      <label className="text-container">
        <div className="text">Your Sudo Password For This Computer:</div>
        <input
            placeholder="Your Sudo Password"
            className="text-field-sudo"
            type="password"
            onChange={changeStr("sudo-password")}
            value={settings.sudoPassword}
          />
      </label>
      <label className="checkbox-container indent-1">
        <input type="checkbox"
          checked={settings.persistSudoPassword}
          onChange={changePersist}
        />
        Persistently Store Password (Note: Do this at your own risk)
        <span className="checkmark" />
      </label>
      <h4>SSH Keys</h4>
      <label className="text-container">
        <div className="text">Default Github Username:</div>
        <input
            placeholder="Your Github Username"
            className="text-field"
            type="text"
            onChange={changeStr("default-github-username")}
            value={settings.defaultGithubUsername}
          />
      </label>
      <div className="key-file">
        <div>
          Public key file: {settings.publicKeyFile}
        </div>
        <div>
          <button onClick={changeAsync("public-key-file")}>Change</button>
        </div>
      </div>
      <div className="key-file">
        <div>
          Private key file: {settings.privateKeyFile}
        </div>
        <div>
          <button onClick={changeAsync("private-key-file")}>Change</button>
        </div>
      </div>
      <h4>Wifi Credentials</h4>
      <label className="text-container">
        <div className="text">Default SSID (Wifi Name):</div>
        <input
            placeholder="Network SSID"
            className="text-field"
            type="text"
            onChange={changeStr("default-ssid")}
            value={settings.defaultSSID}
          />
      </label>
      <label className="text-container">
        <div className="text">Default PSK (Wifi Password):</div>
        <input
            placeholder="Network PSK"
            className="text-field"
            type="text"
            onChange={changeStr("default-psk")}
            value={settings.defaultPSK}
          />
      </label>
      </div>
    </Modal>
  )
}

export default Settings
