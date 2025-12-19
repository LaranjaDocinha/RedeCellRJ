import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ServiceOrderCard } from '../../components/ServiceOrderCard';

// Mock Data
const orders = {
  'Aguardando Avaliação': [{ id: 1, customerName: 'Customer A', productDescription: 'iPhone 12', status: 'Aguardando Avaliação', date: '2025-10-07'}],
  'Em Reparo': [{ id: 2, customerName: 'Customer B', productDescription: 'Samsung S21', status: 'Em Reparo', date: '2025-10-07'}],
  'Finalizado': [],
};

const ServiceOrderDashboard: React.FC = () => {
  // DND logic would go here

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {Object.keys(orders).map(status => (
        <div key={status} style={{ flex: 1, padding: '8px', backgroundColor: '#f4f4f4' }}>
          <h3>{status}</h3>
          {orders[status as keyof typeof orders].map(order => (
            <ServiceOrderCard key={order.id} order={order} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ServiceOrderDashboard;
