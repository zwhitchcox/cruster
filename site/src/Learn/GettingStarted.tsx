import React from 'react'
import { Link } from 'react-router-dom';
import "./GettingStarted.scss"

const GettingStarted = () => {
  return (
    <div>
      <h3 className="learn-header">Getting Started</h3>
      <ol className="getting-started-steps">
        <li><Link to="/install">Install Cruster</Link></li>
        <li>Download base image from Download page</li>
        <li>Add your Github username on Setup page</li>
        <li>Load your Github public keys onto disk image</li>
        <li>Flash disk image to Micro SD cards and insert into Raspberry Pis</li>
        <li>Navigate to "Cluster" -&gt; "Create" page and add Pis you want to your cluster</li>
        <li>Click "Launch" and wait for nodes to initialize</li>
        <li>Click "download kube config" on the manage page</li>
        <li>Run your web server!</li>
      </ol>
    </div>
  )
}

export default GettingStarted