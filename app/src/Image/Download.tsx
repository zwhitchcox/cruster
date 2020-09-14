import React, {useState, useContext} from "react"
import ReactGA from 'react-ga'
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
  const run = async () => {
    try {
      ReactGA.event({
        category: 'App',
        action: 'Download Image'
      })
    } catch (e) {
      // want users to be able to use offline
    }
    if (status !== INACTIVE) return
    try {
      setStatus(DOWNLOADING)
      await runAction({
        status: "Downloading image...",
        type: "download-image",
        args: {force: forceRedownload},
        onProgress: ({percentage}) => setDownloadPercentage(percentage),
      })
      setStatus(UNZIPPING)
      await runAction({
        status: "Unzipping image...",
        type: "unzip-image",
        args: {force: forceReunzip},
        onProgress: ({percentage}) => setUnzipPercentage(percentage),
      })
      setStatus(INACTIVE)
    } catch (err) {
      setStatus(INACTIVE)
    }
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