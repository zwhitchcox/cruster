import React, { useState, useContext, useEffect } from 'react'
import ActionsContext from '../../Contexts/ActionsContext';
import SystemInfoContext from '../../Contexts/SystemInfoContext';
import RunMultipleSSH from './RunMultipleSSH';

const isDev = process.env.NODE_ENV === "development"
const staticMaster = isDev && true
const devMaster = "192.168.1.86"
const resetCmd = "kubeadm reset -f\necho UNINITIALIZED>/home/pi/status\necho node > /etc/hostname\necho \"\" > /home/pi/clustername\n"
const ResetAll = () => {
  const { nodes } = useContext(SystemInfoContext)
  const [processes, setProcesses] = useState<any>([])
  const { multiSSH } = useContext(ActionsContext)
  const [finished, setFinished] = useState(false)
  const ips = Object.keys(nodes)
  useEffect(() => {
    const {runAll, startAll, endAll, processes} = multiSSH({
      ips: !staticMaster ? ips : ips.filter(ip => ip !== devMaster),
      username: 'root',
      interactive: true,
    })
    setProcesses(processes)
    ;(async () => {
      await startAll()
      await runAll({cmd: resetCmd})
      setFinished(true)
    })()
    return endAll
  }, [])
  return (
    <RunMultipleSSH processes={processes} finished={finished} showInit={false} />
  )
}

export default ResetAll