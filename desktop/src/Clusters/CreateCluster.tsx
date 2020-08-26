import React, { useEffect, useState, useRef } from 'react'
import "./CreateCluster.css"
import CreatingCluster from './CreatingCluster'

export const ipFromUrl = url => url.replace("http://", "").replace(":9090", "")

export const getHostname = ({clusterName, cluster, url, index}) => (
  `${clusterName ? clusterName + "-" : ""}` +
  `${cluster.master === url ? "master" : "slave-" +(index+1)}.local`
)

const validateClusterName = name => {
  if (!name.length) return true
  return /^[A-Za-z0-9]([A-Za-z0-9]|-){0,55}$/.test(name)
}
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
  const [isCreating, setIsCreating] = useState(false)
  const [attempted, setAttempted] = useState(false)
  // const uninitialized = Object.entries(nodes)
  //   .reduce((prev, [url, node]: any) => {
  //     if (node.status === UNINITIALIZED) {
  //       prev.push(url)
  //     }
  //     return prev
  //   }, [] as any)
  // uninitialized.sort(sortByIP)
  const [clusterName, setClusterName] = useState("cruster")
  const [cluster, setCluster] = useState({
    master: "",
    slaves: [] as string[],
  })
  if (isCreating) {
    return (
      <CreatingCluster
        cluster={cluster}
        clusterName={clusterName}
      />
    )
  }

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
    setIsCreating(true)
  }

  // const available = uninitialized.filter(url => {
  //   return !(cluster.slaves.some(s => s === url) || cluster.master === url)
  // })

  // const nonresponsive = Object.entries(nodes)
  //   .reduce((prev, [url, node]:any) => {
  //     if (!node.apiResponded) {
  //       prev.push(ipFromUrl(url))
  //     }
  //     return prev
  //   }, [] as string[])

  return (
    <div className="boxed">
      <h3>Create Cluster</h3>
      <div className="upper-create">
        <label>
        Cluster Name<br />
        <input
          placeholder="Cluster Name"
          value={clusterName}
          onChange={e => setClusterName(e.target.value)}
        />
        {validateClusterName(clusterName) ? "" : "Invalid Name."}
        </label>
      </div>
      <h4>Cluster Nodes</h4>
      {!attempted ? "" : clusterErrors.map(err => <div className="error">{err}</div>)}
      {(!cluster.master && !cluster.slaves.length) ? "You have not added any nodes." : <div>
        <table className="node-list">
          <thead>
            <tr>
            <th>ip</th>
            <th colSpan={2}>actions</th>
            <th>new hostname</th>
            </tr>
          </thead>
          <tbody>
          {cluster.master === ""  ? null : <ClusterNode
            {...({
              url: cluster.master,
              setMaster,
              clusterName,
              cluster,
              nodes,
              addNode,
              removeNode,
              index: null,
            })}
          />}
          {cluster.slaves.map((url, index) => (
            <ClusterNode
              key={url}
              {...({
                url,
                clusterName,
                setMaster,
                cluster,
                nodes,
                addNode,
                removeNode,
                index,
              })}
            />
          ))}
          </tbody>
        </table>
        <br />
        <button className="button-two" onClick={launch}>Launch</button>
      </div>}
      <h4>Available Nodes</h4>
      {/* {uninitialized.length === 0  && Object.values(nodes).length !== 0 ? "Couldn't find any uninitialized nodes...": ""} */}
      <table className="available-node-list">
      <tbody>
        {nodes
          .filter(url => url !== cluster.master && !cluster.slaves.includes(url))
          .map(url => (
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
        {/* {nonresponsive.length === 0 ? "" : <div>
          The following ip addresses have a cluster, but the api didn't respond for some reason:

          <ul>
            {nonresponsive.map(ip => <li key={ip}>{ip}</li>)}
          </ul>
        </div>} */}
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

const ClusterNode = ({url, removeNode, setMaster, cluster, clusterName, index}) => {
  return (
    <tr>
      <td>
      {ipFromUrl(url)}
      </td>
      <td>
      <span className="action" onClick={() => removeNode(url)}>Remove</span>
      </td>
      <td>
        {cluster.master === url ? " Master" : <span className="action" onClick={() => setMaster(url)}>Make Master</span>}
      </td>
      <td>
        {getHostname({clusterName, cluster, url, index})}
      </td>
    </tr>
  )
}

export default CreateCluster