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

  const uninitialized: any[] = []
  const [name, setName] = useState("cruster")
  const [cluster, setCluster] = useState({
    master: ({} as any),
    slaves: ([] as any),
  })

  const addNode = url => {
    setCluster({
      ...cluster,
      slaves: [
        ...cluster.slaves,
        nodes[url],
      ]
    })
  }
  const setMaster = url => {
    if (Object.keys(cluster.master).length !== 0) {
      if (url === cluster.master.url) return
      setCluster({
        master: nodes[url],
        slaves: [
          ...cluster.slaves.filter(n => n.url !== url),
          cluster.master,
        ]
      })
    } else {
      setCluster({
        slaves: [
          ...cluster.slaves.filter(n => n.url !== url),
        ],
        master: nodes[url],
      })
    }
  }


  for (const _node of Object.values(nodes)) {
    const node: any = _node
    if (node.status === UNINITIALIZED) {
      uninitialized.push(node)
    }
  }

  const available = uninitialized.filter(n => {
    return !(cluster.slaves.some(s => s.url === n.url) || cluster.master.url === n.url)
  })

  return (
    <div className="boxed">
      <h3>Create Cluster</h3>
      Cluster Name: <input value={name} onChange={e => setName(e.target.value)} />
      {validateClusterName(name) ? "" : "Invalid Name."}
      {uninitialized.length === 0  && Object.values(nodes).length !== 0 ? "Couldn't find any uninitialized nodes...": ""}
      <h4>Cluster Nodes</h4>
        {/* {Object.values(nodes).length === 0 ? "Couldn't find any nodes..." : ""}
        {Object.values(nodes).map((n:any) => (
          <Node
            key={n.url}
            {...n}
            refresh={search}
          />
        ))} */}
      <ul className="node-list">
        {!cluster.master.url ? "" : <ClusterNode
          {...({
            ...cluster.master,
            setMaster,
            cluster,
          })}
        />}
        {cluster.slaves.map(n => (
          <ClusterNode
            key={n.url}
            {...({
              ...n,
              setMaster,
              cluster,
            })}
          />
        ))}
      </ul>

      <h4>Available Nodes:</h4>
      <ul className="node-list">
        {available.map(n => (
          <AvailableNode
            key={n.url}
            {...({
              ...n,
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
  console.log(cluster)
  return (
    <li>
      {ipFromUrl(url)}
      <span className="indent-1">
        {cluster.master.url === url ? "" : <span className="action" onClick={() => setMaster(url)}>Make Master</span>}
      </span>
    </li>
  )
}

export default CreateCluster