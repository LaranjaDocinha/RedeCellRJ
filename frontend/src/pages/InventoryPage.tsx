
import React, { useEffect, useState } from 'react';
import { useNotification } from '../components/NotificationProvider';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import { useTranslation } from 'react-i18next';

interface ProductVariation {
  variation_id: number;
  product_name: string;
  color: string;
  stock_quantity: number;
  price: number;
}

const InventoryPage: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();
  const { token } = useAuth();
  const { t } = useTranslation();

  const fetchLowStockProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory/low-stock', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ProductVariation[] = await response.json();
      setLowStockProducts(data);
    } catch (err: any) {
      setError(err.message);
      addNotification(`Failed to fetch low stock products: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, [token, addNotification]);

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
      addNotification('Stock adjusted successfully!', 'success');
      fetchLowStockProducts(); // Refresh list
    } catch (err: any) {
      addNotification(`Failed to adjust stock: ${err.message}`, 'error');
    }
  };

  const columns = [
    { key: 'product_name', header: t('product') },
    { key: 'color', header: t('color') },
    { key: 'stock_quantity', header: t('stock') },
    { key: 'price', header: t('price') },
    {
      key: 'actions',
      header: t('actions'),
      render: (item: ProductVariation) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button label={t('receive')} size="small" onClick={() => handleAdjustStock(item.variation_id, 10)} />
          <Button label={t('dispatch')} size="small" variant="danger" onClick={() => handleAdjustStock(item.variation_id, -10)} />
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="inventory-page">
      <h1>{t('inventory_management')}</h1>
      <h2>{t('low_stock_products')}</h2>
      {lowStockProducts.length === 0 ? (
        <p>{t('no_low_stock_products')}</p>
      ) : (
        <Table data={lowStockProducts} columns={columns} />
      )}
    </div>
  );
};

export default InventoryPage;
