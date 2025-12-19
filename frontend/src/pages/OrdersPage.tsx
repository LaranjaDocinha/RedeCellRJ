import React, { useState, useEffect } from 'react';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled';
import type { ServiceOrder, ServiceOrderStatus } from '../types/serviceOrder';
import { getServiceOrders, getServiceOrderById } from '../services/orderService';
import OrdersTable from '../components/OrdersTable';
import OrderDetailsModal from '../components/OrderDetailsModal';
import styled from 'styled-components';

// Estilos para os filtros
const FilterContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const FilterInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const FilterSelect = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;


const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para os filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  // Estado para o modal
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const filters = {
          status: statusFilter || undefined,
          customer_name: customerFilter || undefined,
        };
        const data = await getServiceOrders(filters);
        setOrders(data);
        setError(null);
      } catch (err) {
        setError('Falha ao buscar ordens de serviço.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchOrders();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [statusFilter, customerFilter]);

  const handleViewDetails = async (order: ServiceOrder) => {
    try {
      const fullOrder = await getServiceOrderById(order.id.toString());
      setSelectedOrder(fullOrder);
      setIsModalOpen(true);
    } catch (err) {
      setError('Falha ao buscar detalhes da ordem de serviço.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const orderStatusOptions: ServiceOrderStatus[] = [
    'Aguardando Avaliação', 'Aguardando Aprovação', 'Aprovado', 'Em Reparo', 
    'Aguardando Peça', 'Aguardando QA', 'Finalizado', 'Não Aprovado', 'Entregue'
  ];

  return (
    <StyledPageContainer>
      <StyledPageTitle>Ordens de Serviço</StyledPageTitle>
      
      <FilterContainer>
        <FilterInput 
          type="text"
          placeholder="Filtrar por cliente..."
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
        />
        <FilterSelect 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os Status</option>
          {orderStatusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </FilterSelect>
      </FilterContainer>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
        <OrdersTable orders={orders} onViewDetails={handleViewDetails} />
      )}

      {isModalOpen && (
        <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
      )}
    </StyledPageContainer>
  );
};

export default OrdersPage;
