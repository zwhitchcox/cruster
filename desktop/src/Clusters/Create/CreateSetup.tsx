import React, { useState } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { useEffect } from 'react';

export const getHostname = ({clusterName, cluster, ip, index}) => (
  `${clusterName ? clusterName + "-" : ""}` +
  `${cluster.master === ip ? "master" : "slave-" +(index+1)}.local`
)
const validateClusterName = name => {
  if (!name.length) return true
  return /^[A-Za-z0-9]([A-Za-z0-9]|-){0,55}$/.test(name)
}
const lastNumIP = ip => Number(ip.split('.')[3])
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
  const ips = Object.keys(nodes)
  const availableNodes = ips
    .filter(ip => (
      ip !== cluster.master &&
      !cluster.slaves.includes(ip) &&
      nodes[ip].apiResponded &&
      nodes[ip].status === "UNINITIALIZED"))

  const nonresponsive = ips
      .filter(ip => !nodes[ip].apiResponded)
  // const uninitialized = ips.filter(ip => {
  //   nodes[ip].apiResponded &&
  //   nodes[ip].status === "UNINITIALIZED"
  // })
  console.log(nodes)


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
            <th></th>
            <th>new hostname</th>
            </tr>
          </thead>
          <tbody>
          {cluster.master === ""  ? null : <ClusterNode
            {...({
              ip: cluster.master,
              setMaster,
              clusterName,
              cluster,
              addNode,
              removeNode,
              index: null,
            })}
          />}
          {cluster.slaves.map((ip, index) => (
            <ClusterNode
              key={ip}
              {...({
                ip,
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
      {availableNodes.length ? <h4>Available Nodes</h4> : ""}
      {/* {uninitialized.length && Object.values(nodes).length ? "Couldn't find any uninitialized nodes...": ""} */}
      <table className="available-node-list">
      <tbody>
        {availableNodes
          .map(ip => (
          <AvailableNode
            key={ip}
            {...({
              ip,
              setMaster,
              addNode,
            })}
          />
        ))}
      </tbody>
      </table>
      {availableNodes.length ? <div onClick={() => addNodes(availableNodes)} className="action indent-1 top-margin">Add All</div> : ""}
      <br />
      <br />
      {nonresponsive.length === 0 ? "" : <div>
        The following ip addresses have a cluster, but the api didn't respond for some reason:

        <ul>
          {nonresponsive.map(ip => <li key={ip}>{ip}</li>)}
        </ul>
      </div>}
    </div>
  )
}
export default CreateSetup

const AvailableNode = ({ip, addNode, setMaster}) => {
  const history = useHistory()
  return (
    <tr>
      <td>
      {ip}
      </td>
      <td>
        <span className="action" onClick={() => addNode(ip)}>Add</span>
      </td>
      <td>
        <span className="action" onClick={() => setMaster(ip)}>Make Master</span>
      </td>
      <td>
        <span className="action" onClick={() => history.push(`/clusters/node-ssh/${ip}`)}>ssh</span>
      </td>
    </tr>
  )
}

const ClusterNode = ({ip, removeNode, setMaster, cluster, clusterName, index}) => {
  const history = useHistory()
  return (
    <tr>
      <td>
      {ip}
      </td>
      <td>
      <span className="action" onClick={() => removeNode(ip)}>Remove</span>
      </td>
      <td>
        {cluster.master === ip ? " Master" : <span className="action" onClick={() => setMaster(ip)}>Make Master</span>}
      </td>
      <td>
        <span className="action" onClick={() => history.push(`/clusters/node-ssh/${ip}`)}>ssh</span>
      </td>
      <td>
        {getHostname({clusterName, cluster, ip, index})}
      </td>
    </tr>
  )
}