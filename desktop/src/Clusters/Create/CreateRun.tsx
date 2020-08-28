import React, { useEffect, useState, useContext } from 'react'

import "./CreateRun.css"
import ActionsContext from '../../Contexts/ActionsContext';
import SSHTerminal from '../../Terminals/SSHTerminal';
import RunMultipleSSH from '../Manage/RunMultipleSSH';
import { useHistory } from 'react-router-dom';

const isDev = process.env.NODE_ENV === "development"
const statuses = {
  INITIALIZING_MASTER: "Initializing master...",
  JOINING: "Initializing slaves...",
  INACTIVE: "",
}
const initMasterCmd =
`kubeadm init  --pod-network-cidr=10.244.0.0/16
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
kubeadm token create --print-join-command
echo MASTER > /home/pi/status
`

export const getHostname = ({clusterName, cluster, ip, index}) => (
  `${clusterName ? clusterName + "-" : ""}` +
  `${cluster.master === ip ? "master" : "slave-" +(index+1)}`
)

const devCluster = {
  master: "192.168.1.86",
  slaves: [
    "192.168.1.121",
    "192.168.1.116",
    "192.168.1.118",
  ],
}

const CreateRun = ({cluster, clusterName}) => {
  if (isDev) {
    cluster = devCluster
  }
  const history = useHistory()
  const {
    INITIALIZING_MASTER,
    JOINING,
    INACTIVE,
  } = statuses
  const {sshTerm, multiSSH} = useContext(ActionsContext)
  const [status, setStatus] = useState(INACTIVE)
  const [term, setTerm] = useState<any>()
  const [processes, setProcesses] = useState<any[]>([])
  const [note, setNote] = useState("")
  const [finished, setFinished] = useState(false)
  const joinSlaves = async (joinCmd: string) => {
    const {startAll, processes, endAll} = multiSSH({
      ips: cluster.slaves,
      hostname: 'root',
      interactive: true,
    })
    setStatus(JOINING)
    setProcesses(processes)
    await new Promise((res, rej) => setTimeout(res, 1000))
    await startAll()
    await new Promise((res, rej) => setTimeout(res, 1000))
    await Promise.all(processes.map(async ({ip, runCmd}, index) => {
      await runCmd({
        status: `Initializing slave ${ip}`,
        cmd: joinCmd,
      })
      await runCmd({
        status: "",
        cmd: "echo SLAVE > /home/pi/status"
      })
      const hostname = getHostname({
          clusterName,
          cluster,
          ip,
          index,
        })
      await runCmd({
        status: `Setting hostname ${hostname} for ${ip}`,
        cmd: `echo ${hostname} > /etc/hostname`
      })
      await runCmd({
        status: `Setting clustername ${clusterName} for ${ip}`,
        cmd: `echo ${clusterName} > /home/pi/clustername`
      })
      await runCmd({
        status: `Setting masterip ${cluster.master} for ${ip}`,
        cmd: `echo ${cluster.master} > /home/pi/masterip`
      })
    }))

    setFinished(true)
    await endAll()
    setStatus(INACTIVE)

    history.push("/clusters/manage")
  }
  useEffect(() => {
    const {term, runCmd, endTerm, startTerm, getOutput} = sshTerm({
      host: cluster.master,
      username: "root",
    })
    setTerm(term)

    ;(async () =>{
      await startTerm()
      setStatus(INITIALIZING_MASTER)
      setNote("Pulling the images can take some time! Don't exit, or you will have to restart")
      await runCmd({
        status: INITIALIZING_MASTER,
        cmd: initMasterCmd,
      })
      await runCmd({
        status: `Setting clustername ${clusterName} for ${cluster.master}`,
        cmd: `echo ${clusterName} > /home/pi/clustername`
      })
      const hostname = getHostname({
          clusterName,
          cluster,
          ip: cluster.master,
          index: 0,
        })
      await runCmd({
        status: `Setting hostname ${hostname} for ${cluster.master}`,
        cmd: `echo ${hostname} > /etc/hostname`
      })
      await runCmd({
        status: `Setting clustername ${clusterName} for ${cluster.master}`,
        cmd: `echo ${clusterName} > /home/pi/clustername`
      })
      await runCmd({
        status: `Setting masterip ${cluster.master} for ${cluster.master}`,
        cmd: `echo ${cluster.master} > /home/pi/masterip`
      })

      // get rid of warning
      const outputLines = (await getOutput({cmd: "kubeadm token create --print-join-command"})).split("\n")
      const joinCmd = outputLines[outputLines.length - 2]
      await endTerm()
      setTerm(null)
      setNote("")
      joinSlaves(joinCmd)
    })()
    return endTerm
  }, [])

  return (
    <div>
      <br />
      <div>{status}</div>
      <div className="warning">Note: {note}</div>
      {!term ? "" : <div>
        <h4>Initializing Master</h4>
        <SSHTerminal term={term} />
      </div>}
      {!processes.length ? "" : (
        <div>
          <h4>Joining Slaves to Master</h4>
          <RunMultipleSSH processes={processes} finished={finished} showInit={true} />
        </div>
      )}
    </div>


  )
}
export default CreateRun
