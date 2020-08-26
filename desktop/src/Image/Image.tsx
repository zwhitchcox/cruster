import React, { useState, useEffect } from 'react'
import "./Image.css"
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Download from './Download';
import Setup from './Setup/Setup';
import Chroot from './Chroot';
import Flash from './Flash';

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
          <Download />
        </Route>
        <Route path="/image/add-keys">
          <Setup />
        </Route>
        <Route path="/image/chroot">
          <Chroot />
        </Route>
        <Route path="/image/flash">
          <Flash drives={drives} />
        </Route>
      </Switch>
      <br />
    </div>
  )
}

export default Image