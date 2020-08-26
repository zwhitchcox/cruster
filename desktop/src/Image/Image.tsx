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
import Flash from './Flash';
const isDev = process.env.NODE_ENV === "development"


let _log = ""
const startPass = isDev ? "hi" : ""
let _drives = {}
const useDrives = () => {
  const [drives, _setDrives] = useState({})
  const setDrives = (drives) => {
    _setDrives(_drives = drives)
  }
  useEffect(() => {
    ipcRenderer.send('restart-scanner')
    ipcRenderer.on('drive-attached', (event, drive) => {
      if (!drive.drive.isSystem) {
        setDrives({
          ..._drives,
          [drive.path]: drive
        })
      }
    })
    ipcRenderer.on('drive-detached', (event, drive) => {
      const newDrives = {..._drives}
      delete newDrives[drive.path]
      setDrives(newDrives)
    })
  }, [])
  return drives
}

const Image = () => {
  // update cache
  ipcRenderer.send("image-exists")
  ipcRenderer.send("image-mounted")
  ipcRenderer.send("get-hostname")

  const drives = useDrives()

  const [log, setLog] = useState("")
  const addToLog = (str) => {
    if (_log.length > log.length) {
      _log = _log + "\n" + str
      setLog(_log)
    } else {
      setLog(_log = (log + "\n" + str))
    }
  }


  return (
    <div>
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
        <Link to="/image/flash">
          <div className="btn btn-three">
          Flash
          </div>
        </Link>
      </div>
      <br />
      <Switch>
        <Route path="/image/download">
          <Download {...({addToLog})} />
        </Route>
        <Route path="/image/add-keys">
          <Setup {...({addToLog})} />
        </Route>
        <Route path="/image/chroot">
          <Chroot />
        </Route>
        <Route path="/image/flash">
          <Flash {...({addToLog, drives})} />
        </Route>
      </Switch>
      <br />
      <pre>{log}</pre>
    </div>
  )
}

export default Image