import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
        <p
          className='label'
          style={{ color: 'var(--color-heading)', fontWeight: 'bold' }}
        >{`Produto: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: R$ ${entry.value?.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TopProductsChart = ({ data }) => {
  // Formata os dados para o gráfico, se necessário
  const formattedData =
    data?.map((item) => ({
      name: item.productName, // Ou outro campo para o nome do produto
      Vendas: item.totalSales,
    })) || [];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      style={{ width: '100%', height: '100%' }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <ResponsiveContainer height='100%' width='100%'>
        <BarChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid stroke='var(--color-border)' strokeDasharray='3 3' />
          <XAxis dataKey='name' stroke='var(--color-text-muted)' />
          <YAxis stroke='var(--color-text-muted)' />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            animationBegin={800}
            animationDuration={1500}
            dataKey='Vendas'
            fill='var(--color-info)'
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default TopProductsChart;
