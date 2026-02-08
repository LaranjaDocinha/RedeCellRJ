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
  border-left: 5px solid ${(props) => (props.isActive ? '#28A745' : '#DC3545')};
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
  background-color: ${(props) => (props.isActive ? '#28A745' : '#DC3545')};
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: 400;
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
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  align-self: flex-start;
  margin-top: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

interface MarketplaceIntegrationCardProps {
  integration: {
    id: number;
    name: string;
    is_active: boolean;
    last_synced_at?: string;
    status_message?: string;
  };
  onSyncNow?: (integrationId: number) => void;
  onConfigure?: (integrationId: number) => void;
}

const MarketplaceIntegrationCard: React.FC<MarketplaceIntegrationCardProps> = ({
  integration,
  onSyncNow,
  onConfigure,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <CardContainer
      isActive={integration.is_active}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01, boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Header>
        <Title>{integration.name}</Title>
        <StatusBadge isActive={integration.is_active}>
          {integration.is_active ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      </Header>
      <DetailText>Última Sincronização: {formatDate(integration.last_synced_at)}</DetailText>
      {integration.status_message && <DetailText>Status: {integration.status_message}</DetailText>}
      
      <ActionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSyncNow && onSyncNow(integration.id)}
      >
        Sincronizar Agora
      </ActionButton>
      <ActionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onConfigure && onConfigure(integration.id)}
        style={{ backgroundColor: '#6c757d' }} // Botão de configuração secundário
      >
        Configurar
      </ActionButton>
    </CardContainer>
  );
};

export default MarketplaceIntegrationCard;

