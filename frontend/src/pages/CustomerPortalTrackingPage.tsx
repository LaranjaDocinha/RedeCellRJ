import React, { useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import CustomerPortalLayout from '../components/CustomerPortalLayout';
import OrderTrackingCard from '../components/OrderTrackingCard';
import BudgetApprovalForm from '../components/BudgetApprovalForm';

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
  const { order: initialOrder } = useLoaderData() as { order: OrderDetails };
  const [order, setOrder] = useState<OrderDetails>(initialOrder);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

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

      setOrder({ ...order, customer_approval_status: status });
    } catch (err: any) {
      setApprovalError(err.message);
    } finally {
      setIsApproving(false);
    }
  };

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
