import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../../context/DashboardContext';
import './FocusModeModal.scss';

const FocusModeModal = ({ children }) => {
  const { focusModeWidget, setFocusModeWidget } = useDashboard();

  const handleClose = () => {
    setFocusModeWidget(null);
  };

  return (
    <AnimatePresence>
      {focusModeWidget && (
        <motion.div
          className="focus-mode-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="focus-mode-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <button className="close-btn" onClick={handleClose}>
              <i className="bx bx-x"></i>
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

FocusModeModal.propTypes = {
  children: PropTypes.node,
};

export default FocusModeModal;
