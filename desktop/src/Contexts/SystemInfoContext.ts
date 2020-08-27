import React from 'react'

const SystemInfoContext = React.createContext({
  imageExists: false,
  imageMounted: false,
  nodes: [],
  drives: []
})

export default SystemInfoContext