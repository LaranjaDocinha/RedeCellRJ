import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { get } from '../../helpers/api_helper'; // Assuming you have this helper for API calls

const SalesVelocityWidget = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await get('/dashboard/predictions');
        // Format data for the chart
        const formattedData = response.map((item) => ({
          name: `${item.product_name} (${item.variation_name})`,
          'Vendas por Dia': parseFloat(item.sales_velocity).toFixed(2),
        }));
        setData(formattedData);
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar os dados de previsão de vendas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Carregando previsões...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (data.length === 0) {
    return <div>Não há dados de vendas suficientes para gerar previsões.</div>;
  }

  return (
    <div className='card'>
      <div className='card-body'>
        <h4 className='card-title mb-4'>Produtos Mais Vendidos (Velocidade de Venda)</h4>
        <ResponsiveContainer height={300} width='100%'>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='Vendas por Dia' fill='#8884d8' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesVelocityWidget;
