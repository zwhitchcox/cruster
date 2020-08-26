import React from 'react'
const ActionsContext = React.createContext({
  runAction: (() => {}) as any,
  addToLog: (() => {}) as any,
})

export default ActionsContext