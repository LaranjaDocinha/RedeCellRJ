import React, { useEffect, useState } from 'react';
import { NotificationContainer, NotificationMessage, CloseButton } from './NotificationToast.styled';
import { FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Import motion

interface NotificationToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: (id: string) => void;
  duration?: number; // in milliseconds, 0 for infinite
}

const toastVariants = {
  initial: { opacity: 0, y: -50, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.8 },
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, onClose, duration]);

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout // For smooth positioning when others appear/disappear
    >
      <NotificationContainer type={type}>
        <NotificationMessage>{message}</NotificationMessage>
        <CloseButton onClick={() => onClose(id)}>
          <FaTimes />
        </CloseButton>
      </NotificationContainer>
    </motion.div>
  );
};

export default NotificationToast;