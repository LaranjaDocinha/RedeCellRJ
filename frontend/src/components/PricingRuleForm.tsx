import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import Button from '../components/Button';
import Dropdown from '../components/Dropdown'; // Assumindo Dropdown existente

const FormContainer = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 20px auto;
`;

const Title = styled(motion.h3)`
  text-align: center;
  color: #333;
  margin-bottom: 10px;
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

const CheckboxContainer = styled(motion.div)` // Animar o container do checkbox
  display: flex;
  align-items: center;
  gap: 10px;
`;

interface PricingRuleFormProps {
  initialData?: {
    id?: number;
    name: string;
    condition_type: string;
    condition_value: any;
    action_type: string;
    action_value: number;
    is_active: boolean;
    priority: number;
  };
  onSubmit: (data: {
    name: string;
    condition_type: string;
    condition_value: any;
    action_type: string;
    action_value: number;
    is_active: boolean;
    priority: number;
  }) => void;
  isLoading?: boolean;
  error?: string;
  isSubmitted?: boolean;
}

const conditionOptions = [
  { value: 'low_turnover', label: 'Baixa Rotatividade (Dias sem venda)' },
  { value: 'high_stock', label: 'Alto Estoque (Quantidade mínima)' },
  // Adicionar outras condições aqui
];

const actionOptions = [
  { value: 'discount_percentage', label: 'Desconto Percentual' },
  { value: 'markup_percentage', label: 'Markup Mínimo Percentual' },
  // Adicionar outras ações aqui
];

const PricingRuleForm: React.FC<PricingRuleFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  error,
  isSubmitted = false,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [conditionType, setConditionType] = useState(initialData?.condition_type || '');
  const [conditionValue, setConditionValue] = useState<any>(initialData?.condition_value || {});
  const [actionType, setActionType] = useState(initialData?.action_type || '');
  const [actionValue, setActionValue] = useState(initialData?.action_value || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [priority, setPriority] = useState(initialData?.priority || 0);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setConditionType(initialData.condition_type);
      setConditionValue(initialData.condition_value);
      setActionType(initialData.action_type);
      setActionValue(initialData.action_value);
      setIsActive(initialData.is_active);
      setPriority(initialData.priority);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && conditionType && actionType && actionValue !== undefined) {
      onSubmit({
        name,
        condition_type: conditionType,
        condition_value: conditionValue,
        action_type: actionType,
        action_value: Number(actionValue),
        is_active: isActive,
        priority: Number(priority),
      });
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (isSubmitted) {
    return (
      <SuccessMessage variants={messageVariants} initial="hidden" animate="visible">
        Regra de precificação salva com sucesso!
      </SuccessMessage>
    );
  }

  return (
    <FormContainer
      variants={formVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
    >
      <Title variants={itemVariants}>{initialData ? 'Editar Regra de Precificação' : 'Nova Regra de Precificação'}</Title>
      {error && (
        <ErrorMessage variants={messageVariants} initial="hidden" animate="visible">
          {error}
        </ErrorMessage>
      )}

      <motion.div variants={itemVariants}>
        <Input
          label="Nome da Regra"
          placeholder="Ex: Desconto por Encalhe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Dropdown
          label="Tipo de Condição"
          options={conditionOptions}
          value={conditionType}
          onChange={(e) => setConditionType(e.target.value)}
          placeholder="Selecione o tipo de condição"
          required
        />
      </motion.div>

      {conditionType === 'low_turnover' && (
        <motion.div variants={itemVariants}>
          <Input
            label="Dias sem venda"
            placeholder="Ex: 30"
            value={conditionValue.days_without_sale || ''}
            onChange={(e) => setConditionValue({ ...conditionValue, days_without_sale: Number(e.target.value) })}
            type="number"
            required
          />
        </motion.div>
      )}

      {conditionType === 'high_stock' && (
        <motion.div variants={itemVariants}>
          <Input
            label="Quantidade mínima em estoque"
            placeholder="Ex: 50"
            value={conditionValue.min_stock || ''}
            onChange={(e) => setConditionValue({ ...conditionValue, min_stock: Number(e.target.value) })}
            type="number"
            required
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Dropdown
          label="Tipo de Ação"
          options={actionOptions}
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          placeholder="Selecione o tipo de ação"
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="Valor da Ação (%)"
          placeholder="Ex: 15 (para 15% de desconto/markup)"
          value={actionValue}
          onChange={(e) => setActionValue(Number(e.target.value))}
          type="number"
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="Prioridade (Maior valor = maior prioridade)"
          placeholder="Ex: 10"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          type="number"
          required
        />
      </motion.div>

      <CheckboxContainer variants={itemVariants}>
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={isLoading}
        />
        <label htmlFor="isActive">Regra Ativa?</label>
      </CheckboxContainer>

      <motion.div variants={itemVariants}>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Regra'}
        </Button>
      </motion.div>
    </FormContainer>
  );
};

export default PricingRuleForm;
