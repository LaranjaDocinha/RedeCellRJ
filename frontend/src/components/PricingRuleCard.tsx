import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-left: 5px solid ${(props) => (props.isActive ? '#28A745' : '#FFC107')};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2em;
  color: #333;
`;

const StatusBadge = styled.span<{ isActive: boolean }>`
  background-color: ${(props) => (props.isActive ? '#28A745' : '#6C757D')};
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
`;

const DetailText = styled.p`
  margin: 0;
  font-size: 0.9em;
  color: #555;
`;

const ActionButton = styled(motion.button)`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85em;
  align-self: flex-start;
  margin-top: 5px;

  &:hover {
    background-color: #0056b3;
  }
`;

interface PricingRuleCardProps {
  rule: {
    id: number;
    name: string;
    condition_type: string;
    condition_value: any;
    action_type: string;
    action_value: number;
    is_active: boolean;
    priority: number;
  };
  onEdit?: (ruleId: number) => void;
  onToggleStatus?: (ruleId: number, currentStatus: boolean) => void;
}

const PricingRuleCard: React.FC<PricingRuleCardProps> = ({ rule, onEdit, onToggleStatus }) => {
  const formatCondition = (type: string, value: any) => {
    switch (type) {
      case 'low_turnover':
        return `Sem vendas há ${value.days_without_sale} dias`;
      case 'high_stock':
        return `Estoque acima de ${value.min_stock}`;
      default:
        return JSON.stringify(value);
    }
  };

  const formatAction = (type: string, value: number) => {
    switch (type) {
      case 'discount_percentage':
        return `Desconto de ${value}%`;
      case 'markup_percentage':
        return `Markup mínimo de ${value}%`;
      default:
        return `${value}`;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <CardContainer
      isActive={rule.is_active}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01, boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Header>
        <Title>{rule.name} (Prioridade: {rule.priority})</Title>
        <StatusBadge isActive={rule.is_active}>
          {rule.is_active ? 'Ativa' : 'Inativa'}
        </StatusBadge>
      </Header>
      <DetailText>Condição: {formatCondition(rule.condition_type, rule.condition_value)}</DetailText>
      <DetailText>Ação: {formatAction(rule.action_type, rule.action_value)}</DetailText>
      
      <ActionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onEdit && onEdit(rule.id)}
      >
        Editar
      </ActionButton>
      <ActionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggleStatus && onToggleStatus(rule.id, rule.is_active)}
        style={{ backgroundColor: rule.is_active ? '#DC3545' : '#28A745' }}
      >
        {rule.is_active ? 'Desativar' : 'Ativar'}
      </ActionButton>
    </CardContainer>
  );
};

export default PricingRuleCard;
