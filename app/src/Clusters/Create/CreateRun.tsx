import React, { useEffect, useState, useContext } from 'react'
import "./CreateRun.css"
import ActionsContext from '../../Contexts/ActionsContext';
import SSHTerminal from '../../Terminals/SSHTerminal';
import RunMultipleSSH from '../Manage/RunMultipleSSH';
import { useHistory } from 'react-router-dom';

import {
  IS_DEV,
  TEST_CLUSTER,
  USE_TEST_CLUSTER,
  CRUSTER_DIR,
} from '../../constants'

const statuses = {
  INITIALIZING_MASTER: "Initializing master...",
  INITIALIZING_SLAVES: "Initializing slaves...",
  INITIALIZING_CNI: "Initializing CNI...",
  INACTIVE: "",
}

export const getHostname = ({clusterName, cluster, ip, index}) => (
  `${clusterName ? clusterName + "-" : ""}` +
  `${cluster.master === ip ? "master" : "slave-" +(index+1)}`
)

const CreateRun = ({cluster, clusterName}) => {
  // if (IS_DEV && USE_TEST_CLUSTER) {
  //   cluster = TEST_CLUSTER
  // }
  const history = useHistory()
  const {
    INITIALIZING_MASTER,
    INITIALIZING_SLAVES,
    INITIALIZING_CNI,
    INACTIVE,
  } = statuses
  const {sshTerm, multiSSH} = useContext(ActionsContext)
  const [status, setStatus] = useState(INACTIVE)
  const [term, setTerm] = useState<any>()
  const [processes, setProcesses] = useState<any[]>([])
  const [note, setNote] = useState("")
  const [finished, setFinished] = useState(false)
  const common = async ({runCmd, ip, index}) => {
    const hostname = getHostname({
        clusterName,
        cluster,
        ip,
        index,
      })
    await runCmd({
      status: `Setting hostname ${hostname} for ${ip}`,
      cmd: `echo ${hostname} > /etc/hostname\nsudo hostnamectl set-hostname ${hostname}\n`
    })
    await runCmd({
      status: `Setting clustername ${clusterName} for ${ip}`,
      cmd: `echo ${clusterName} > ${CRUSTER_DIR}/clustername\n`
    })
    await runCmd({
      status: `Setting masterip ${cluster.master} for ${ip}`,
      cmd: `echo ${cluster.master} > ${CRUSTER_DIR}/masterip\n`
    })
  }
  const joinSlaves = async (joinCmd: string) => {
    const {startAll, processes, endAll} = multiSSH({
      ips: cluster.slaves,
      hostname: 'root',
      interactive: true,
    })
    setStatus(INITIALIZING_SLAVES)
    setProcesses(processes)
    await new Promise((res, rej) => setTimeout(res, 1000))
    await startAll()
    await new Promise((res, rej) => setTimeout(res, 1000))
    await Promise.all(processes.map(async ({ip, runCmd}, index) => {
      await common({runCmd, ip, index})
      await runCmd({
        status: `Initializing slave ${ip}`,
        cmd: joinCmd,
      })
      await runCmd({
        status: "",
        cmd: `echo SLAVE > ${CRUSTER_DIR}/status`
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
    const hostname = getHostname({
        clusterName,
        cluster,
        ip: cluster.master,
        index:0,
      })
      const initMasterCmd =
      `kubeadm init  --pod-network-cidr=10.244.0.0/16 --node-name=${hostname}
      kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
      kubeadm token create --print-join-command
      echo MASTER > ${CRUSTER_DIR}/status
      mkdir -p $HOME/.kube
      sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
      sudo chown $(id -u):$(id -g) $HOME/.kube/config
      `

    ;(async () =>{
      await startTerm()
      setStatus(INITIALIZING_MASTER)
      await common({runCmd, ip: cluster.master, index: 0})
      setNote("Pulling the images can take some time. Don't exit, or you will have to redo it!")
      await runCmd({
        status: INITIALIZING_MASTER,
        cmd: initMasterCmd,
      })
      await runCmd({
        status: `Setting clustername ${clusterName} for ${cluster.master}`,
        cmd: `echo ${clusterName} > ${CRUSTER_DIR}/clustername`
      })


      // get rid of warning
      const outputLines = (await getOutput({cmd: "kubeadm token create --print-join-command"})).split("\n")
      const joinCmd = outputLines[outputLines.length - 2]
      await joinSlaves(joinCmd)
      await endTerm()
      await initializeCNI()
      setTerm(null)
    })()
    return endTerm
  }, [])
  const initializeCNI = async () => {
      setNote("")
    const {term, runCmd, endTerm, startTerm} = sshTerm({
      host: cluster.master,
      username: "root",
    })
    setTerm(term)

    await startTerm()
    setStatus(INITIALIZING_CNI)
    await runCmd({
      status: INITIALIZING_CNI,
      cmd: `kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml`
    })

    await endTerm()
  }


  return (
    <div>
      <br />
      <h4>{status}</h4>
      <div className="warning">Note: {note}</div>
      {!term ? "" : <div>
        <SSHTerminal term={term} />
      </div>}
      {!processes.length ? "" : (
        <div>
          <RunMultipleSSH processes={processes} finished={finished} showInit={true} />
        </div>
      )}
    </div>


  )
}
export default CreateRun
