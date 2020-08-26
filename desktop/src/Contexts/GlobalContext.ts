import React from 'react'

const GlobalContext = React.createContext({
  imageExists: false,
  nodes: [],
})

export default GlobalContext