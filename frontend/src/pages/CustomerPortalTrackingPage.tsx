import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assumindo react-router-dom
import CustomerPortalLayout from '../components/CustomerPortalLayout';
import OrderTrackingCard from '../components/OrderTrackingCard';
import BudgetApprovalForm from '../components/BudgetApprovalForm';
import LoadingSpinner from '../components/LoadingSpinner'; // Assumindo componente LoadingSpinner
import { AppError } from '../../../backend/src/utils/errors'; // Ajustar o caminho se necessário

interface OrderDetails {
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
  customer_approval_status: 'pending' | 'approved' | 'rejected';
}

interface CustomerPortalTrackingPageProps {
  apiBaseUrl?: string;
}

const CustomerPortalTrackingPage: React.FC<CustomerPortalTrackingPageProps> = ({ apiBaseUrl = '/api' }) => {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token) {
        setError('Token de acompanhamento não fornecido.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/portal/orders/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível carregar os detalhes da OS.');
        }
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [token, apiBaseUrl]);

  const handleApproval = async (status: 'approved' | 'rejected', feedback?: string) => {
    if (!token) return;
    setIsApproving(true);
    setApprovalError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/portal/orders/${token}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, feedback }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Falha ao ${status === 'approved' ? 'aprovar' : 'rejeitar'} o orçamento.`);
      }

      if (order) {
        setOrder({ ...order, customer_approval_status: status });
      }
    } catch (err: any) {
      setApprovalError(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <CustomerPortalLayout>
        <LoadingSpinner />
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando detalhes da Ordem de Serviço...</p>
      </CustomerPortalLayout>
    );
  }

  if (error) {
    return (
      <CustomerPortalLayout>
        <h2 style={{ textAlign: 'center', color: '#e74c3c' }}>Erro ao Carregar OS</h2>
        <p style={{ textAlign: 'center' }}>{error}</p>
        <p style={{ textAlign: 'center' }}>Por favor, verifique o link ou tente novamente mais tarde.</p>
      </CustomerPortalLayout>
    );
  }

  if (!order) {
    return (
      <CustomerPortalLayout>
        <h2 style={{ textAlign: 'center' }}>OS Não Encontrada</h2>
        <p style={{ textAlign: 'center' }}>A Ordem de Serviço que você procura não foi encontrada.</p>
      </CustomerPortalLayout>
    );
  }

  const showApprovalForm = order.estimated_cost && order.customer_approval_status === 'pending';

  return (
    <CustomerPortalLayout title={`OS #${order.id} - ${order.device_name}`}>
      <OrderTrackingCard order={order} />
      {showApprovalForm && (
        <BudgetApprovalForm
          onApprove={(feedback) => handleApproval('approved', feedback)}
          onReject={(feedback) => handleApproval('rejected', feedback)}
          isLoading={isApproving}
          error={approvalError}
        />
      )}
      {order.customer_approval_status === 'approved' && (
        <BudgetApprovalForm isApproved />
      )}
      {order.customer_approval_status === 'rejected' && (
        <BudgetApprovalForm isRejected />
      )}
    </CustomerPortalLayout>
  );
};

export default CustomerPortalTrackingPage;
