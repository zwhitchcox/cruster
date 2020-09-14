import React from 'react'
import { Link } from 'react-router-dom'
import "./Home.scss"

const Home = () => {
  return (
    <div className="intro">
      <h3>
        Easily Create and Manage Kubernetes Clusters on Raspberry Pis
      </h3>
      <Link to="/learn/demo">
        <div className="btn btn-three demo-button">
          View Demo
        </div>
      </Link>
      <ul className="key-features">
        <li>Built-in ssh pty</li>
        <li>Dynamically create/destroy clusters</li>
        <li>Automatically discover pis on network</li>
        <li>Add/Reset keys from Github Account</li>
        <li><span className="key">Without connecting your Raspberry Pi to a keyboard/monitor!!</span></li>
      </ul>
    </div>
  )
}
export default Home