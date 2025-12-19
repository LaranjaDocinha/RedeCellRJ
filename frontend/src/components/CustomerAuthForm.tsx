import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion'; // Import Framer Motion
import Input from '../components/Input';
import Button from '../components/Button';

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
  margin: 50px auto;
`;

const Title = styled(motion.h2)` // Animar o título também
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const ErrorMessage = styled(motion.p)` // Animar a mensagem de erro
  color: #e74c3c;
  text-align: center;
  font-size: 0.9em;
`;

interface CustomerAuthFormProps {
  onSubmit: (osId: string, identity: string) => void;
  isLoading?: boolean;
  error?: string;
}

// Variantes de animação
const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const CustomerAuthForm: React.FC<CustomerAuthFormProps> = ({ onSubmit, isLoading = false, error }) => {
  const [osId, setOsId] = useState('');
  const [identity, setIdentity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (osId && identity) {
      onSubmit(osId, identity);
    }
  };

  return (
    <FormContainer
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <Title variants={itemVariants}>Acompanhe sua Ordem de Serviço</Title>
      {error && (
        <ErrorMessage
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </ErrorMessage>
      )}
      <motion.div variants={itemVariants}> {/* Envolver inputs para animação sequencial */}
        <Input
          label="Número da OS"
          placeholder="Ex: 12345"
          value={osId}
          onChange={(e) => setOsId(e.target.value)}
          type="text"
          required
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Input
          label="CPF ou Telefone"
          placeholder="Ex: 123.456.789-00 ou (DD) 9XXXX-XXXX"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          type="text"
          required
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Carregando...' : 'Acompanhar'}
        </Button>
      </motion.div>
    </FormContainer>
  );
};

export default CustomerAuthForm;
