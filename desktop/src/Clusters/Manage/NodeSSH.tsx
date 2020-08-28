import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ActionsContext from '../../Contexts/ActionsContext';
import SSHTerminal from '../../Terminals/SSHTerminal';

const resetCmd = "kubeadm reset -f\necho UNINITIALIZED>/home/pi/status\necho node > /etc/hostname\necho \"\" > /home/pi/clustername\n"
const NodeSSH = () => {
  const {ip, cmd} = useParams<any>()
  const { sshTerm } = useContext(ActionsContext)

  const [term, setTerm] = useState<any>()
  useEffect(() => {
    const {term, endTerm, startTerm, runCmd} = sshTerm({
      host: ip,
      username: "root",
      interactive: true,
    })
    setTerm(term)
    ;(async () => {
      await startTerm()
      if (cmd === "reset") {
        await runCmd({cmd: resetCmd})
      }
    })()
    return endTerm
  }, [])
  return (
    <div>
      <br />
      <SSHTerminal term={term} />
    </div>
  )
}

export default NodeSSH