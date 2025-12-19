import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TrackOrderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order status from a public backend endpoint
    // fetch(`/api/public/track-order/${orderId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setOrder(data);
    //     setLoading(false);
    //   });
    // Mock data for now:
    setOrder({ id: orderId, status: 'Em Reparo', history: [{ status: 'Aguardando Avaliação', date: '2025-10-06' }] });
    setLoading(false);
  }, [orderId]);

  if (loading) return <p>Carregando...</p>;
  if (!order) return <p>Ordem de Serviço não encontrada.</p>;

  return (
    <div>
      <h2>Status da O.S. #{order.id}</h2>
      <p>Status Atual: <strong>{order.status}</strong></p>
      {order.status === 'Aguardando Aprovação' && (
        <div>
          <button>Aprovar Orçamento</button>
          <button>Rejeitar Orçamento</button>
        </div>
      )}
      {/* History and approval buttons would go here */}
    </div>
  );
};

export default TrackOrderPage;
