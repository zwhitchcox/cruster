import React, { useState, useEffect } from 'react'
import "./Clusters.css"
import CreateCluster from './CreateCluster'

const Clusters = ({nodes}) => {
  const [creatingCluster, setCreatingCluster] = useState(false)
  return (
    <div className="boxed">
      <h3>Clusters</h3>
      <pre>{JSON.stringify(nodes, null, 2)}</pre>
      <button onClick={() => setCreatingCluster(!creatingCluster)}>
      Create Cluster
      </button>
      {creatingCluster ? <CreateCluster nodes={nodes}/> : ""}
    </div>
  )
}

export default Clusters