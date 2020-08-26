import React, { useContext, useState } from 'react'
import SettingsContext from '../../Contexts/SettingsContext';
import ActionsContext from '../../Contexts/ActionsContext';

const Wifi = () => {
  const settings = useContext(SettingsContext)
  const { runAction } = useContext(ActionsContext)

  // wifi password
  const [wifiPassword, setWifiPassword] = useState(settings.defaultPSK)
  const [ssid, setSSID] = useState(settings.defaultSSID)
  const addWifi = () => runAction({
    status: `Adding Wifi Credentials for ${ssid}...`,
    type: "add-wifi-credentials",
    args: {
      ssid,
      wifiPassword
    },
  })

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
          Wifi Password:&nbsp;&nbsp;
        </div>
        <div>
          <input
            placeholder="Wifi Password"
            className="text-field-github"
            type="password"
            onChange={e => setWifiPassword(e.target.value)}
            value={wifiPassword}
          />
        </div>
      </div>
      <div>
      <button onClick={addWifi}>Add Wifi Credentials</button>
      </div>
    </div>
  )
}

export default Wifi