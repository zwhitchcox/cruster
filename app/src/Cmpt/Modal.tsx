import React from 'react'
import "./Modal.scss"

const Modal = ({children, closeModal, isModalOpen}) => {
  return (
    <div id="open-modal" className={`modal-window${isModalOpen ? " visible" : ""}`}>
      <div className="modal-container">
        <a
          title="Close"
          className="modal-close"
          onClick={closeModal}>Close
        </a>
        <div className="modal-content">
        {children}
        </div>
        </div>
    </div>
  )
}

export default Modal