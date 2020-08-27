import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ActionsContext from '../Contexts/ActionsContext';
import LocalTerminal from '../Terminals/LocalTerminal';
import SSHTerminal from '../Terminals/SSHTerminal';

const NodeSSH = () => {
  const { ip } = useParams()
  const { sshTerm } = useContext(ActionsContext)
  const [term, setTerm] = useState<any>()
  useEffect(() => {
    const {term, endTerm, startTerm} = sshTerm({
      host: ip,
      username: "root",
      interactive: true,
    })
    setTerm(term)
    ;(async () => {
      await startTerm()
    })()
    return endTerm
  }, [])
  return (
    <SSHTerminal term={term} />
  )
}

export default NodeSSH