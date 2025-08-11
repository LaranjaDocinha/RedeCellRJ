import React from 'react';
import ReactApexChart from 'react-apexcharts'; // Adicionar importação
import { motion } from 'framer-motion';

const SalesByPaymentMethodChart = ({ data }) => {
  const formattedData =
    data?.map((item) => ({
      name: item.method, // Nome do método de pagamento
      value: item.totalSales, // Total de vendas para o método
    })) || [];

  const series = formattedData.map(item => item.value);
  const labels = formattedData.map(item => item.name);

  const options = {
    chart: {
      type: 'donut',
      foreColor: 'var(--color-body-text)',
    },
    labels: labels,
    colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19B7'], // Manter as cores existentes ou usar variáveis de tema
    legend: {
      position: 'bottom',
      labels: { colors: 'var(--color-body-text)' },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    }],
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      style={{ width: '100%', height: '100%' }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ReactApexChart options={options} series={series} type="donut" height="100%" />
    </motion.div>
  );
};

export default SalesByPaymentMethodChart;
