import React, { useEffect, useState, useRef } from 'react'
import { UNINITIALIZED } from './constants'
import "./CreateCluster.css"
import { ipFromUrl } from './util'


const validateClusterName = name => /^[A-Za-z0-9]([A-Za-z0-9]|-){0,55}$/.test(name)
const lastNumIP = ip => Number(ipFromUrl(ip).split('.')[3])
const sortByIP = (a, b) => lastNumIP(a) - lastNumIP(b)

const validateCluster = (cluster) => {
  const errors: string[] = []
  if (!cluster.master) {
    errors.push("Cluster must have master node.")
  }
  if (!cluster.slaves.length) {
    errors.push("Cluster must have at least one slave node.")
  }
  return errors
}


// necessary because of asynchronous code
// capturing stale data in closures
const CreateCluster = ({nodes}) => {
  const [attempted, setAttempted] = useState(false)
  const uninitialized = Object.entries(nodes)
    .reduce((prev, [url, node]: any) => {
      if (node.status === UNINITIALIZED) {
        prev.push(url)
      }
      return prev
    }, [] as any)
  uninitialized.sort(sortByIP)
  const [name, setName] = useState("cruster")
  const [cluster, setCluster] = useState({
    master: "",
    slaves: [] as string[],
  })
  const clusterErrors = validateCluster(cluster)

  const addNode = url => {
    setCluster({
      ...cluster,
      slaves: [
        ...cluster.slaves,
        url,
      ]
    })
  }

  const removeNode = url => {
    if (cluster.master === url) {
      setCluster({
        master: "",
        slaves: cluster.slaves,
      })
    } else {
      setCluster({
        ...cluster,
        slaves: cluster.slaves.filter(_url => _url !== url)
      })
    }
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

  const launch = () => {
    if (clusterErrors.length !== 0) {
      setAttempted(true)
      return
    }
  }


  const available = uninitialized.filter(url => {
    return !(cluster.slaves.some(s => s === url) || cluster.master === url)
  })

  return (
    <div className="boxed">
      <h3>Create Cluster</h3>
      <div className="upper-create">
        <label>
        Cluster Name<br />
        <input
          placeholder="Cluster Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {validateClusterName(name) ? "" : "Invalid Name."}
        </label>
      </div>
      <h4>Cluster Nodes</h4>
      {!attempted ? "" : clusterErrors.map(err => <div className="error">{err}</div>)}
      {(!cluster.master && !cluster.slaves.length) ? "You have not added any nodes." : <div>
        <table className="node-list">
          <tbody>
          {cluster.master === ""  ? null : <ClusterNode
            {...({
              url: cluster.master,
              setMaster,
              cluster,
              nodes,
              addNode,
              removeNode,
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
                removeNode,
              })}
            />
          ))}
          </tbody>
        </table>
        <br />
        <button onClick={launch}>Launch</button>
      </div>}
      <h4>Available Nodes</h4>
      {uninitialized.length === 0  && Object.values(nodes).length !== 0 ? "Couldn't find any uninitialized nodes...": ""}
      <table className="node-list">
      <tbody>
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
      </tbody>
      </table>
    </div>
  )
}

const AvailableNode = ({url, addNode, setMaster}) => {
  return (
    <tr>
      <td>
      {ipFromUrl(url)}
      </td>
      <td>
      <span className="indent-1">
        <span className="action" onClick={() => addNode(url)}>Add</span>
        <span className="action" onClick={() => setMaster(url)}>Make Master</span>
      </span>
      </td>
    </tr>
  )
}

const ClusterNode = ({url, addNode, removeNode, setMaster, cluster}) => {
  return (
    <tr>
      <td>
      {ipFromUrl(url)}
      </td>
      <td>
      <span className="action" onClick={() => removeNode(url)}>Remove</span>
        {cluster.master === url ? " Master" : <span className="action" onClick={() => setMaster(url)}>Make Master</span>}
      </td>
    </tr>
  )
}

export default CreateCluster