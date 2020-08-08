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



function App() {

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
          <Flash />
        </Route>
        <Route path="/clusters">
          <Clusters />
        </Route>
      </Switch>
      </main>
    </div>
    </Router>
  )
}

export default App;