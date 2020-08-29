import React, { useState, useContext, useEffect } from 'react'
import ActionsContext from '../../Contexts/ActionsContext';
import SystemInfoContext from '../../Contexts/SystemInfoContext';
import RunMultipleSSH from './RunMultipleSSH';
import { TEST_CLUSTER, RESET_MASTER_WITH_ALL, CRUSTER_DIR, RESET_CMD } from '../../constants';

const ResetAll = () => {
  const { nodes } = useContext(SystemInfoContext)
  const [processes, setProcesses] = useState<any>([])
  const { multiSSH } = useContext(ActionsContext)
  const [finished, setFinished] = useState(false)
  const ips = Object.keys(nodes)
  const toReset = ips.filter(ip => (ip !== TEST_CLUSTER.master) || RESET_MASTER_WITH_ALL)
  useEffect(() => {
    const {runAll, startAll, endAll, processes} = multiSSH({
      ips: toReset,
      username: 'root',
      interactive: true,
    })
    setProcesses(processes)
    ;(async () => {
      await startAll()
      await runAll({cmd: RESET_CMD})
      setFinished(true)
    })()
    return endAll
  }, [])
  return (
    <RunMultipleSSH processes={processes} finished={finished} showInit={false} />
  )
}

export default ResetAll