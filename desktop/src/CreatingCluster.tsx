import React, { useEffect, useState, useRef } from 'react'
import { getHostname } from './util'
import "./CreatingCluster.css"

const OUTPUT_INIT = "No output to show!"
const testNode = "http://test-node.local:9090"
const CreatingCluster = ({cluster, clusterName}) => {
  const [output, setOutput] = useState(OUTPUT_INIT)
  const readOutput = (url, endpoint) => {
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
          return reader.read().then(processText)
        })
      })
  }
  const outputEl:any = useRef(null)
  const scrollToBottom = () => {
    if (outputEl.current != null) {
      outputEl.current.scrollTop = outputEl.current.scrollHeight
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
  }
  useEffect(() => {
    fetch(`${testNode}/init-master`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        hostname: getHostname({
          clusterName,
          cluster,
          url: cluster.master,
          index: null,
        })
      })
    })
    .then(console.log)
    .catch(console.error)
  }, [])

  return (
    <div className="boxed">
      <h3>Creating Cluster</h3>

    </div>
  )
}

const Output =  (name, promise) => {

}

export default CreatingCluster
