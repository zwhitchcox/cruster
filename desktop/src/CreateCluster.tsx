import React, { useEffect, useState, useRef } from 'react'
import { UNINITIALIZED } from './constants'
import "./CreateCluster.css"
import { ipFromUrl } from './util'

// TODO: search every 5 seconds, and wait 5 seconds for results
// and then use setState instead of manual refresh
// add nodes as you find them, then after 5 seconds, delete
// all the ones that didn't respond

const validateClusterName = name => /^[A-Za-z0-9]([A-Za-z0-9]|-){0,55}$/.test(name)


// necessary because of asynchronous code
// capturing stale data in closures
const CreateCluster = ({nodes}) => {
  const uninitialized = Object.entries(nodes)
    .reduce((prev, [url, node]: any) => {
      if (node.status === UNINITIALIZED) {
        prev.push(url)
      }
      return prev
    }, [] as any)
  const [name, setName] = useState("cruster")
  const [cluster, setCluster] = useState({
    master: "",
    slaves: [] as string[],
  })

  const addNode = url => {
    setCluster({
      ...cluster,
      slaves: [
        ...cluster.slaves,
        url,
      ]
    })
  }
  const setMaster = url => {
    if (cluster.master !== "") {
      if (url === cluster.master) return
      setCluster({
        master: url,
        slaves: [
          ...cluster.slaves.filter(n => n !== url),
          cluster.master,
        ]
      })
    } else {
      setCluster({
        slaves: [
          ...cluster.slaves.filter(n => n !== url),
        ],
        master: url,
      })
    }
  }



  const available = uninitialized.filter(url => {
    return !(cluster.slaves.some(s => s === url) || cluster.master === url)
  })

  return (
    <div className="boxed">
      <h3>Create Cluster</h3>
      Cluster Name: <input value={name} onChange={e => setName(e.target.value)} />
      {validateClusterName(name) ? "" : "Invalid Name."}
      <h4>Cluster Nodes</h4>
      <ul className="node-list">
        {cluster.master === ""  ? "" : <ClusterNode
          {...({
            url: cluster.master,
            setMaster,
            cluster,
            nodes,
            addNode,
          })}
        />}
        {cluster.slaves.map(url => (
          <ClusterNode
            key={url}
            {...({
              url,
              setMaster,
              cluster,
              nodes,
              addNode,
            })}
          />
        ))}
      </ul>

      <h4>Available Nodes:</h4>
      {uninitialized.length === 0  && Object.values(nodes).length !== 0 ? "Couldn't find any uninitialized nodes...": ""}
      <ul className="node-list">
        {available.map(url => (
          <AvailableNode
            key={url}
            {...({
              url,
              setMaster,
              addNode,
            })}
          />
        ))}
      </ul>
    </div>
  )
}

const AvailableNode = ({url, addNode, setMaster}) => {
  return (
    <li>
      {ipFromUrl(url)}
      <span className="indent-1">
        <span className="action" onClick={() => addNode(url)}>Add to Cluster</span>
        <span className="action" onClick={() => setMaster(url)}>Make Master</span>
      </span>
    </li>
  )
}

const ClusterNode = ({url, addNode, setMaster, cluster}) => {
  return (
    <li>
      {ipFromUrl(url)}
      <span className="indent-1">
        {cluster.master === url ? "Master" : <span className="action" onClick={() => setMaster(url)}>Make Master</span>}
      </span>
    </li>
  )
}

export default CreateCluster