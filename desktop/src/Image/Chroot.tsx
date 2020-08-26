import React, { useContext, useEffect, useState } from "react"
import LocalTerminal from "../Terminals/LocalTerminal"
import "./Chroot.css"
import SettingsContext from '../Contexts/SettingsContext';

// TODO: unmount after exit (send to terminal)

const platform = ipcRenderer.sendSync("get-platform")
const Chroot = () => {
  // const [ready, setReady] = useState(false)
  // setTimeout(() => ipcRenderer.send("image-mounted"), 2000)
  // useEffect(() => {
  //   setTimeout(()=>setReady(true), 1000)
  // }, [ready])
  // if (!ready) {
  //   return <div style={{textAlign: "center"}}>Just a second...</div>
  // }
  const imageExists = ipcRenderer.sendSync("image-exists")
  if (platform !== "linux") return <div>This feature is only available on Ubuntu</div>
  if (!imageExists) return <div>You must download an image before you can chroot into it.</div>
  // refresh image-mounted cache
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