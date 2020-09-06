import React from 'react';
import './bg.scss';
import './cool-btns.scss'
import './App.scss';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"
import Install from './Install/Install';
import Learn from './Learn/Learn';
import Home from './Home/Home';

function App() {
  return (
    <Router>
    <div className="App">
    <div className="container">
      <h1>Cruster</h1>
        <nav>
          <ul className="nav-list">
            <li>
              <Link to="/install">
                <div className="btn btn-one">
                  Install
                </div>
              </Link>
            </li>
            <li>
              <Link to="/learn">
                <div className="btn btn-one">
                  Learn
                </div>
              </Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/install">
            <Install />
          </Route>
          <Route path="/learn">
            <Learn />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>



      <Bubbles />
    </div>
    </div>
    </Router>
  );
}

export default App

const Bubbles = () => (
  <ul className="bg-bubbles">
    {[...new Array(20)].map((_, i) => <li key={i} />)}
  </ul>
)