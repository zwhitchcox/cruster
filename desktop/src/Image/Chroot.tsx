import React, { useContext } from "react"
import LocalTerminal from "../Terminals/LocalTerminal"
import "./Chroot.css"
import SettingsContext from '../SettingsContext';

// TODO: unmount after exit (send to terminal)

const platform = ipcRenderer.sendSync("get-platform")
const Chroot = () => {
  const imageExists = ipcRenderer.sendSync("image-exists")
  console.log({imageExists})
  if (platform !== "linux") return <div>This feature is only available on Ubuntu</div>
  if (!imageExists) return <div>You must download an image before you can chroot into it.</div>
  // refresh image-mounted cache
  setTimeout(() => ipcRenderer.send("image-mounted"), 2000)
  return (
    <div className="boxed">
      <h3 className="top-margin">Chroot</h3>
    <LocalTerminal
        su={true}
        scripts={["mount", "chroot"]}
        clear={true}
        unmount={true} /> {/* This doesn't work currently */}
    </div>
  )
}

export default Chroot