import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import Clusters from './Clusters/Clusters';
import Image from './Image/Image'

function App() {
  return (
    <Router>
    <div className="App">
      <nav>
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
          <Clusters />
        </Route>
        <Route path="/image">
          <Image />
        </Route>
      </Switch>
      </main>
    </div>
    </Router>
  )
}

export default App;