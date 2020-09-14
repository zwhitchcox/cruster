import React from 'react'
import { Route, Switch } from 'react-router'
import { Link } from 'react-router-dom';
import Demo from './Demo';
import "./Learn.scss"
import GettingStarted from './GettingStarted';
import { Helmet } from 'react-helmet';

const Learn = () => {
  return (
    <div>
      <Helmet>
        <title>Cruster - Learn</title>
      </Helmet>
      <nav>
        <ul className="nav-list nav-learn">
          <li>
            <Link to="/learn/demo">
              <div className="btn btn-three">
                Demo
              </div>
            </Link>
          </li>
          <li>
            <Link to="/learn/getting-started">
              <div className="btn btn-three">
                Getting Started
              </div>
            </Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/learn/demo">
          <Demo />
        </Route>
        <Route path="/learn/getting-started">
          <GettingStarted />
        </Route>
      </Switch>
    </div>
  )
}
export default Learn