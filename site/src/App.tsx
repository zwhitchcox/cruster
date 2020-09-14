import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet'
import ReactGA from 'react-ga'
import './cool-btns.scss'
import './App.scss';
import {
  Switch,
  Route,
  Link,
  useLocation,
  useHistory,
} from "react-router-dom"
import Install from './Install/Install';
import Learn from './Learn/Learn';
import Home from './Home/Home';

declare var ga: any;

function App() {
  const location = useLocation()
  const history = useHistory()
  const windowSize = useWindowSize()
  const displayMainNav = location.pathname === "/" || windowSize.width > 600 ? "block" : "none"
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      ReactGA.initialize('G-VP5JKR4EEG')
      history.listen(location => {
          ReactGA.pageview(location.pathname + location.search)
      })
    }
  }, [])
  return (
    <div className="container">
      <Helmet>
      <title>Cruster</title>
      </Helmet>
      <a className="github" href="https://github.com/zwhitchcox/cruster">
        <img className="gh-icon" src="/github.png" />
      </a>
      <Link to="/"><h1>Cruster</h1></Link>
      <nav style={{display: displayMainNav}}>
        <ul className="nav-list">
          <li>
            <Link to="/install">
              <div className="btn btn-one">
                Install
              </div>
            </Link>
          </li>
          <li>
            <Link to="/learn/demo">
              <div className="btn btn-one">
                Learn
              </div>
            </Link>
          </li>
        </ul>
      </nav>
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