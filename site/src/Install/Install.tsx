import React, { useState } from 'react'
import "./Install.scss"
import { Helmet } from 'react-helmet';

const Install = () => {
  const [instructions, setInstructions] = useState(<div />)
  return (
    <div>
      <Helmet>
        <title>Cruster - Install</title>
      </Helmet>
      <nav>
        <ul className="nav-list nav-download">
          <li onClick={() => setInstructions(<div />)}>
            <a href="https://github.com/zwhitchcox/cruster/releases/download/v0.1.0/Mac-OS-X-cruster-0.1.0.dmg">
              <div className="btn btn-three">
                Mac
              </div>
            </a>
          </li>
          <li onClick={() => setInstructions(<div />)}>
            <a href="https://github.com/zwhitchcox/cruster/releases/download/v0.1.0/Windows-cruster-setup-0.1.0.exe">
              <div className="btn btn-three">
                Windows
              </div>
            </a>
          </li>
          <li onClick={() => setInstructions(LinuxInstructions)}>
            <a href="https://github.com/zwhitchcox/cruster/releases/download/v0.1.0/Linux-cruster-0.1.0.AppImage">
              <div className="btn btn-three">
                Linux
              </div>
            </a>
          </li>
        </ul>
      </nav>
      <div className="note">
        Note: 64-bit support only
      </div>
      {instructions}
    </div>
  )
}
export default Install

const linuxInstructions =
`cd ~/Downloads
chmod +x Linux-Cruster-0.1.0.AppImage
./Linux-Cruster-0.1.0.AppImage`

const LinuxInstructions = () => {
  return (
    <div className="instructions">
      To run on Linux, make the AppImage executable and then run it, e.g.:
      <code>
      {linuxInstructions}
      </code>
      Snap installation coming soon (pending snapcraft approval)
    </div>
  )
}