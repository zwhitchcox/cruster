import React from 'react'
import "./Log.css"

const Log = ({log}) => {
  return (
    <div className="log">
      <pre>{log}</pre>
    </div>
  )
}

export default Log