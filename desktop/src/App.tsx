import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import Clusters from './Clusters';
import Terminal from './Terminal';


declare var ipcRenderer;

const useNodes = () => {
  const [nodes, setNodes] = useState({})
  useEffect(() => {
    ipcRenderer.on('nodes', (event, nodes) => {
      setNodes(nodes)
    })
    ipcRenderer.send('send-nodes', null)
  }, [])
  return nodes
}


function App() {
  const nodes = useNodes()
  return (
    <Router>
    <div className="App">
      <nav>
        <Terminal />
        <h1>CRUSTER</h1>
        <div className="justified-container">
          <Link to="/image">
            <div className="btn btn-one">
              <span>Image</span>
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