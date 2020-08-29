import React, { useState, useContext, useEffect } from 'react'
import ActionsContext from '../../Contexts/ActionsContext';
import SystemInfoContext from '../../Contexts/SystemInfoContext';
import RunMultipleSSH from './RunMultipleSSH';
import "./RunCmdAll.css"

const RunCmdAll = () => {
  const { nodes } = useContext(SystemInfoContext)
  const [processes, setProcesses] = useState<any>([])
  const { multiSSH } = useContext(ActionsContext)
  const [finished, setFinished] = useState(false)
  const [running, setRunning] = useState(false)
  const [cmd, setCmd] = useState("")
  const [username, setUsername] = useState("root")
  const ips = Object.keys(nodes)
  const run = async () => {
    setRunning(true)
    const {runAll, startAll, endAll, processes} = multiSSH({
      ips,
      username,
      interactive: true,
    })
    setProcesses(processes)
    await startAll()
    await runAll({cmd})
    setFinished(true)
    await endAll()
  }

  // TODO: no spell check, better interface in general for command entering
  return (<div>
    <br />
    examples:
    <ul style={{listStyleType: 'none', lineHeight: 1.5}}>
      <li>Reboot:</li>
      <li><pre>reboot</pre></li>
      <li>Change Password:</li>
      <li><pre>echo "pi:new_password" | chpasswd</pre></li>
    </ul>

    {running ? "" : <div>
      username: <br /><input type="text" value={username} onChange={e => setUsername(e.target.value)}/><br/><br />
      command: <input className="console-input" type="text" value={cmd} onChange={e => setCmd(e.target.value)}/><br/>
      <button onClick={run}>Run</button>
    </div>}
    {!running ? "" : <RunMultipleSSH processes={processes} finished={finished} showInit={false} />}
  </div>
  )
}

export default RunCmdAll
