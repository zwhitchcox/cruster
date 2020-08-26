import React from "react"
import "./Setup.css"
import Keys from './Keys';
import Wifi from './Wifi';

const Setup = () => {

  return (
    <div className="boxed">
      <Keys />
      <hr />
      <Wifi />
    </div>
  )
}

export default Setup