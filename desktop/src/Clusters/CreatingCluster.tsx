import React, { useEffect, useState } from 'react'
import { v4 } from 'uuid'

import "./CreatingCluster.css"


const CreatingCluster = ({cluster, clusterName}) => {
  const status = useState("Initializing Master...")
  const {master, slaves} = cluster
  useEffect(() => {
    const id = v4()
    ipcRenderer.send("initialize-master", {master, id})
    const onComplete = () => {
      ipcRenderer.off("slaves-initialized", onComplete)
    }
    const initializeSlaves = () => {
      ipcRenderer.off("master-initialized", initializeSlaves)
      ipcRenderer.send("initialize-slaves", {slaves, master, id})
      ipcRenderer.on("slaves-initialized", onComplete)
    }
    ipcRenderer.on("master-initialized", initializeSlaves)
  })

  return (
    <div className="boxed">
      <h3>Creating Cluster</h3>


    </div>
  )
}

const Output =  (name, promise) => {

}

export default CreatingCluster
