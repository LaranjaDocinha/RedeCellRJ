import React, { useState, useEffect } from 'react';

const MyOrders: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    // fetch('/api/me/sales').then...
    // Mocking:
    setSales([{ id: 1, sale_date: '2025-10-01', total_amount: '5150.00' }]);
  }, []);

  return (
    <div>
      <h2>Meus Pedidos</h2>
      {sales.map(sale => (
        <div key={sale.id}>
          <p>Pedido #{sale.id} - Data: {sale.sale_date} - Total: R$ {sale.total_amount}</p>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
