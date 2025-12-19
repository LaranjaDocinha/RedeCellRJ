import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion'; // Import Framer Motion
import Button from '../components/Button'; // Assumindo componente Button existente
import Input from '../components/Input'; // Assumindo componente Input existente

// Usar motion.form para animar o container
const FormContainer = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 30px auto;
`;

const Title = styled.h3`
  text-align: center;
  color: #333;
  margin-bottom: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
`;

const Message = styled(motion.p)` // Componente base para mensagens animadas
  text-align: center;
  font-size: 0.9em;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
`;

const ErrorMessage = styled(Message)`
  color: #e74c3c;
  background-color: #fcebeb;
`;

const SuccessMessage = styled(Message)`
  color: #28a745;
  background-color: #e6faed;
`;

interface BudgetApprovalFormProps {
  onApprove: (feedback?: string) => void;
  onReject: (feedback?: string) => void;
  isLoading?: boolean;
  error?: string;
  isApproved?: boolean;
  isRejected?: boolean;
}

// Variantes de animação
const formVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const messageVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const BudgetApprovalForm: React.FC<BudgetApprovalFormProps> = ({
  onApprove,
  onReject,
  isLoading = false,
  error,
  isApproved = false,
  isRejected = false,
}) => {
  const [feedback, setFeedback] = useState('');

  if (isApproved) {
    return (
      <SuccessMessage variants={messageVariants} initial="hidden" animate="visible">
        Orçamento aprovado com sucesso! Entraremos em contato em breve.
      </SuccessMessage>
    );
  }

  if (isRejected) {
    return (
      <ErrorMessage variants={messageVariants} initial="hidden" animate="visible">
        Orçamento rejeitado. Entraremos em contato para mais detalhes.
      </ErrorMessage>
    );
  }

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove(feedback);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    onReject(feedback);
  };

  return (
    <FormContainer
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <Title>Aprovação de Orçamento</Title>
      {error && (
        <ErrorMessage variants={messageVariants} initial="hidden" animate="visible">
          {error}
        </ErrorMessage>
      )}
      <Input
        label="Comentários (Opcional)"
        placeholder="Adicione qualquer observação..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        type="textarea" // Assumindo que o Input suporta type="textarea"
      />
      <ButtonGroup>
        <Button
          onClick={handleApprove}
          disabled={isLoading}
          primary
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Aprovando...' : 'Aprovar Orçamento'}
        </Button>
        <Button
          onClick={handleReject}
          disabled={isLoading}
          danger
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Rejeitando...' : 'Rejeitar Orçamento'}
        </Button>
      </ButtonGroup>
    </FormContainer>
  );
};

export default BudgetApprovalForm;
