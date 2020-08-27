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
kubeadm token create --print-join-command
echo INITIALIZED_MASTER > /home/pi/status
`

const joinSlaveCmd = joinCmd => (
`${joinCmd}
echo INITIALIZED_SLAVE > /home/pi/status
`
)

const CreateRun = ({cluster, clusterName}) => {
  const {
    INITIALIZING_MASTER,
    JOINING,
    INACTIVE,
  } = statuses
  const {sshTerm} = useContext(ActionsContext)
  const [status, setStatus] = useState(INACTIVE)
  const [term, setTerm] = useState<any>()
  const [note, setNote] = useState("Test Note")
  useEffect(() => {
    const {term, runCmd, endTerm, startTerm, getOutput} = sshTerm({
      host: cluster.master,
      username: "root",
    })
    setTerm(term)
    const joinSlave = () => {

    }
    ;(async () =>{
      await startTerm()
      setStatus(INITIALIZING_MASTER)
      setNote("Pulling the images can take some time! Don't exit, or you will have to restart")
      await runCmd({
        status: INITIALIZING_MASTER,
        cmd: initMasterCmd,
      })

      // get rid of warning
      const joinCmd = (await getOutput({cmd: "kubeadm token create --print-join-command"})).split("\n").pop()
      await endTerm()
      setStatus(JOINING)


      await runCmd({
        status: JOINING,
        cmd: "echo joining\n"
      })
      // history.push("/clusters/manage")
    })()
    return endTerm
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
      <div>{status}</div>
      <div className="note">Note: {note}</div>
      <SSHTerminal term={term} />
    </div>


  )
}

const Output =  (name, promise) => {

}

export default CreateRun
