import React from 'react';

export interface ServiceOrderCardProps {
  order: {
    id: number;
    customerName: string;
    productDescription: string;
    status: string;
    date: string;
  }
}

export const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
      <h3>OS #{order.id} - {order.productDescription}</h3>
      <p>Cliente: {order.customerName}</p>
      <p>Status: <strong>{order.status}</strong></p>
      <p>Data: {order.date}</p>
    </div>
  );
};
