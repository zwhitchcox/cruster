import React, { useRef, useEffect, useState } from 'react'

const SSHTerminal = ({term}) => {
  const ref:any = useRef(null)

  useEffect(() => {
    if (ref && ref.current !== null && term) {
      term.open(ref.current)
    }
  }, [ref, term])
  return (
    <div id="terminal" ref={ref} />
  )
}

export default SSHTerminal
