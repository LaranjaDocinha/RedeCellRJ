import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion'; // Import Framer Motion

const CardContainer = styled(motion.div)` // Usar motion.div para animações
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 25px;
  max-width: 800px;
  margin: 20px auto;
  font-family: 'Roboto', sans-serif; /* Exemplo de fonte */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;

const Title = styled.h2`
  color: #333;
  font-size: 1.8em;
  margin: 0;
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
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: 400;
  font-size: 0.9em;
  text-transform: capitalize;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 20px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  color: #666;
  font-size: 0.85em;
  margin-bottom: 3px;
  font-weight: 400;
`;

const DetailValue = styled.span`
  color: #333;
  font-size: 1em;
  font-weight: 400;
`;

const SectionTitle = styled.h3`
  color: #555;
  font-size: 1.3em;
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemName = styled.span`
  font-weight: 400;
  color: #333;
`;

const ItemQuantity = styled.span`
  color: #777;
  font-size: 0.9em;
`;

interface OrderTrackingCardProps {
  order: {
    id: number;
    device_name: string;
    problem_description: string;
    status: string;
    estimated_cost?: number;
    final_cost?: number;
    entry_date: string;
    delivery_date?: string;
    customer_name: string;
    branch_name: string;
    notes?: string;
    items: { description: string; unit_price: number; quantity: number }[];
    photos: { url: string; type: string }[];
  };
}

const OrderTrackingCard: React.FC<OrderTrackingCardProps> = ({ order }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Variantes de animação
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <CardContainer
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.005, boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }} // Animação de hover sutil
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Header>
        <Title>OS #{order.id}</Title>
        <StatusBadge status={order.status}>{order.status.replace('_', ' ')}</StatusBadge>
      </Header>

      <DetailGrid>
        <DetailItem>
          <DetailLabel>Cliente:</DetailLabel>
          <DetailValue>{order.customer_name}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Loja:</DetailLabel>
          <DetailValue>{order.branch_name}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Dispositivo:</DetailLabel>
          <DetailValue>{order.device_name}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Entrada:</DetailLabel>
          <DetailValue>{formatDate(order.entry_date)}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Estimativa de Custo:</DetailLabel>
          <DetailValue>
            {order.estimated_cost ? `R$ ${order.estimated_cost.toFixed(2)}` : 'Aguardando Avaliação'}
          </DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Custo Final:</DetailLabel>
          <DetailValue>
            {order.final_cost ? `R$ ${order.final_cost.toFixed(2)}` : 'Aguardando Conclusão'}
          </DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Entrega Prevista:</DetailLabel>
          <DetailValue>{formatDate(order.delivery_date)}</DetailValue>
        </DetailItem>
      </DetailGrid>

      <SectionTitle>Problema Reportado</SectionTitle>
      <p>{order.problem_description}</p>
      {order.notes && (
        <>
          <SectionTitle>Notas Internas</SectionTitle>
          <p>{order.notes}</p>
        </>
      )}

      {order.items && order.items.length > 0 && (
        <>
          <SectionTitle>Serviços e Peças</SectionTitle>
          <ItemList>
            {order.items.map((item, index) => (
              <ListItem key={index}>
                <ItemName>{item.description}</ItemName>
                <ItemQuantity>
                  {item.quantity} x R$ {item.unit_price.toFixed(2)} = R$ {(item.quantity * item.unit_price).toFixed(2)}
                </ItemQuantity>
              </ListItem>
            ))}
          </ItemList>
        </>
      )}

      {order.photos && order.photos.length > 0 && (
        <>
          <SectionTitle>Fotos</SectionTitle>
          {/* Implementar galeria de fotos aqui */}
          <p>Galeria de fotos (a ser implementada)</p>
          {/* Exemplo simples de exibição */}
          {order.photos.map((photo, index) => (
            <img key={index} src={photo.url} alt={`OS Photo ${index}`} style={{ maxWidth: '100px', margin: '5px' }} />
          ))}
        </>
      )}
    </CardContainer>
  );
};

export default OrderTrackingCard;

