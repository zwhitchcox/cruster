import React, { useState } from "react"
import LocalTerminal from "../Terminals/LocalTerminal"

const platform = ipcRenderer.sendSync("get-platform")
const Unmount = ({sudoPassword, setSudoPassword, crusterDir}) => {
  const [isUnmounting, setIsUnmounting] = useState(false)
  if (platform !== "linux") return <div>Mounting only supported on Ubuntu for now.</div>
  if (!ipcRenderer.sendSync("image-mounted")) return <div><h4>Unmount</h4><div>Image is not mounted.</div></div>
  return (
    <div>
      <h3>Unmount</h3>
      <div>
      Your Sudo Password Required: <input
          placeholder="Your Sudo Password"
          className="text-field"
          type="password"
          onChange={e => setSudoPassword(e.target.value)}
          value={sudoPassword}
        />
      </div>
      <div>
      <button className="button-two" onClick={()=>setIsUnmounting(true)}>Unmount</button>
      </div>
      {!isUnmounting ? "" : <LocalTerminal
        clear={false}
        sudo={true}
        sudoPassword={sudoPassword}
        scripts={["unmount"]}
        crusterDir={crusterDir} />
      }
    </div>
  )
}

export default Unmount