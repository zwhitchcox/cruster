import React, { useRef, useEffect, useState } from 'react'

const SSHTerminal = ({term}) => {
  // const [isRunning, setIsRunning] = useState(false)
  const ref:any = useRef(null)

  // const run = () => {
  //   setIsRunning(true)
  //   const onData = (event, msg) => {
  //     const {data} = msg
  //     if (msg.id === id) {
  //       term.write(data)
  //     }
  //   }
  //   const onClose = (event, msg) => {
  //     setIsRunning(false)
  //     if (id === msg.id) {
  //       ipcRenderer.off('ssh-data', onData)
  //       ipcRenderer.off('ssh-error', onData)
  //       ipcRenderer.off('ssh-exit-code', onClose)
  //     }
  //   }
  //   ipcRenderer.on('ssh-data', onData)
  //   ipcRenderer.on('ssh-error', onData)
  //   ipcRenderer.on('ssh-exit-code', onClose)
  // }

  useEffect(() => {
    if (ref && ref.current !== null && term) {
      term.open(ref.current)

      // const ws = new WebSocket("ws://localhost:8080")
      // const attachAddon = new AttachAddon(ws)
      // term.loadAddon(attachAddon)
      // ws.onerror = console.error
    }
  }, [ref, term])
  return (
    <div id="terminal" ref={ref} />
  )
}

export default SSHTerminal
