import React, { useEffect, useState, useRef } from 'react'
import "./Node.css"

const OUTPUT_INIT = "No output to show!"
const Node = ({url, status, refresh, hostname}) => {
  const [output, setOutput] = useState(OUTPUT_INIT)
  const [newHostname, setNewHostname] = useState("")
  const [showOutput, setShowOutput] = useState(false)
  const [settingHostname, setSettingHostname] = useState(false)
  const outputEl:any = useRef(null)
  const scrollToBottom = () => {
    if (outputEl.current != null) {
      outputEl.current.scrollTop = outputEl.current.scrollHeight
    }
  }

  const readOutput = endpoint => {
    let curOutput = output
    if (curOutput === OUTPUT_INIT) {
      curOutput = ""
    }
    fetch(`${url}${endpoint}`)
      .then((response: any) => response.body.getReader())
      .then(reader => {
          reader.read().then(function processText({ done, value }) {
          if (done) {
            return
          }
          curOutput += (new TextDecoder("utf-8").decode(value)) + '\r\n'
          setOutput(curOutput)
          scrollToBottom()
          setShowOutput(true)
          return reader.read().then(processText)
        })
      })
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="node-main">
      <h3>{hostname}</h3>
      Endpoint: {url}<br />
      Status: {status}<br />
      <div className="node-actions">
        {/* <button onClick={() => readOutput("/reset")}>Reset</button> */}
        <button onClick={() => setSettingHostname(!settingHostname)}>Set Hostname</button>
        {/* <button onClick={() => setShowOutput(!showOutput)}>{showOutput ? "Hide" : "Show"} Output</button> */}
      </div>
      {
        !settingHostname ? "" : (
          <div className="form-group indent-1">
            <span className="label-text">New Hostname:</span>
            <input
              value={newHostname}
              onChange={e => setNewHostname(e.target.value)}
              type="text"
            />
            <button
              onClick={() => {
                readOutput(`/set-hostname/${newHostname}`)
                setTimeout(() => {
                  refresh()
                }, 1000)
              }}
            >Submit</button>
          </div>
        )
      }
      {
        (output === OUTPUT_INIT || !showOutput) ? "" : (
          <>
          <div className="output-label">Output:</div>
          <pre className="output" ref={outputEl}>
            {output}
          </pre>
          <span className="indent-1 action" onClick={copyOutput}>Copy Output</span><br />
          </>
        )
      }
    </div>
  )
}

export default Node