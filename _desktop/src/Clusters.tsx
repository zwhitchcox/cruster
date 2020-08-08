import React, { useState, useEffect } from 'react'
import "./Clusters.css"
import CreateCluster from './CreateCluster'

declare var ipcRenderer;
let _nodes = {}
const Clusters = () => {
  let [nodes, _setNodes] = useState({})
  const setNodes = nodes => _setNodes(_nodes = nodes)
  const setNode = (url, node)=> setNodes({..._nodes, [url]: {...node, url}})

  const [retrievalErrorNodes, setRetrievalErrorNodes] = useState({})
  useEffect(() => {
    ipcRenderer.on('node-response', (event, headers)=> {
      if (headers["ST"] && headers["ST"] == "cruster:node") {
        const url = headers["LOCATION"]
        setNode(url, {
          url,
          hostname: "Retrieving hostname...",
          status: "Retrieving status..."
        })
        getNodeInfo(url)
      }
    })
    ipcRenderer.send('search-nodes')
  }, [])

  const getNodeInfo = url => {
    fetch(`${url}/node-info`)
      .then(r => {
        if (r.status > 399) {
          return Promise.reject(`Something went wrong getting the status for ${url}`)
        }
        return r.json()
      })
      .then(nodeInfo => setNode(url, nodeInfo))
      .catch(() => {
        setRetrievalErrorNodes({
          ...retrievalErrorNodes,
          [url]: true
        })
      })
  }

  const search = () => {
    setNodes(_nodes = {})
    ipcRenderer.send('search-nodes')
  }
  const [creatingCluster, setCreatingCluster] = useState(false)
  return (
    <div className="boxed">
      <h3>Clusters</h3>
      <button onClick={search}>Refresh</button>
      <button onClick={() => setCreatingCluster(!creatingCluster)}>
      Create Cluster
      </button>
      {creatingCluster ? <CreateCluster nodes={nodes}/> : ""}
    </div>
  )
}

export default Clusters