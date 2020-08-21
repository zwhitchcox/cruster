import React, { useState } from "react"
import LocalTerminal from "../Terminals/LocalTerminal"
import "./Chroot.css"

const platform = ipcRenderer.sendSync("get-platform")
const Chroot = ({crusterDir, sudoPassword, setSudoPassword}) => {
  const [inChroot, setInChroot] = useState(false)
  const imageExists = ipcRenderer.sendSync("image-exists")
  if (platform !== "linux") return <div>This feature is only available on Ubuntu</div>
  if (!imageExists) return <div>You must download an image before you can chroot into it.</div>
  return (
    <div className="boxed">
      <h3>Chroot</h3>
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
      <button className="button-two" onClick={() => setInChroot(true)}>Launch</button>
      <button className="button-two" onClick={() => ipcRenderer.send("kill-cur-term")}>Kill</button>
    {!inChroot ? "" : <LocalTerminal
        sudo={true}
        sudoPassword={sudoPassword}
        scripts={["mount", "chroot"]}
        clear={true}
        crusterDir={crusterDir} />}
    </div>
  )
}

export default Chroot