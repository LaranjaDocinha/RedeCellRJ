import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { motion } from 'framer-motion';

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ModalHeader = styled.h2`
  margin: 0;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.outline};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
`;

interface InspectionModalProps {
  item: any;
  onClose: () => void;
  onSubmit: (status: 'approved' | 'rejected', notes: string) => void;
}

const InspectionModal: React.FC<InspectionModalProps> = ({ item, onClose, onSubmit }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = (status: 'approved' | 'rejected') => {
    onSubmit(status, notes);
  };

  return (
    <ModalBackdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ModalContent
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <ModalHeader>Inspecionar Item: {item.product_name}</ModalHeader>
        <p>Cliente: {item.customer_name}</p>
        <p>Quantidade: {item.quantity}</p>
        
        <NotesTextarea
          placeholder="Adicionar notas de inspeção..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <ButtonGroup>
          <Button label="Cancelar" onClick={onClose} />
          <Button label="Rejeitar" variant="danger" onClick={() => handleSubmit('rejected')} />
          <Button label="Aprovar" primary onClick={() => handleSubmit('approved')} />
        </ButtonGroup>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default InspectionModal;
