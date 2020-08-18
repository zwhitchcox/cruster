import React, { useState, useEffect } from 'react'
import { v4 } from 'uuid'
import { homedir } from 'os'
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

  const [downloadDir, setDownloadDir] = useState("")
  useEffect(() => {
    setDownloadDir(ipcRenderer.sendSync("get-download-dir"))
  }, [])

  useEffect(() => {
    setDownloadDir(ipcRenderer.sendSync("get-download-dir"))
  }, [])

  const changeDownloadDir = () => ipcRenderer.send("change-download-dir")
  useEffect(() => {
    ipcRenderer.on("download-dir-changed", (event, arg) => {
      setDownloadDir(arg.downloadDir)
    })
  })

  const [outputDir, setOutputDir] = useState("")
  useEffect(() => {
    setOutputDir(ipcRenderer.sendSync("get-output-dir"))
  }, [])

  useEffect(() => {
    setOutputDir(ipcRenderer.sendSync("get-output-dir"))
  }, [])

  const changeOutputDir = () => ipcRenderer.send("change-output-dir")
  useEffect(() => {
    ipcRenderer.on("output-dir-changed", (event, arg) => {
      setOutputDir(arg.outputDir)
    })
  })

  const [ghUsername, setGHUsername] = useState("")
  const whyGHUsername = () => {

  }

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
      <br />
      {status}
      <div className="dir-container">
        <div>Download Directory: &nbsp;{downloadDir}
        </div>
        <button  onClick={changeDownloadDir}>Change</button>
      </div>
      <div className="dir-container">
        <div>Output Directory: &nbsp;{outputDir}
        </div>
        <button  onClick={changeOutputDir}>Change</button>
      </div>
      <div className="text-input-container">
        <div className="label">
          Github Username:&nbsp;&nbsp;
          <span className="modal-link" onClick={whyGHUsername}>?</span>
        </div>
        <div><input placeholder="Your Github Username" className="text-field" type="text" /></div>
      </div>
      <br />
      <button onClick={downloadImg}>Create Image</button>
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