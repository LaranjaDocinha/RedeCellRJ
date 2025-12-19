import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion'; // Import Framer Motion

// Usar motion.div para animar o container
const CardContainer = styled(motion.div)`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 15px;
  border-left: 5px solid ${(props) => {
    switch (props.color) {
      case 'urgent':
        return '#DC3545'; // Red
      case 'high':
        return '#FFC107'; // Yellow
      case 'normal':
        return '#007BFF'; // Blue
      default:
        return '#6C757D';
    }
  }};
  cursor: pointer; /* Indica que é clicável */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const OSTitle = styled.h3`
  margin: 0;
  font-size: 1.1em;
  color: #333;
`;

const StatusBadge = styled.span<{ status: string }>`
  background-color: ${(props) => {
    switch (props.status) {
      case 'open':
      case 'analysis':
        return '#FFC107'; // Amarelo
      case 'in_progress':
      case 'waiting_approval':
        return '#007BFF'; // Azul
      case 'finished':
        return '#28A745'; // Verde
      case 'delivered':
        return '#6C757D'; // Cinza
      case 'cancelled':
        return '#DC3545'; // Vermelho
      default:
        return '#6C757D';
    }
  }};
  color: white;
  padding: 5px 8px;
  border-radius: 15px;
  font-size: 0.75em;
  font-weight: bold;
  text-transform: capitalize;
`;

const DetailText = styled.p`
  margin: 5px 0;
  font-size: 0.9em;
  color: #555;
`;

interface TechOrderCardProps {
  order: {
    id: number;
    device_name: string;
    problem_description: string;
    status: string;
    priority: string;
    customer_name: string;
    entry_date: string;
  };
  onClick?: (orderId: number) => void;
}

const TechOrderCard: React.FC<TechOrderCardProps> = ({ order, onClick }) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Variantes de animação
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <CardContainer 
      color={order.priority} 
      onClick={() => onClick && onClick(order.id)}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }} // Efeito de hover
      transition={{ type: "spring", stiffness: 300, damping: 20 }} // Transição suave
    >
      <Header>
        <OSTitle>OS #{order.id} - {order.device_name}</OSTitle>
        <StatusBadge status={order.status}>{order.status.replace('_', ' ')}</StatusBadge>
      </Header>
      <DetailText>Cliente: {order.customer_name}</DetailText>
      <DetailText>Problema: {order.problem_description.substring(0, 50)}...</DetailText>
      <DetailText>Entrada: {formatDate(order.entry_date)}</DetailText>
    </CardContainer>
  );
};

export default TechOrderCard;
