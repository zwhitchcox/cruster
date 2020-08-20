import React, {useState, useEffect} from "react"
import { v4 } from 'uuid'

const statuses = {
  DOWNLOADING: "Downloading...",
  INACTIVE: "",
  UNZIPPING: "Unzipping...",
}

let log = ""
const Download = ({crusterDir, addToLog}) => {
  const changeCrusterDir = () => ipcRenderer.send("change-cruster-dir")
  const [_, setRefresh] = useState(false)
  const refresh = () => {
    // in case in closure
    setRefresh(true)
    setRefresh(false)
  }
  const {
    DOWNLOADING,
    INACTIVE,
    UNZIPPING,
  } = statuses

  const [status, setStatus] = useState(INACTIVE)
  const [downloadPercentage, setDownloadPercentage] = useState(0)
  const [unzipPercentage, setUnzipPercentage] = useState(0)

  const [forceRedownload, setForceRedownload] = useState(false)
  const [forceReunzip, setForceReunzip] = useState(false)

  const createImg = () => {
    log = ""
    refresh()
    downloadImg()
  }

  const downloadImg = () => {
    if (status !== "") return
    addToLog("Downloading zip file...")
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
      ipcRenderer.off("unzip-complete", onCompleted)
      ipcRenderer.off("unzip-progress", onUnzipProgress)
      ipcRenderer.off("already-unzipped", onAlreadyUnzipped)
    }
    const onCompleted = (event, arg) => {
      if (unzipID === arg.unzipID) {
        addToLog("Unzipped successfully.")
        setStatus(INACTIVE)
        off()
      }
    }
    const onAlreadyUnzipped = (event, arg) => {
      if (unzipID === arg.unzipID) {
        addToLog("Already unzipped.")
        setStatus(INACTIVE)
        off()
      }
    }
    ipcRenderer.on("unzip-complete", onCompleted)
    ipcRenderer.on('already-unzipped', onAlreadyUnzipped)
  }

  return (
    <div>
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
      <br />
      <button onClick={createImg}>Download Image</button>
      <br />
      {status !== DOWNLOADING ? "" : <ProgressBar percentage={downloadPercentage} title={DOWNLOADING} />}
      {status !== UNZIPPING ? "" : <ProgressBar percentage={unzipPercentage} title={UNZIPPING} />}
    </div>
  )
}

export default Download

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