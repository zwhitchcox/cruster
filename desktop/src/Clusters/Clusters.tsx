import React from 'react'
import "./Clusters.css"
import Create from './Create/Create'
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import ManageClusters from './ManageClusters';

const Clusters = () => {
  return (
    <div>
      <div className="third-nav">
        <Link to="/clusters/create/setup">
          <div className="btn btn-three">
          Create
          </div>
        </Link>
        <Link to="/clusters/manage">
          <div className="btn btn-three">
          Manage
          </div>
        </Link>
      </div>
      <Switch>
        <Route path="/clusters/create">
          <Create />
        </Route>
        <Route path="/clusters/manage">
          <ManageClusters />
        </Route>
      </Switch>
    </div>
  )
}

export default Clusters