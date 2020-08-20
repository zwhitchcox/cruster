import React, { useState, useEffect } from 'react'
import { v4 } from 'uuid'
import "./Image.css"
import LocalTerminal from '../Terminals/LocalTerminal'
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Download from './Download';
import AddKeys from './AddKeys';
import Chroot from './Chroot';
import Unmount from './Unmount';
const isDev = process.env.NODE_ENV === "development"


let log = ""
const startPass = isDev ? "hi" : ""

const Image = () => {
  const [crusterDir, setCrusterDir] = useState(ipcRenderer.sendSync("get-cruster-dir"))
  useEffect(() => {
    ipcRenderer.on("cruster-dir-changed", (event, arg) => {
      setCrusterDir(arg.crusterDir)
    })
  })
  const [dummy, setDummy] = useState(false)
  const refresh = () => (setDummy(!dummy), setDummy(dummy))
  const addToLog = str => {
    log += str + "\n"
    refresh()
  }


  const [sudoPassword, setSudoPassword] = useState(startPass)

  return (
    <div>
      <div className="second-nav">
        <Link to="/image/download">
          <button className="button-two">Download</button>
        </Link>
        <Link to="/image/add-keys">
          <button className="button-two">Add Keys</button>
        </Link>
        <Link to="/image/chroot">
          <button className="button-two">Chroot</button>
        </Link>
        <Link to="/image/unmount">
          <button className="button-two">Unmount</button>
        </Link>
      </div>
      <Switch>
        <Route path="/image/download">
          <Download {...({crusterDir, addToLog})} />
        </Route>
        <Route path="/image/add-keys">
          <AddKeys {...({crusterDir, addToLog})} />
        </Route>
        <Route path="/image/chroot">
          <Chroot {...({crusterDir, addToLog, sudoPassword, setSudoPassword})} />
        </Route>
        <Route path="/image/unmount">
          <Unmount {...({sudoPassword, setSudoPassword, crusterDir})} />
        </Route>
      </Switch>
      <br />
      <pre>{log}</pre>
    </div>

  )
}

export default Image