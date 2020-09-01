import React from 'react'
import "./Modal.scss"

const Modal = ({children, closeModal, isModalOpen}) => {
  return (
    <div id="open-modal" className={`modal-window${isModalOpen ? " visible" : ""}`}>
      <div className="modal-container">
        <div className="modal-content">
        <a
          title="Close"
          className="modal-close"
          onClick={closeModal}>Close
        </a>
        {children}
        </div>
        </div>
    </div>
  )
}

export default Modal