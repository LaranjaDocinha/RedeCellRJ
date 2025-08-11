import React from 'react';
import ReactApexChart from 'react-apexcharts'; // Adicionar importação
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const SalesByPaymentMethodChart = ({ data }) => {
  const { chartTheme, chartColor1, chartColor2, chartColor3, salesPaymentMethodChartType } = useTheme();

  const formattedData =
    data?.map((item) => ({
      name: item.method, // Nome do método de pagamento
      value: item.totalSales, // Total de vendas para o método
    })) || [];

  const series = formattedData.map((item) => item.value);
  const labels = formattedData.map((item) => item.name);

  const options = {
    chart: {
      type: salesPaymentMethodChartType,
      foreColor: 'var(--color-body-text)',
    },
    theme: { mode: chartTheme },
    labels: labels,
    colors: [chartColor1, chartColor2, chartColor3, '#FF8042', '#AF19FF', '#FF19B7'], // Usar variáveis de tema
    legend: {
      position: 'bottom',
      labels: { colors: 'var(--color-body-text)' },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      style={{ width: '100%', height: '100%' }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ReactApexChart height='100%' options={options} series={series} type={salesPaymentMethodChartType} />
    </motion.div>
  );
};

export default SalesByPaymentMethodChart;


  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      style={{ width: '100%', height: '100%' }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ReactApexChart height='100%' options={options} series={series} type='donut' />
    </motion.div>
  );
};

export default SalesByPaymentMethodChart;
