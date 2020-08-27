import React, { useEffect, useState, useContext } from 'react'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { AttachAddon } from 'xterm-addon-attach'

import "./CreateRun.css"
import ActionsContext from '../../Contexts/ActionsContext';
import SSHTerminal from '../../Terminals/SSHTerminal';
import { useHistory } from 'react-router-dom';

const statuses = {
  INITIALIZING_MASTER: "Initializing master...",
  JOINING: "Joining slave nodes to master...",
  INACTIVE: "",
}
const initMasterCmd =
`kubeadm init  --pod-network-cidr=10.244.0.0/16
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
kubeadm token create --print-join-command`

const CreateRun = ({cluster, clusterName}) => {
  const {
    INITIALIZING_MASTER,
    JOINING,
    INACTIVE,
  } = statuses
  const history = useHistory()
  const {sshTerm} = useContext(ActionsContext)
  const [status, setStatus] = useState(INACTIVE)
  const [term, setTerm] = useState<any>()
  useEffect(() => {
    ;(async () =>{
      const {term, runCmd, endTerm, startTerm} = sshTerm({
        host: cluster.master,
        username: "root",
      })
      setTerm(term)
      await startTerm()
      setStatus(INITIALIZING_MASTER)
      await runCmd({
        status: INITIALIZING_MASTER,
        cmd: "echo initializing\n",
      })
      setStatus(JOINING)
      await runCmd({
        status: JOINING,
        cmd: "echo joining\n"
      })
      await endTerm()
      history.push("/clusters/manage")
    })()
  }, [])
  // useEffect(() => {
  //   const id = v4()
  //   ipcRenderer.send("initialize-master", {master, id})
  //   const onComplete = () => {
  //     ipcRenderer.off("slaves-initialized", onComplete)
  //   }
  //   const initializeSlaves = () => {
  //     ipcRenderer.off("master-initialized", initializeSlaves)
  //     ipcRenderer.send("initialize-slaves", {slaves, master, id})
  //     ipcRenderer.on("slaves-initialized", onComplete)
  //   }
  //   ipcRenderer.on("master-initialized", initializeSlaves)
  // })

  return (
    <div>
      {status}
      <SSHTerminal term={term} />
      {JSON.stringify(cluster, null, 2)}
    </div>


  )
}

const Output =  (name, promise) => {

}

export default CreateRun
