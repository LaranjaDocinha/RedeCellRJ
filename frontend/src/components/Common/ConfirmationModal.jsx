
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const ConfirmationModal = ({ isOpen, toggle, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>
        {message}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>{cancelText}</Button>
        <Button color="primary" onClick={() => { onConfirm(); toggle(); }}>{confirmText}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;
