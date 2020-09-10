import React, { useState, useEffect } from 'react';
import './bg.scss';
import './cool-btns.scss'
import './App.scss';
import {
  Switch,
  Route,
  Link,
  useLocation
} from "react-router-dom"
import Install from './Install/Install';
import Learn from './Learn/Learn';
import Home from './Home/Home';


function App() {
  const location = useLocation()
  const windowSize = useWindowSize()
  const displayMainNav = location.pathname === "/" || windowSize.width > 600 ? "block" : "none"
  return (
    <div className="container">
      <Link to="/"><h1>Cruster</h1></Link>
      <nav style={{display: displayMainNav}}>
        <ul className="nav-list">
          <li>
            <Link to="/Download">
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
        <Switch>
          <Route path="/download">
            <Install />
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

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<any>({
    width: undefined,
    height: undefined,
  });


  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}