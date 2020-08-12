import React, { useState, useEffect } from 'react'
import "./Clusters.css"
import CreateCluster from './CreateCluster'
import { ipFromUrl } from './util'

const Clusters = ({nodes}) => {
  const [creatingCluster, setCreatingCluster] = useState(true)
  const nonresponsive = Object.entries(nodes)
    .reduce((prev, [url, node]:any) => {
      if (!node.apiResponded) {
        prev.push(ipFromUrl(url))
      }
      return prev
    }, [] as string[])
  return (
    <div className="boxed">
      <h3>Clusters</h3>
      {/* <pre>{JSON.stringify(nodes, null, 2)}</pre> */}
      <button onClick={() => setCreatingCluster(!creatingCluster)}>
      Create Cluster
      </button>
      {creatingCluster ? <CreateCluster nodes={nodes}/> : ""}
      {nonresponsive.length === 0 ? "" : <div>
        The following ip addresses have a cluster, but the api didn't respond for some reason:

        <ul>
          {nonresponsive.map(ip => <li key={ip}>{ip}</li>)}
        </ul>
      </div>}
    </div>
  )
}

export default Clusters