import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19B7'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(2) : 0;

    return (
      <div
        className='custom-tooltip'
        style={{
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <p className='label' style={{ color: 'var(--color-heading)', fontWeight: 'bold' }}>
          {data.name}
        </p>
        <p style={{ color: payload[0].color }}>{`Vendas: R$ ${data.value?.toFixed(2)}`}</p>
        <p style={{ color: payload[0].color }}>{`Porcentagem: ${percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const SalesByPaymentMethodChart = ({ data }) => {
  // Formata os dados para o gráfico, se necessário
  const formattedData =
    data?.map((item) => ({
      name: item.method, // Nome do método de pagamento
      value: item.totalSales, // Total de vendas para o método
    })) || [];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      style={{ width: '100%', height: '100%' }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ResponsiveContainer height='100%' width='100%'>
        <PieChart>
          <Pie
            animationBegin={800}
            animationDuration={1500}
            cx='50%'
            cy='50%'
            data={formattedData}
            dataKey='value'
            fill='#8884d8'
            isAnimationActive={true}
            labelLine={false}
            outerRadius={80}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SalesByPaymentMethodChart;
