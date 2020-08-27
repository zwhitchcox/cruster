import React, { useRef, useEffect, useState } from 'react'
import "xterm/css/xterm.css"
import { Terminal } from 'xterm'
import {v4 as uuid} from 'uuid'

declare var ipcRenderer;

const SSHTerminal = ({host}) => {
  const ref:any = useRef(null)

  useEffect(() => {
    if (ref && ref.current !== null) {
      const term = new Terminal({ cols: 80, rows: 24})
      term.open(ref.current)
      const id = uuid()
      const key = ipcRenderer.sendSync("get-key")
      term.onData(data => {
        ipcRenderer.send("ssh-write", {
          id,
          data,
        })
      })
      ipcRenderer.send("create-interactive", {
        host,
        key,
        id,
      })


      const onData = (event, msg) => {
        const {data} = msg
        if (msg.id === id) {
          term.write(data)
        }
      }

      const onClose = (event, msg) => {
        if (id === msg.id) {
          ipcRenderer.off('ssh-data', onData)
          ipcRenderer.off('ssh-error', onData)
          ipcRenderer.off('ssh-exit-code', onClose)
        }
      }

      ipcRenderer.on('ssh-data', onData)
      ipcRenderer.on('ssh-error', onData)
      ipcRenderer.on('ssh-exit-code', onClose)
      // const ws = new WebSocket("ws://localhost:8080")
      // const attachAddon = new AttachAddon(ws)
      // term.loadAddon(attachAddon)
      // ws.onerror = console.error
    }
  }, [ref])
  return (
    <>
    <div id="terminal" ref={ref}>
    </div>
    </>
  )
}

export default SSHTerminal

