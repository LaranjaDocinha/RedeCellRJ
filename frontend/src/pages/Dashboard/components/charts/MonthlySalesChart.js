import React from 'react';
import ReactApexChart from 'react-apexcharts'; // Adicionar importação
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const MonthlySalesChart = ({ data }) => {
  const { chartTheme, chartColor1, chartColor2, dailyRevenueChartType, showXAxisLabels, showYAxisLabels, showChartLegend } = useTheme();

  const formattedData =
    data?.map((item) => ({
      name: item.month, // Ou item.date, dependendo da granularidade
      Vendas: item.totalSales,
      Lucro: item.totalProfit,
    })) || [];

  const options = {
    chart: {
      type: dailyRevenueChartType,
      background: 'transparent', // Set chart background to transparent
      toolbar: { show: false },
      foreColor: 'var(--color-body-text)',
    },
    theme: { mode: chartTheme },
    xaxis: {
      categories: formattedData.map((item) => item.name),
      labels: { show: showXAxisLabels, style: { colors: 'var(--color-text-muted)' } },
    },
    stroke: {
      curve: 'smooth',
    },
    colors: [chartColor1, chartColor2], // Usar variáveis de tema
    tooltip: {
      x: { format: 'dd/MM/yyyy' }, // Ajustar formato se necessário
      y: {
        formatter: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      },
    },
    legend: {
      show: showChartLegend,
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: 'var(--color-body-text)' },
    },
    grid: {
      borderColor: 'var(--color-border)',
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: 'Vendas',
      data: formattedData.map((item) => item.Vendas),
    },
    {
      name: 'Lucro',
      data: formattedData.map((item) => item.Lucro),
    },
  ];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      style={{ width: '100%', height: '100%' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <ReactApexChart height='100%' options={options} series={series} type={dailyRevenueChartType} />
    </motion.div>
  );
};

export default MonthlySalesChart;
