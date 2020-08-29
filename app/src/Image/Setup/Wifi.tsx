import React, { useContext, useState } from 'react'
import SettingsContext from '../../Contexts/SettingsContext';
import ActionsContext from '../../Contexts/ActionsContext';

const Wifi = () => {
  const [status, setStatus] = useState("")
  const settings = useContext(SettingsContext)
  const { runAction } = useContext(ActionsContext)

  // wifi password
  const [wifiPassword, setWifiPassword] = useState(settings.defaultPSK || "")
  const [ssid, setSSID] = useState(settings.defaultSSID || "")
  const addWifi = async () => {
    try {
      if (wifiPassword.length < 8) {
        return setStatus("Wifi password must be at least 8 characters")
      }
      if (ssid === "") {
        return setStatus("SSID is required")
      }
      setStatus("adding wifi credentials")
      await runAction({
        status: `Adding Wifi Credentials for ${ssid}...`,
        type: "add-wifi-credentials",
        args: {
          ssid,
          wifiPassword
        },
      })
      setStatus("Success!")
    } catch (err) {
      setStatus("Error: See log for more details (top right)")
    }
  }

  return (
    <div>
      <h3 className="top-margin-2">Add Wifi Credentials</h3>
      <div className="text-input-container">
        <div className="label">
          SSID ( Wifi Name):&nbsp;&nbsp;
        </div>
        <div>
          <input
            placeholder="SSID"
            className="text-field-github"
            type="text"
            onChange={e => setSSID(e.target.value)}
            value={ssid}
          />
        </div>
      </div>
      <div className="text-input-container">
        <div className="label">
          PSK (Wifi Password):&nbsp;&nbsp;
        </div>
        <div>
          <input
            placeholder="PSK"
            className="text-field-github"
            type="password"
            onChange={e => setWifiPassword(e.target.value)}
            value={wifiPassword}
          />
        </div>
      </div>
      <div>
      <button onClick={addWifi}>Add Wifi Credentials</button>
      <br />
      {status}
      </div>
    </div>
  )
}

export default Wifi