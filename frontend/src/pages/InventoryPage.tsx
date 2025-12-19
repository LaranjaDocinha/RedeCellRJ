
import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Loading from '../components/Loading';

// ... imports ...

const InventoryPage: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useNotification();
  const { token } = useAuth();
  const { socket } = useSocket();

  const fetchLowStockProducts = async () => {
// ... fetch implementation ...
  };

  useEffect(() => {
    fetchLowStockProducts();

    if (socket) {
      socket.on('stock_update', () => {
        addToast('Stock updated remotely. Refreshing...', 'info');
        fetchLowStockProducts();
      });
    }

    return () => {
      if (socket) {
        socket.off('stock_update');
      }
    };
  }, [token, addNotification, socket]);

  const handleAdjustStock = async (variationId: number, quantityChange: number) => {
    try {
      const response = await fetch('/api/inventory/adjust-stock', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ variationId, quantityChange }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      addToast('Stock adjusted successfully!', 'success');
      fetchLowStockProducts(); // Refresh list
    } catch (err: any) {
      addToast(`Failed to adjust stock: ${err.message}`, 'error');
    }
  };

  const columns = [
    { key: 'product_name', header: 'Produto' },
    { key: 'color', header: 'Cor' },
    { key: 'stock_quantity', header: 'Estoque' },
    { key: 'price', header: 'Preço' },
    {
      key: 'actions',
      header: 'Ações',
      render: (item: ProductVariation) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button label="Receber" size="small" onClick={() => handleAdjustStock(item.variation_id, 10)} />
          <Button label="Despachar" size="small" variant="danger" onClick={() => handleAdjustStock(item.variation_id, -10)} />
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <StyledEmptyState
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FaExclamationTriangle />
        <p>Error: {error}</p>
      </StyledEmptyState>
    );
  }

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledPageTitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {'Gerenciamento de Estoque'}
      </StyledPageTitle>

      {lowStockProducts.length === 0 ? (
        <StyledEmptyState
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FaBoxOpen />
          <p>Não há produtos com baixo estoque.</p>
        </StyledEmptyState>
      ) : (
        <Table data={lowStockProducts} columns={columns} />
      )}
    </StyledPageContainer>
  );
};

export default InventoryPage;
