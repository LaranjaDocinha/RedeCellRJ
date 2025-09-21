import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';
import { 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalCloseBtn, 
  ModalBody 
} from './Modal.styled';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, initialFocusRef }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Save the element that triggered the modal
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus on the modal content or a specified element
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (modalContentRef.current) {
        modalContentRef.current.focus();
      }
    } else {
      // Return focus to the trigger element when modal closes
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen, initialFocusRef]);

  // Trap focus inside the modal
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen || !modalContentRef.current) return;

    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }

    if (event.key === 'Tab') {
      const focusableElements = modalContentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalTitleId = title ? `modal-title-${Math.random().toString(36).substr(2, 9)}` : undefined;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-testid="modal-overlay"
        >
          <ModalContent
            ref={modalContentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            tabIndex={-1} // Make modal content focusable
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              {title && <ModalTitle id={modalTitleId}>{title}</ModalTitle>}
              <ModalCloseBtn onClick={onClose} aria-label="Close modal">
                <FaTimes />
              </ModalCloseBtn>
            </ModalHeader>
            <ModalBody>{children}</ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
