import React from 'react'
import { AsyncResource } from 'async_hooks'
const ActionsContext = React.createContext({
  runAction: (() => {}) as any,
  sshTerm: (() => {}) as any,
  addToLog: (() => {}) as any,
})

export default ActionsContext