import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

declare var ipcRenderer;

function App() {
  const [nodes, setNodes] = useState([])
  useEffect(() => {
    ipcRenderer.on('node-response', (event, headers)=> {
      // console.log(headers["ST"])
      if (/cluster/.test(headers["ST"])) {
        console.log(headers)
      }
      if (headers["ST"] && headers["ST"] == "picluster:node") {
        setNodes(headers["LOCATION"])
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
      </header>
    </div>
  );
}

export default App;
