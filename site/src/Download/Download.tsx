import React from 'react'
import "./Download.css"

const Install = () => {
  return (
    <div>
      <nav>
        <ul className="nav-list nav-download">
          <li>
            <a href="https://github.com/zwhitchcox/cruster/releases/download/v0.0.1/Mac-OS-X-cruster-0.1.0.dmg">
              <div className="btn btn-three">
                Mac
              </div>
            </a>
          </li>
          <li>
            <a href="https://github.com/zwhitchcox/cruster/releases/download/v0.0.1/Windows-cruster-setup-0.1.0.exe">
              <div className="btn btn-three">
                Windows
              </div>
            </a>
          </li>
          <li>
            <a href="https://github.com/zwhitchcox/cruster/releases/download/v0.0.1/Linux-cruster-0.1.0.AppImage">
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

    </div>
  )
}
export default Install