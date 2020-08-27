import React, { useState, useEffect, useContext } from 'react'
import "./Clusters.css"
import CreateCluster from './CreateCluster'
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import ManageClusters from './ManageClusters';
import SystemInfoContext from '../Contexts/SystemInfoContext';

const Clusters = () => {
  const {nodes} = useContext(SystemInfoContext)
  return (
    <div>
      <div className="third-nav">
        <Link to="/clusters/create">
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
          <CreateCluster nodes={nodes}/>
        </Route>
        <Route path="/clusters/manage">
          <ManageClusters nodes={nodes} />
        </Route>
      </Switch>
    </div>
  )
}

export default Clusters