import React, { useContext, useEffect, useState } from "react"
import LocalTerminal from "../Terminals/LocalTerminal"
import "./Chroot.css"
import SystemInfoContext from '../Contexts/SystemInfoContext';

// TODO: unmount after exit (send to terminal)

const platform = ipcRenderer.sendSync("get-platform")
const Chroot = () => {
  const systemInfo = useContext(SystemInfoContext)
  console.log({systemInfo})
  const {imageExists} = systemInfo
  if (platform !== "linux") return <div>This feature is only available on Ubuntu</div>
  if (!imageExists) return <div>You must download an image before you can chroot into it.</div>
  return (
    <div className="boxed">
      <h3 className="top-margin">Chroot</h3>
    <LocalTerminal
        su={true}
        scripts={["mount", "chroot"]}
        clear={true}
        unmount={true} />
    </div>
  )
}

export default Chroot