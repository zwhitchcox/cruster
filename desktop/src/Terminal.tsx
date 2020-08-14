import React, { useRef, useEffect } from 'react'
import "xterm/css/xterm.css"
import { Terminal } from 'xterm'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { AttachAddon } from 'xterm-addon-attach'

const Term = () => {
  const ref:any = useRef(null)
  useEffect(() => {
    if (ref && ref.current !== null) {
      const term = new Terminal({ cols: 80, rows: 24})
      term.open(ref.current)
      const ws = new WebSocket("ws://localhost:8080")
      const attachAddon = new AttachAddon(ws)
      term.loadAddon(attachAddon)
      // ws.onmessage = (msg) => {
      //   term.write(msg.data)
      // }
      ws.onerror = console.error
    }
  }, [ref])
  return (
    <div id="terminal" ref={ref}>
    </div>
  )
}

export default Term