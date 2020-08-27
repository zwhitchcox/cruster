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

// necessary because of asynchronous code
// capturing stale data in closures
const Create = () => {
  const {nodes} = useContext(SystemInfoContext)
  const [cluster, setCluster] = useState({
    master: (nodes.length && nodes[0]) || "",
    slaves: (nodes.slice(1)) as string[],
  })
  const [clusterName, setClusterName] = useState("cruster")
  const addNode = url => {
    setCluster({
      ...cluster,
      slaves: [
        ...cluster.slaves,
        url,
      ]
    })
  }
  const addNodes = urls => {
    setCluster({
      ...cluster,
      slaves: [
        ...cluster.slaves,
        ...urls,
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

  const removeAll = () => {
    setCluster({
      master: "",
      slaves: [],
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