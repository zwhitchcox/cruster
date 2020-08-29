import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ActionsContext from '../../Contexts/ActionsContext';
import SSHTerminal from '../../Terminals/SSHTerminal';
import { RESET_CMD } from '../../constants';

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
        await runCmd({cmd: RESET_CMD})
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