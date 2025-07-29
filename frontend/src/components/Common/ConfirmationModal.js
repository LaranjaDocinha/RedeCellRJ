import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import LoadingSpinner from './LoadingSpinner';

const ConfirmationModal = ({ isOpen, toggle, onConfirm, loading, title, message }) => {
  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{title || 'Confirmar Ação'}</ModalHeader>
      <ModalBody>{message || 'Você tem certeza que deseja realizar esta ação?'}</ModalBody>
      <ModalFooter>
        <Button color='secondary' disabled={loading} onClick={toggle}>
          Cancelar
        </Button>
        <Button color='danger' disabled={loading} onClick={onConfirm}>
          {loading ? <LoadingSpinner size='sm' /> : 'Confirmar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;
