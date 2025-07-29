import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
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
        >{`Mês: ${label}`}</p>
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

const MonthlySalesChart = ({ data }) => {
  const formattedData =
    data?.map((item) => ({
      name: item.month, // Ou item.date, dependendo da granularidade
      Vendas: item.totalSales,
      Lucro: item.totalProfit,
    })) || [];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      style={{ width: '100%', height: '100%' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <ResponsiveContainer height='100%' width='100%'>
        <LineChart
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
          <Line
            activeDot={{ r: 8 }}
            dataKey='Vendas'
            isAnimationActive={true}
            stroke='var(--color-primary)'
            strokeWidth={2}
            type='monotone'
          />
          <Line
            dataKey='Lucro'
            isAnimationActive={true}
            stroke='var(--color-success)'
            strokeWidth={2}
            type='monotone'
          />
          <Brush dataKey='name' height={30} stroke='var(--color-primary)' />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default MonthlySalesChart;
