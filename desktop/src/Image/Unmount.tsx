import React, { useState } from "react"
import LocalTerminal from "../Terminals/LocalTerminal"

const platform = ipcRenderer.sendSync("get-platform")
const Unmount = ({crusterDir, sudoPassword}) => {
  if (platform !== "linux") return <div>Mounting only supported on Ubuntu for now.</div>
  if (!ipcRenderer.sendSync("image-mounted")) return <div className="boxed"><h3>Unmount</h3><div>Image is not mounted.</div></div>
  return (
    <div className="boxed">
      <h3>Unmount</h3>
      <LocalTerminal
        clear={false}
        sudo={true}
        sudoPassword={sudoPassword}
        scripts={["unmount"]}
        unmount={false}
        crusterDir={crusterDir} />
    </div>
  )
}

export default Unmount