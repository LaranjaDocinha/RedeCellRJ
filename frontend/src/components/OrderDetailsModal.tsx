import React from 'react';
import type { ServiceOrder, ServiceOrderItem } from '../types/serviceOrder';
import styled from 'styled-components';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

interface OrderDetailsModalProps {
  order: ServiceOrder | null;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  if (!order) {
    return null;
  }

  // Mock de itens, já que a API principal não os retorna na lista
  const items: ServiceOrderItem[] = (order as any).items || [];

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <ModalTitle>Detalhes da Ordem de Serviço #{order.id}</ModalTitle>
        
        <p><strong>Cliente:</strong> {order.customer_name || 'N/A'}</p>
        <p><strong>Técnico:</strong> {order.technician_name || 'N/A'}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Data de Criação:</strong> {new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Descrição do Produto:</strong> {order.product_description}</p>
        <p><strong>Descrição do Problema:</strong> {order.issue_description}</p>
        <p><strong>Orçamento:</strong> R$ {order.budget_value?.toFixed(2) || 'Aguardando'}</p>
        
        <h3>Itens e Serviços</h3>
        {items.length > 0 ? (
          <ul>
            {items.map(item => (
              <li key={item.id}>
                {item.service_description} - {item.quantity} x R$ {item.unit_price.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum item ou serviço associado.</p>
        )}

      </ModalContent>
    </ModalBackdrop>
  );
};

export default OrderDetailsModal;
