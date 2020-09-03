import React, { useEffect, useState, useRef, useContext } from 'react'
import "./Create.css"
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";
import SystemInfoContext from '../../Contexts/SystemInfoContext';
import CreateSetup from './CreateSetup';
import CreateRun from './CreateRun'

const Create = () => {
  const {nodes} = useContext(SystemInfoContext)
  const takenClusterNames = Object.keys(Object.values(nodes).reduce((prev, cur:any) => {
    if (!cur.apiResponded) {
      return prev
    }
    prev[cur.clustername] = true
    return prev
  }, ({} as any)))
  const ips = Object.keys(nodes)
  const availableIPs = ips.filter(ip => nodes[ip].apiResponded && nodes[ip].status === "UNINITIALIZED")
  const [cluster, setCluster] = useState({
    master: (availableIPs.length && availableIPs[0]) || "",
    slaves: (availableIPs.slice(1)) as string[],
  })
  let startClusterName = "cruster"
  let i = 2;
  while (takenClusterNames.includes(startClusterName)) {
    startClusterName = `cruster-${i}`
  }
  const [clusterName, setClusterName] = useState(startClusterName)
  const addNode = ip => {
    setCluster({
      ...cluster,
      slaves: [
        ...cluster.slaves,
        ip,
      ]
    })
  }
  const addNodes = ips => {
    setCluster({
      ...cluster,
      slaves: [
        ...cluster.slaves,
        ...ips,
      ]
    })
  }

  const removeNode = ip => {
    if (cluster.master === ip) {
      setCluster({
        master: "",
        slaves: cluster.slaves,
      })
    } else {
      setCluster({
        ...cluster,
        slaves: cluster.slaves.filter(_ip => _ip !== ip)
      })
    }
  }

  const removeAll = () => {
    setCluster({
      master: "",
      slaves: [],
    })
  }

  const setMaster = ip => {
    if (cluster.master !== "") {
      if (ip === cluster.master) return
      setCluster({
        master: ip,
        slaves: [
          ...cluster.slaves.filter(n => n !== ip),
          cluster.master,
        ]
      })
    } else {
      setCluster({
        slaves: [
          ...cluster.slaves.filter(n => n !== ip),
        ],
        master: ip,
      })
    }
  }
  useEffect(() => {
    ipcRenderer.send("refresh-nodes")
  }, [])

  return (
    <div className="boxed">
      <h3>Create Cluster</h3>
      <Switch>
        <Route path="/clusters/create/setup">
          <CreateSetup {...({
            clusterName,
            setClusterName,
            addNode,
            removeNode,
            nodes,
            cluster,
            setMaster,
            addNodes,
            removeAll,
          })} />
        </Route>
        <Route path="/clusters/create/run">
          <CreateRun {...({
            cluster,
            clusterName
          })} />
        </Route>
      </Switch>
    </div>
  )
}

export default Create
// const uninitialized = Object.entries(nodes)
//   .reduce((prev, [url, node]: any) => {
//     if (node.status === UNINITIALIZED) {
//       prev.push(url)
//     }
//     return prev
//   }, [] as any)
// uninitialized.sort(sortByIP)

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