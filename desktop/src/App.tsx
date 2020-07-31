import React, { useState, useEffect } from 'react';
import Node from './Node'
import './App.css';
import CreateCluster from './CreateCluster';

declare var ipcRenderer;

// necessary because of asynchronous code
// capturing stale data in closures
let _nodes = {}

function App() {
  let [nodes, _setNodes] = useState({})
  const setNodes = nodes => _setNodes(_nodes = nodes)
  const setNode = (url, node)=> setNodes({..._nodes, [url]: {...node, url}})

  const [creatingCluster, setCreatingCluster] = useState(true)

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

  return (
    <div className="App">
      <nav>
        <h1>CRUSTER</h1>
        <div className="justified-container">
          <div className="btn btn-one" onClick={search}>
            <span>Refresh Nodes</span>
          </div>
          <div className="btn btn-one" onClick={() => setCreatingCluster(!creatingCluster)}>
            <span>Create Cluster</span>
          </div>
        </div>
        <br />
        <br />
        {/* <pre>{JSON.stringify(nodes, null, 2)}</pre> */}
      </nav>
      <main>
        {!creatingCluster ? "" : <CreateCluster nodes={nodes} />}
        {Object.values(nodes).length === 0 ? "Couldn't find any nodes..." : ""}
        {Object.values(nodes).map((n:any) => (
          <Node
            key={n.url}
            {...n}
            refresh={search}
          />
        ))}
      </main>
    </div>
  )
}

export default App;