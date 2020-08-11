import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Node from './Node'
import './App.css';
import CreateCluster from './CreateCluster';
import Flash from './Flash';
import Clusters from './Clusters';


declare var ipcRenderer;


let _drives = {}
const useDrives = () => {
  const [drives, _setDrives] = useState({})
  const setDrives = (drives) => {
    _setDrives(_drives = drives)
  }
  useEffect(() => {
    ipcRenderer.send('restart-scanner')
    ipcRenderer.on('drive-attached', (event, drive) => {
      if (!drive.drive.isSystem) {
        setDrives({
          ..._drives,
          [drive.path]: drive
        })
      }
    })
    ipcRenderer.on('drive-detached', (event, drive) => {
      const newDrives = {..._drives}
      delete newDrives[drive.path]
      setDrives(newDrives)
    })
  }, [])
  return drives
}

function App() {
  const drives = useDrives()
  const [nodes, setNodes] = useState({})
  useEffect(() => {
    ipcRenderer.on('nodes', (event, nodes) => {
      setNodes(nodes)
    })
    ipcRenderer.send('send-nodes', null)
  }, [])

  return (
    <Router>
    <div className="App">
      <nav>
        <h1>CRUSTER</h1>
        <div className="justified-container">
          <Link to="/flash">
          <div className="btn btn-one">
            <span>Flash SD(s)</span>
          </div>
          </Link>
          <Link to="/clusters">
          <div className="btn btn-one">
            <span>Clusters</span>
          </div>
          </Link>
        </div>
        <br />
        <br />
        {/* <pre>{JSON.stringify(nodes, null, 2)}</pre> */}
      </nav>
      <main>
      <Switch>
        <Route path="/flash">
          <Flash drives={drives} />
        </Route>
        <Route path="/clusters">
          <Clusters nodes={nodes}/>
        </Route>
      </Switch>
      </main>
    </div>
    </Router>
  )
}

export default App;