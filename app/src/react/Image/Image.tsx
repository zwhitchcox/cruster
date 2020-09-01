import React, { useState, useEffect } from 'react'
import "./Image.css"
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Download from './Download';
import Setup from './Setup/Setup';
import Chroot from './Chroot';
import Flash from './Flash';
import { IS_DEV } from '../constants';


const Image = () => {
  return (
    <div>
      <br />
      <div className="third-nav">
        <Link to="/image/download">
          <div className="btn btn-three">
          Download
          </div>
        </Link>
        <Link to="/image/add-keys">
          <div className="btn btn-three">
          Set Up
          </div>
        </Link>
        {!IS_DEV ? "" : <>
          <Link to="/image/chroot">
            <div className="btn btn-three">
            Chroot
            </div>
          </Link>
          <Link to="/image/flash">
            <div className="btn btn-three">
            Flash
            </div>
          </Link>
        </>}
      </div>
      <br />
      <Switch>
        <Route path="/image/download">
          <Download />
        </Route>
        <Route path="/image/add-keys">
          <Setup />
        </Route>
        <Route path="/image/chroot">
          <Chroot />
        </Route>
        <Route path="/image/flash">
          <Flash />
        </Route>
      </Switch>
      <br />
    </div>
  )
}

export default Image