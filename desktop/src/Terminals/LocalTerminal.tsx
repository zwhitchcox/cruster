import React, { useRef, useEffect, useState } from 'react'
import "xterm/css/xterm.css"
import { Terminal } from 'xterm'
import "./LocalTerminal.css"
import { WebLinksAddon } from 'xterm-addon-web-links'
import { dialog } from 'electron'
import {v4} from 'uuid'

declare var ipcRenderer;

const LocalTerminal = ({sudo, sudoPassword, scripts, crusterDir, clear}) => {
  const ref:any = useRef({})
  useEffect(() => {
    if (!ref.current) return () => {}
    const id = v4()
    ipcRenderer.send("local-terminal", {
      id,
    })

    const onReady = (event, msg) => {
      if (msg.id === id) {
        if (sudo) {
          ipcRenderer.send("local-terminal-data", {
            id,
            data: "sudo su\n",
          })
          ipcRenderer.send("local-terminal-data", {
            id,
            data: sudoPassword.trim() + "\n",
          })
        }

        setTimeout(() => {
          ipcRenderer.send("local-terminal-run-scripts", {
            id,
            env: {
              CRUSTER_DIR: crusterDir,
              IMG_NAME: "node"
            },
            scripts: scripts,
          })
          const onCompleted = (event, msg) => {
            if (msg.id === id) {
              ipcRenderer.off('local-terminal-complete', onCompleted)
              if (clear) {
                ipcRenderer.send("local-terminal-data", {
                  id,
                  data: "clear\n",
                })
              }
            }
          }
          ipcRenderer.on('local-terminal-complete', onCompleted)
        },500)
      }
      ipcRenderer.off("local-terminal-ready", onReady)
    }

    ipcRenderer.on("local-terminal-ready", onReady)



    const onData = (event, msg) => {
      const {data} = msg
      if (msg.id === id) {
        term.write(data)
      }
    }

    const onClose = (event, msg) => {
      if (id === msg.id) {
        ipcRenderer.off('local-terminal-data', onData)
        ipcRenderer.off('local-terminal-error', onData)
        ipcRenderer.off('local-terminal-exit-code', onClose)
        ipcRenderer.off('local-terminal-done', onDone)
        ipcRenderer.send("local-terminal-data", {
          id,
          data: "exit\n",
        })
      }
    }

    const onDone = (event, msg) => {
      console.log("done")
    }

    ipcRenderer.on('local-terminal-done', onDone)
    ipcRenderer.on('local-terminal-data', onData)
    ipcRenderer.on('local-terminal-error', onData)
    ipcRenderer.on('local-terminal-exit-code', onClose)
    const term = new Terminal({ cols: 80, rows: 24})
    // term.fit()
    // term.setOption('padding', {
    //   top: 5,
    //   left: 5,
    //   right: 5,
    //   bottom: 5
    // })
    term.open(ref.current)
    term.onData(data => {
      ipcRenderer.send("local-terminal-data", {
        id,
        data,
      })
    })
  }, [ref])


  return (
    <div id="terminal" ref={ref} />
  )
}

export default LocalTerminal