import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../../context/ThemeContext';

const DailyWeeklySalesChart = ({ data }) => {
  const { chartTheme } = useTheme();

  const series = [
    {
      name: 'Vendas',
      data: data.map(item => item.sales),
    },
  ];

  const options = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      foreColor: 'var(--color-body-text)',
    },
    theme: { mode: chartTheme },
    xaxis: {
      categories: data.map(item => item.date),
      labels: { style: { colors: 'var(--color-text-muted)' } },
    },
    yaxis: {
      labels: {
        formatter: (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      },
    },
    stroke: { curve: 'smooth', width: 2 },
    tooltip: {
      x: { format: 'dd/MM/yyyy' },
      y: {
        formatter: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: 'var(--color-body-text)' },
    },
    grid: {
      borderColor: 'var(--color-border)',
      strokeDashArray: 4,
    },
    colors: ['var(--color-primary)'],
  };

  return (
    <div className='chart-container'>
      <ReactApexChart options={options} series={series} type='line' height={300} />
    </div>
  );
};

export default DailyWeeklySalesChart;
