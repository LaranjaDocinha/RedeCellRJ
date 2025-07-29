import { useState, useEffect } from 'react';
import axios from 'axios'; // Usando o axios já existente no projeto

const useDashboardKpis = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulação de chamada à API. Substituir pela URL real do endpoint.
        // const result = await axios.get('/api/dashboard/kpis');
        // setData(result.data);

        // Dados Mockados para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay
        setData({
          totalSales: { value: 'R$ 7.850', trend: 'up', percentage: 15 },
          avgTicket: { value: 'R$ 125', trend: 'up', percentage: 5 },
          newCustomers: { value: '42', trend: 'up', percentage: 20 },
          totalOrders: { value: '62', trend: 'down', percentage: 3 },
        });

      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};

export default useDashboardKpis;
