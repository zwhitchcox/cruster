
import "./Flash.css"
import React, { useEffect, useState, useRef, useContext } from 'react'
import SystemInfoContext from '../Contexts/SystemInfoContext';
import ActionsContext from '../Contexts/ActionsContext';
type Drive = {
  name: string;
  location: string;
  size: number;
}
const parseDrive = (drive): Drive => ({
  name: drive.drive.description,
  location: drive.path,
  size: drive.drive.size,
})
const Flash = () => {
  const {drives} = useContext(SystemInfoContext)
  const {runAction} = useContext(ActionsContext)
  const [checkedDrives, setCheckedDrives] = useState({})
  const toggleChecked = (location) => setCheckedDrives({
    ...checkedDrives,
    [location]: !checkedDrives[location]
  })
  const parsedDrives:{[key: string]: Drive}  = {}
  for (const driveKey in drives) {
    parsedDrives[driveKey] = parseDrive(drives[driveKey])
  }
  const write = () => {
    runAction({
      status: "Writing to drives...",
      args: {
        drives: Object.keys(checkedDrives)
      }
    })
  }

  return (
    <div className="boxed">
      <h3 className="top-margin">Flash SD(s)</h3>
        {Object.values(parsedDrives).map((drive, i) => (
          <div className="flash-flex" key={drive.location}>
            <div>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={!!checkedDrives[drive.location]}
                  onChange={() => toggleChecked(drive.location)}
                />
                <span className="checkmark" />
              </label>
            </div>
            <div>{drive.location}</div>
            <div>{drive.name}</div>
            <div>{(drive.size/Math.pow(10, 9))|0}GB</div>
          </div>
        ))}
        <button onClick={write}>Write</button>
    </div>
  )
}

export default Flash