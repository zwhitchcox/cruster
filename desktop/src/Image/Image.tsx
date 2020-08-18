import React, { useState, useEffect } from 'react'
import { v4 } from 'uuid'
import "./Image.css"

const statuses = {
  DOWNLOADING: "Downloading...",
  INACTIVE: "",
  UNZIPPING: "Unzipping...",
}
let log = ""

const Image = () => {
  const {
    DOWNLOADING,
    INACTIVE,
    UNZIPPING,
  } = statuses
  const addToLog = str => log += "\n" + str
  const [status, setStatus] = useState(INACTIVE)
  const [downloadPercentage, setDownloadPercentage] = useState(0)

  const unzipImg = () => {
    addToLog("Unzippping...")
  }

  const downloadImg = () => {
    if (status !== "") return
    addToLog("Downloading...")
    setStatus(DOWNLOADING)
    const downloadID = v4()
    ipcRenderer.send('download-image', {downloadID})
    ipcRenderer.on('download-progress', (event, {downloadID, percentage}) => {
      setDownloadPercentage(percentage)
    })
    const onCompleted = (event, arg) => {
      if (downloadID === arg.downloadID) {
        ipcRenderer.off('download-complete', onCompleted)
        addToLog("Download complete.")
        setStatus(UNZIPPING)
      }
    }
    const onAlreadyDownloading = (event, arg) => {
      if (downloadID === arg.downloadID) {
        addToLog("Already downloaded.")
        ipcRenderer.off('already-downloaded', onAlreadyDownloading)
        setStatus(UNZIPPING)
      }
    }
    ipcRenderer.on('already-downloaded', onAlreadyDownloading)
    ipcRenderer.on('download-complete', onCompleted)
  }
  return (
    <div>
      <button onClick={downloadImg}>Create Image</button>
      <br />
      {status}
      {status !== DOWNLOADING ? "" : <ProgressBar percentage={downloadPercentage} />}
      <pre>{log}</pre>
    </div>

  )
}

const ProgressBar = ({percentage}) => (
  <>
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