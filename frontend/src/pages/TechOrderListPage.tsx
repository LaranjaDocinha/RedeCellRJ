import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TechOrderCard from '../components/TechOrderCard';
import LoadingSpinner from '../components/LoadingSpinner'; // Assumindo componente LoadingSpinner
import { useNavigate } from 'react-router-dom'; // Assumindo react-router-dom

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h2`
  color: #333;
  text-align: center;
  margin-bottom: 25px;
`;

const OrderList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const EmptyState = styled.p`
  text-align: center;
  color: #777;
  font-size: 1.1em;
  margin-top: 50px;
`;

interface TechOrder {
  id: number;
  device_name: string;
  problem_description: string;
  status: string;
  priority: string;
  customer_name: string;
  entry_date: string;
}

interface TechOrderListPageProps {
  apiBaseUrl?: string;
}

const TechOrderListPage: React.FC<TechOrderListPageProps> = ({ apiBaseUrl = '/api' }) => {
  const [orders, setOrders] = useState<TechOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assume que o usuário está autenticado e o token está sendo enviado (ex: via interceptor)
        const response = await fetch(`${apiBaseUrl}/tech/orders`, {
          headers: {
            // 'Authorization': `Bearer ${yourAuthToken}`, // Exemplo
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao carregar as ordens de serviço.');
        }
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [apiBaseUrl]);

  const handleCardClick = (orderId: number) => {
    navigate(`/tech/${orderId}`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner />
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando Ordens de Serviço...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <h2 style={{ textAlign: 'center', color: '#e74c3c' }}>Erro ao Carregar OS</h2>
        <p style={{ textAlign: 'center' }}>{error}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title>Ordens de Serviço Abertas</Title>
      {orders.length === 0 ? (
        <EmptyState>Nenhuma ordem de serviço pendente no momento.</EmptyState>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <TechOrderCard key={order.id} order={order} onClick={handleCardClick} />
          ))}
        </OrderList>
      )}
    </PageContainer>
  );
};

export default TechOrderListPage;
