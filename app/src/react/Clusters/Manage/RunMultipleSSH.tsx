import React, { useState, useContext } from 'react'
import SSHTerminal from '../../Terminals/SSHTerminal'
import { useEffect } from 'react';

const hiddenClass = {
  visibility: "hidden",
  position: "absolute",
}
const sortByIP = (a, b) => lastNumIP(a.ip) - lastNumIP(b.ip)
const lastNumIP = ip => Number(ip.split('.')[3])

const RunMultipleSSH = ({processes, finished, showInit}) => {
  const [showTerms, setShowTerms] = useState<boolean[]>([])
  useEffect(() => {
    if (processes.length) {
      setShowTerms(processes.map(() => showInit))
    }
  }, [processes])
  if (!processes.length) {
    return <div />
  }
  const procs = processes.slice()
  procs.sort(sortByIP)
  return (
    <div>
      <br />
      <h4>{finished ? `Finished ${processes.length} tasks` : "Working..."}</h4>
      {procs.map((proc, i) => {
        return (
          <div key={i}>
          <button
            onClick={() => {
              const newShowTerms = showTerms.slice()
              newShowTerms[i] = !newShowTerms[i]
              setShowTerms(newShowTerms)
            }}>
              Show/Hide {proc.ip}
          </button>
          <div style={{...(showTerms[i] ? {} : hiddenClass)} as any}>
            <br />
            <SSHTerminal term={proc.term} />
          </div>
          </div>
        )
      })}
    </div>
  )
}

export default RunMultipleSSH