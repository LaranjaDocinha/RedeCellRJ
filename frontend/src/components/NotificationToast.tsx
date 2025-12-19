import React, { useEffect } from 'react';
import {
  StyledNotificationToast,
  NotificationMessage,
  CloseButton,
} from './NotificationToast.styled';
import { FaTimes } from 'react-icons/fa';

interface NotificationToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: (id: string) => void;
  duration?: number;
}

const toastVariants = {
  initial: { opacity: 0, y: -50, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.8 },
  hover: { scale: 1.05 },
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
    <StyledNotificationToast
      type={type}
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      layout // Ensures smooth re-ordering
      role="alert" // Announce urgent messages
      aria-live="assertive" // Ensure screen readers announce immediately
    >
      <NotificationMessage>{message}</NotificationMessage>
      <CloseButton onClick={() => onClose(id)} aria-label="Close notification">
        <FaTimes />
      </CloseButton>
    </StyledNotificationToast>
  );
};

export default NotificationToast;