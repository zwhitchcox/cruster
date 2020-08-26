import React from 'react'

const SettingsContext = React.createContext(ipcRenderer.sendSync("get-settings"))

export default SettingsContext
