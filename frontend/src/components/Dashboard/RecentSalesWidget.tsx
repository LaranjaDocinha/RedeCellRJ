import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../NotificationProvider';
import Loading from '../Loading';

interface Sale {
  id: number;
  total_amount: number;
  sale_date: string;
}

interface RecentSalesWidgetProps {
  // No specific props needed as it fetches its own data
}

const RecentSalesWidget: React.FC<RecentSalesWidgetProps> = () => {
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const response = await fetch('http://localhost:3000/sales', { // Assuming /sales endpoint exists
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Sale[] = await response.json();
        // Limit to top 5 recent sales for the widget
        setRecentSales(data.slice(0, 5));
      } catch (error: any) {
        addNotification(`Failed to fetch recent sales: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSales();
  }, [token, addNotification]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Recent Sales</h3>
      {recentSales.length === 0 ? (
        <p>No recent sales found.</p>
      ) : (
        <ul className="space-y-2">
          {recentSales.map((sale) => (
            <li key={sale.id} className="flex justify-between items-center border-b pb-1">
              <span>Sale #{sale.id}</span>
              <span className="font-medium">${sale.total_amount.toFixed(2)}</span>
              <span className="text-sm text-gray-500">{new Date(sale.sale_date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentSalesWidget;
