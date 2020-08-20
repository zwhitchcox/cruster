import React, { useState, useEffect } from 'react'
import { v4 } from 'uuid'
import "./Image.css"
import LocalTerminal from '../Terminals/LocalTerminal'
const isDev = process.env.NODE_ENV === "development"

const startPass = isDev ? "hi" : ""
const statuses = {
  DOWNLOADING: "Downloading...",
  INACTIVE: "",
  UNZIPPING: "Unzipping...",
  ADDING_KEYS: "Adding Keys",
  CHROOT: "In Chroot...",
  UNMOUNT: "Unmounting...",
}
let log = ""

const platform = ipcRenderer.sendSync("get-platform")
let id

const Image = () => {
  const {
    DOWNLOADING,
    INACTIVE,
    ADDING_KEYS,
    UNMOUNT,
    CHROOT,
    UNZIPPING,
  } = statuses
  const addToLog = str => {
    log += "\n" + str
    refresh()
  }
  const [_, setRefresh] = useState(false)
  const refresh = () => {
    // in case in closure
    setRefresh(true)
    setRefresh(false)
  }
  const [status, setStatus] = useState(INACTIVE)
  const [downloadPercentage, setDownloadPercentage] = useState(0)
  const [unzipPercentage, setUnzipPercentage] = useState(0)

  const [forceRedownload, setForceRedownload] = useState(false)
  const [forceReunzip, setForceReunzip] = useState(false)
  const [crusterDir, setCrusterDir] = useState("")
  useEffect(() => {
    setCrusterDir(ipcRenderer.sendSync("get-cruster-dir"))
  }, [])

  useEffect(() => {
    setCrusterDir(ipcRenderer.sendSync("get-cruster-dir"))
  }, [])

  const changeCrusterDir = () => ipcRenderer.send("change-cruster-dir")
  useEffect(() => {
    ipcRenderer.on("cruster-dir-changed", (event, arg) => {
      setCrusterDir(arg.crusterDir)
    })
  })

  const createImg = () => {
    log = ""
    refresh()
    downloadImg()
  }


  const downloadImg = () => {
    if (status !== "") return
    addToLog("Downloading...")
    setStatus(DOWNLOADING)
    const downloadID = v4()
    ipcRenderer.send('download-image', {downloadID, force: forceRedownload})
    const onDownloadProgress = (event, arg) => {
      if (downloadID === arg.downloadID)
        setDownloadPercentage(arg.percentage)
    }
    ipcRenderer.on('download-progress', onDownloadProgress)
    const onCompleted = (event, arg) => {
      if (downloadID === arg.downloadID) {
        ipcRenderer.off('download-complete', onCompleted)
        ipcRenderer.off('download-progress', onDownloadProgress)
        ipcRenderer.off('already-downloaded', onAlreadyDownloaded)
        addToLog("Download complete.")
        setStatus(UNZIPPING)
        unzipImg()
      }
    }
    const onAlreadyDownloaded = (event, arg) => {
      if (downloadID === arg.downloadID) {
        addToLog("Already downloaded.")
        ipcRenderer.off('already-downloaded', onAlreadyDownloaded)
        setStatus(UNZIPPING)
        unzipImg()
      }
    }
    ipcRenderer.on('already-downloaded', onAlreadyDownloaded)
    ipcRenderer.on('download-complete', onCompleted)
  }

  const unzipImg = () => {
    addToLog("Unzipping...")
    const unzipID = v4()
    ipcRenderer.send('unzip-image', {unzipID, force: forceReunzip})

    const onUnzipProgress = (event, arg) => {
      if (unzipID === arg.unzipID)
        setUnzipPercentage(arg.percentage)
    }
    ipcRenderer.on('unzip-progress', onUnzipProgress)

    const off = () => {
      setStatus(ADDING_KEYS)
      ipcRenderer.off("unzip-complete", onCompleted)
      ipcRenderer.off("unzip-progress", onUnzipProgress)
      ipcRenderer.off("already-unzipped", onAlreadyUnzipped)
      addKeys()
    }
    const onCompleted = (event, arg) => {
      if (unzipID === arg.unzipID) {
        addToLog("Unzipped successfully.")
        off()
      }
    }
    const onAlreadyUnzipped = (event, arg) => {
      if (unzipID === arg.unzipID) {
        addToLog("Already unzipped.")
        off()
      }
    }
    ipcRenderer.on("unzip-complete", onCompleted)
    ipcRenderer.on('already-unzipped', onAlreadyUnzipped)
  }

  const [ghUsername, setGHUsername] = useState("")
  const [whyGHUsername, setWhyGHUsername] = useState(false)
  const [overwriteKeys, setOverwriteKeys] = useState(false)
  const addKeys = () => {
    addToLog("Adding SSH keys from github.")
    if (ghUsername === "") {
      addToLog("No github username specified.")
      setStatus(INACTIVE)
      return
    }
    const addKeysID = v4()
    ipcRenderer.send("add-keys-github", {addKeysID, overwrite: overwriteKeys, ghUsername})

    const onCompleted = (event, arg) => {
      if (addKeysID === arg.addKeysID) {
        addToLog("Keys added.")
        ipcRenderer.off("github-keys-added", onCompleted)
        setStatus(INACTIVE)
      }
    }
    ipcRenderer.on('github-keys-added', onCompleted)
  }

  const [sudoPassword, setSudoPassword] = useState(startPass)
  const imageExists = ipcRenderer.sendSync("image-exists")
  const isMounted = platform === "linux" && ipcRenderer.sendSync("image-mounted")
  const canChroot = platform === "linux" && imageExists && (status === INACTIVE || status === CHROOT)

  return (
    <div>
      <br />
      <div className="dir-container">
        <div>Cruster Directory: &nbsp;{crusterDir}
        </div>
        <button onClick={changeCrusterDir}>Change</button>
      </div>
      <div className="checkbox-options">
        <label className="checkbox-container indent-1">
          <input type="checkbox"
            checked={forceRedownload}
            onChange={() => setForceRedownload(!forceRedownload)}
          />
          <span className="checkmark" />
          Force Re-Download
        </label>
        <label className="checkbox-container indent-1">
          <input type="checkbox"
            checked={forceReunzip}
            onChange={() => setForceReunzip(!forceReunzip)}
          />
          <span className="checkmark" />
          Overwrite node.img
        </label>
      </div>
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
      <button className="button-two" onClick={createImg}>Create Image</button>
      {!canChroot ? "" : (
        <>
          <div className="chroot-button">
          <button className="button-two" onClick={() => setStatus(CHROOT)}>Chroot</button>
          <div>
            <input
              placeholder="Your Sudo Password"
              className="text-field"
              type="password"
              onChange={e => setSudoPassword(e.target.value)}
              value={sudoPassword}
            />
          </div>
          </div>
        </>
      )}
      {!isMounted ? "" : <button className="button-two" onClick={() => setStatus(UNMOUNT)}>Unmount</button>}
      <br />
      <br />
      {status !== DOWNLOADING ? "" : <ProgressBar percentage={downloadPercentage} title={DOWNLOADING} />}
      {status !== UNZIPPING ? "" : <ProgressBar percentage={unzipPercentage} title={UNZIPPING} />}
      {!(CHROOT === status && canChroot) ? "" : <LocalTerminal
        sudo={true}
        sudoPassword={sudoPassword}
        scripts={["mount", "chroot"]}
        crusterDir={crusterDir} />}
      {!(UNMOUNT === status) ? "" : <LocalTerminal
        sudo={true}
        sudoPassword={sudoPassword}
        scripts={["unmount"]}
        crusterDir={crusterDir} />}
      <pre>{log}</pre>
    </div>

  )
}

const ProgressBar = ({percentage, title}) => (
  <>
  {title ? <div className="progress-title">{title}</div> : ""}
  <div className="progress-bar">
    <div className="progress-percentage">{`${percentage.toPrecision(3)}%`}</div>
    <div className="progress-bar-container">
      <div className="progress-bar-bg" />
      <div
        style={{width: `${percentage}%`}}
        className="progress-bar-progress"
      />
    </div>
  </div>
  </>
)

export default Image