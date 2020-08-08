import "./Flash.css"
import React, { useEffect, useState, useRef } from 'react'

const Flash = ({drives}) => {
  return (
    <div className="boxed">
      <h3>Flash SD(s)</h3>
      <pre>
      {Object.values(drives).map(drive => JSON.stringify(drive, null, 2))}
      </pre>
    </div>
  )
}

export default Flash

