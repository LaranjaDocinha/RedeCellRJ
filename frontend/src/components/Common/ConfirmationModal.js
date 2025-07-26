import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';

const ConfirmationModal = ({ isOpen, toggle, onConfirm, loading, title, message }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{title || 'Confirmar Ação'}</ModalHeader>
      <ModalBody>
        {message || 'Você tem certeza que deseja realizar esta ação?'}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          Cancelar
        </Button>
        <Button color="danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Confirmar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;
