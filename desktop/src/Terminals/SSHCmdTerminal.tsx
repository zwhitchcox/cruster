import React, { useRef, useEffect, useState } from 'react'
import "xterm/css/xterm.css"
import { Terminal } from 'xterm'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { AttachAddon } from 'xterm-addon-attach'
import { dialog } from 'electron'
import {v4 as uuid} from 'uuid'

declare var ipcRenderer;

const SSHCmdTerminal = ({cmd, host}) => {
  const [isRunning, setIsRunning] = useState(false)
  const [term, setTerm] = useState<any>()
  const ref:any = useRef(null)

  const run = () => {
    setIsRunning(true)
    const id = uuid()
    const key = ipcRenderer.sendSync("get-key")

    ipcRenderer.send("run-cmd", {
      id,
      cmd,
      host,
      key,
    })
    const onData = (event, msg) => {
      const {data} = msg
      if (msg.id === id) {
        term.write(data)
      }
    }
    const onClose = (event, msg) => {
      setIsRunning(false)
      if (id === msg.id) {
        ipcRenderer.off('ssh-data', onData)
        ipcRenderer.off('ssh-error', onData)
        ipcRenderer.off('ssh-exit-code', onClose)
      }
    }
    ipcRenderer.on('ssh-data', onData)
    ipcRenderer.on('ssh-error', onData)
    ipcRenderer.on('ssh-exit-code', onClose)
  }

  useEffect(() => {
    if (ref && ref.current !== null) {
      const term = new Terminal({ cols: 80, rows: 24})
      term.open(ref.current)
      setTerm(term)

      // const ws = new WebSocket("ws://localhost:8080")
      // const attachAddon = new AttachAddon(ws)
      // term.loadAddon(attachAddon)
      // ws.onerror = console.error
    }
  }, [ref])
  return (
    <>
    <button onClick={run}>Run</button>
    <div id="terminal" ref={ref}>
    </div>
    </>
  )
}

export default SSHCmdTerminal
