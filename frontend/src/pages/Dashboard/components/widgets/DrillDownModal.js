import React from 'react';
import PropTypes from 'prop-types';
import './DrillDownModal.scss';

const DrillDownModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className='drill-down-modal-overlay'
      role='button'
      tabIndex='0'
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClose();
        }
      }}
    >
      <div className='drill-down-modal-content' role='none' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h3>{title}</h3>
          <button className='close-btn' onClick={onClose}>
            &times;
          </button>
        </div>
        <div className='modal-body'>{children}</div>
      </div>
    </div>
  );
};

DrillDownModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default DrillDownModal;
