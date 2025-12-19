import React from 'react';
import type { ServiceOrder } from '../types/serviceOrder';
import styled from 'styled-components';

// Estilos simples para a tabela
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;

  &:hover {
    opacity: 0.8;
  }
`;

interface OrdersTableProps {
  orders: ServiceOrder[];
  onViewDetails: (order: ServiceOrder) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onViewDetails }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Técnico</th>
          <th>Status</th>
          <th>Data de Criação</th>
          <th>Total</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.customer_name || 'N/A'}</td>
            <td>{order.technician_name || 'N/A'}</td>
            <td>{order.status}</td>
            <td>{new Date(order.created_at).toLocaleDateString()}</td>
            <td>R$ {order.budget_value?.toFixed(2) || '0.00'}</td>
            <td>
              <ActionsContainer>
                <ActionButton onClick={() => onViewDetails(order)}>
                  Detalhes
                </ActionButton>
              </ActionsContainer>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrdersTable;
