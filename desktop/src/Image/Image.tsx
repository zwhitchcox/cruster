import React, { useState, useEffect } from 'react'
import "./Image.css"
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Download from './Download';
import Setup from './Setup';
import Chroot from './Chroot';
// import Unmount from './Unmount';
const isDev = process.env.NODE_ENV === "development"


let _log = ""
const startPass = isDev ? "hi" : ""

const Image = () => {
  // update cache
  ipcRenderer.send("image-exists")
  ipcRenderer.send("image-mounted")
  ipcRenderer.send("get-hostname")
  const [crusterDir, setCrusterDir] = useState(ipcRenderer.sendSync("get-cruster-dir"))
  useEffect(() => {
    ipcRenderer.on("cruster-dir-changed", (event, arg) => {
      setCrusterDir(arg.crusterDir)
    })
  })
  const [log, setLog] = useState("")
  const addToLog = (str) => {
    if (_log.length > log.length) {
      _log = _log + "\n" + str
      setLog(_log)
    } else {
      setLog(_log = (log + "\n" + str))
    }
  }

  const changeCrusterDir = () => ipcRenderer.send("change-cruster-dir")

  const [sudoPassword, setSudoPassword] = useState(startPass)

  return (
    <div>
      <div className="dir-container">
        <div>Cruster Directory: &nbsp;{crusterDir}
        </div>
        <button onClick={changeCrusterDir}>Change</button>
      </div>
      <label className="text-container">
      <div className="text">Your Sudo Password For This Computer:</div>
      <input
          placeholder="Your Sudo Password"
          className="text-field-sudo"
          type="password"
          onChange={e => setSudoPassword(e.target.value)}
          value={sudoPassword}
        />
      </label>
      <br />
      <div className="second-nav">
        <Link to="/image/download">
          <div className="btn btn-three">
          Download
          </div>
        </Link>
        <Link to="/image/add-keys">
          <div className="btn btn-three">
          Set Up
          </div>
        </Link>
        <Link to="/image/chroot">
          <div className="btn btn-three">
          Chroot
          </div>
        </Link>
        {/* <Link to="/image/unmount">
          <button className="button-two">Unmount</button>
        </Link> */}
      </div>
      <Switch>
        <Route path="/image/download">
          <Download {...({crusterDir, addToLog})} />
        </Route>
        <Route path="/image/add-keys">
          <Setup {...({crusterDir, addToLog})} />
        </Route>
        <Route path="/image/chroot">
          <Chroot {...({crusterDir, addToLog, sudoPassword})} />
        </Route>
        {/* <Route path="/image/unmount">
          <Unmount {...({crusterDir, sudoPassword})} />
        </Route> */}
      </Switch>
      <br />
      <pre>{log}</pre>
    </div>
  )
}

export default Image