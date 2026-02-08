import React from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { PlayArrow, Pause } from '@mui/icons-material';

const CardContainer = styled(motion.div)<{ color: string }>`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-left: 5px solid ${(props) => {
    switch (props.color) {
      case 'urgent':
        return '#DC3545';
      case 'high':
        return '#FFC107';
      case 'normal':
        return '#007BFF';
      default:
        return '#6C757D';
    }
  }};
  cursor: pointer;
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
        return '#FFC107';
      case 'in_progress':
      case 'waiting_approval':
        return '#007BFF';
      case 'finished':
        return '#28A745';
      case 'delivered':
        return '#6C757D';
      case 'cancelled':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  }};
  color: white;
  padding: 5px 8px;
  border-radius: 15px;
  font-size: 0.75em;
  font-weight: 400;
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
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ["#e74c3c", "#ffffff", "#2ecc71"]
  );
  const opacityStart = useTransform(x, [50, 100], [0, 1]);
  const opacityPause = useTransform(x, [-100, -50], [1, 0]);

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.x > 100) {
      alert(`Iniciando OS #${order.id}`);
    } else if (info.offset.x < -100) {
      alert(`Pausando OS #${order.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', marginBottom: '15px' }}>
        <motion.div style={{ position: 'absolute', left: 20, top: '50%', y: '-50%', opacity: opacityStart, color: 'white', display: 'flex', alignItems: 'center', gap: 10, zIndex: 0 }}>
            <PlayArrow /> Iniciar
        </motion.div>
        <motion.div style={{ position: 'absolute', right: 20, top: '50%', y: '-50%', opacity: opacityPause, color: 'white', display: 'flex', alignItems: 'center', gap: 10, zIndex: 0 }}>
            <Pause /> Pausar
        </motion.div>

        <CardContainer 
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, background, position: 'relative', zIndex: 1 }}
          onDragEnd={handleDragEnd}
          color={order.priority} 
          onClick={() => onClick && onClick(order.id)}
        >
          <Header>
            <OSTitle>OS #{order.id} - {order.device_name}</OSTitle>
            <StatusBadge status={order.status}>{order.status.replace('_', ' ')}</StatusBadge>
          </Header>
          <DetailText>Cliente: {order.customer_name}</DetailText>
          <DetailText>Problema: {order.problem_description.substring(0, 50)}...</DetailText>
          <DetailText>Entrada: {formatDate(order.entry_date)}</DetailText>
        </CardContainer>
    </div>
  );
};

export default TechOrderCard;