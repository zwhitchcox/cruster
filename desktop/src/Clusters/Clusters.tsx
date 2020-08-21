import React, { useState, useEffect } from 'react'
import "./Clusters.css"
import CreateCluster from './CreateCluster'
import { ipFromUrl } from '../util'
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import ManageClusters from './ManageClusters';

const Clusters = ({nodes}) => {
  // const nonresponsive = Object.entries(nodes)
  //   .reduce((prev, [url, node]:any) => {
  //     if (!node.apiResponded) {
  //       prev.push(ipFromUrl(url))
  //     }
  //     return prev
  //   }, [] as string[])
  return (
    <div>
      <div className="third-nav">
        <Link to="/clusters/create">
          <button className="button-two">Create</button>
        </Link>
        <Link to="/clusters/manage">
          <button className="button-two">Manage</button>
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