import React, { useState, useEffect } from 'react';
import Node from './Node'
import logo from './logo.svg';
import './App.css';

declare var ipcRenderer;

const normalizeNodes = arr => {
  const hash = {}
  const result = [] as any
  for (const node of arr) {
    const url = node["LOCATION"]
    if (!hash[url]) {
      hash[url] = true
      result.push({
        url,
      })
    }
  }
  return result
}
function App() {
  const [nodes, setNodes] = useState([] as any)
  useEffect(() => {
    ipcRenderer.on('node-response', (event, headers)=> {
      if (headers["ST"] && headers["ST"] == "picluster:node") {
        setNodes(normalizeNodes([
          ...nodes,
          headers,
        ]))
      }
    })
  }, [])
  const search = () => {
    setNodes([])
    ipcRenderer.send('search-nodes')
  }
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={search}>Search</button>
        <br />
        {nodes.map(n => <Node key={n.url} {...n} />)}
      </header>
    </div>
  );
}

export default App;
