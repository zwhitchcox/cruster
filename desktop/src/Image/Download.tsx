import React, {useState, useEffect, useContext} from "react"
import { v4 } from 'uuid'
import ActionsContext from '../Contexts/ActionsContext';

const statuses = {
  DOWNLOADING: "Downloading...",
  INACTIVE: "",
  UNZIPPING: "Unzipping...",
}

const Download = () => {
  const {
    DOWNLOADING,
    INACTIVE,
    UNZIPPING,
  } = statuses

  const [status, setStatus] = useState(INACTIVE)

  const {runAction} = useContext(ActionsContext)

  const [downloadPercentage, setDownloadPercentage] = useState(0)
  const [unzipPercentage, setUnzipPercentage] = useState(0)

  const [forceRedownload, setForceRedownload] = useState(false)
  const [forceReunzip, setForceReunzip] = useState(false)
  const run = () => {
    if (status !== INACTIVE) return
    setStatus(DOWNLOADING)
    runAction({
      status: "Downloading image...",
      type: "download-image",
      args: {force: forceRedownload},
      onError: () => setStatus(INACTIVE),
      onComplete: runUnzip,
      onProgress: ({percentage}) => setDownloadPercentage(percentage),
    })
  }

  const runUnzip = () => {
    setStatus(UNZIPPING)
    runAction({
      status: "Unzipping image...",
      type: "unzip-image",
      args: {force: forceReunzip},
      onError: () => setStatus(INACTIVE),
      onComplete: () => setStatus(INACTIVE),
      onProgress: ({percentage}) => setUnzipPercentage(percentage),
    })
  }

  return (
    <div className="boxed">
      <h3 className="top-margin">Download Disk Image</h3>
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
      <button onClick={run}>Download Image</button>
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