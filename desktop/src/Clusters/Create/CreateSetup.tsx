import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useEffect } from 'react';

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

const CreateSetup = ({
  clusterName,
  setClusterName,
  cluster,
  setMaster,
  addNode,
  removeNode,
  nodes,
  addNodes,
  removeAll,
}) => {
  const history = useHistory()
  const clusterErrors = validateCluster(cluster)
  const [attempted, setAttempted] = useState(false)
  const launch = () => {
    setAttempted(true)
    if (!clusterErrors.length) {
      history.push("/clusters/create/run")
    }
  }
  const availableNodes = nodes
    .filter(url => url !== cluster.master && !cluster.slaves.includes(url))

  return (
    <div>
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
                addNode,
                removeNode,
                index,
              })}
            />
          ))}
          </tbody>
        </table>
        {cluster.master !== "" || cluster.slaves.length  ? <div onClick={removeAll} className="action indent-1 top-margin">Remove All</div> : ""}
        <br />
        <button className="button-two" onClick={launch}>Launch</button>
      </div>}
      <h4>Available Nodes</h4>
      {/* {uninitialized.length === 0  && Object.values(nodes).length !== 0 ? "Couldn't find any uninitialized nodes...": ""} */}
      <table className="available-node-list">
      <tbody>
        {availableNodes
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
      {availableNodes.length ? <div onClick={() => addNodes(availableNodes)} className="action indent-1 top-margin">Add All</div> : ""}
        {/* {nonresponsive.length === 0 ? "" : <div>
          The following ip addresses have a cluster, but the api didn't respond for some reason:

          <ul>
            {nonresponsive.map(ip => <li key={ip}>{ip}</li>)}
          </ul>
        </div>} */}
    </div>
  )
}
export default CreateSetup

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