import React from 'react';
import './bg.scss';
import './cool-btns.scss'
import './App.scss';
import {
  Switch,
  Route,
  Link,
  useLocation
} from "react-router-dom"
import Download from './Download/Download';
import Learn from './Learn/Learn';
import Home from './Home/Home';


function App() {
  const location = useLocation()
  const displayMainNav = location.pathname === "/" || window.innerWidth > 600 ? "block" : "none"
  return (
    <div className="container">
      <Link to="/"><h1>Cruster</h1></Link>
      <nav style={{display: displayMainNav}}>
        <ul className="nav-list">
          <li>
            <Link to="/download">
              <div className="btn btn-one">
                Download
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
        <Switch>
          <Route path="/download">
            <Download />
          </Route>
          <Route path="/learn">
            <Learn />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
    </div>
  );
}

export default App
