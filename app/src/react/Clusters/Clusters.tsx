import React, { useContext } from 'react'
import "./Clusters.css"
import Create from './Create/Create'
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import ManageClusters from './Manage/ManageClusters';
import NodeSSH from './Manage/NodeSSH';
import ResetAll from './Manage/ResetAll';
import RunCmdAll from './Manage/RunCmdAll';

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
        <Route path="/clusters/node-ssh/:ip/:cmd">
          <NodeSSH />
        </Route>
        <Route path="/clusters/node-ssh/:ip">
          <NodeSSH />
        </Route>
        <Route path="/clusters/reset-all">
          <ResetAll />
        </Route>
        <Route path="/clusters/run-cmd-all">
          <RunCmdAll />
        </Route>
      </Switch>
    </div>
  )
}

export default Clusters