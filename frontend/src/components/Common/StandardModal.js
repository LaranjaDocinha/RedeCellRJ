import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { motion, AnimatePresence } from 'framer-motion';

const StandardModal = ({ isOpen, toggle, title, children, footer }) => {
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { y: '-100vh', opacity: 0 },
    visible: { y: '0', opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
    exit: { y: '100vh', opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div animate='visible' exit='exit' initial='hidden'>
          <Modal centered backdrop={false} isOpen={isOpen} toggle={toggle}>
            <motion.div variants={modalVariants}>
              <ModalHeader toggle={toggle}>{title}</ModalHeader>
              <ModalBody>{children}</ModalBody>
              {footer && <ModalFooter>{footer}</ModalFooter>}
            </motion.div>
          </Modal>
          <motion.div className='modal-backdrop fade show' variants={backdropVariants} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StandardModal;
