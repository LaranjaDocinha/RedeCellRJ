import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../../context/ThemeContext';

const TopProductsChart = ({ data }) => {
  const { chartTheme, chartColor1, topProductsChartType } = useTheme();

  const series = [
    {
      name: 'Vendas',
      data: data.map(item => item.sales),
    },
  ];

  const options = {
    chart: {
      type: topProductsChartType === 'column' ? 'bar' : topProductsChartType, // ApexCharts uses 'bar' for column charts
      height: 300,
      toolbar: { show: false },
      foreColor: 'var(--color-body-text)',
    },
    theme: { mode: chartTheme },
    plotOptions: {
      bar: {
        horizontal: topProductsChartType === 'bar',
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map(item => item.productName),
      labels: { style: { colors: 'var(--color-text-muted)' } },
    },
    yaxis: {
      labels: {
        formatter: (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: '' }),
      },
    },
    grid: {
      borderColor: 'var(--color-border)',
      strokeDashArray: 4,
    },
    colors: [chartColor1],
  };

  return (
    <div className='chart-container'>
      <ReactApexChart options={options} series={series} type={topProductsChartType === 'column' ? 'bar' : topProductsChartType} height={300} />
    </div>
  );
};

export default TopProductsChart;


  return (
    <div className='chart-container'>
      <ReactApexChart options={options} series={series} type='bar' height={300} />
    </div>
  );
};

export default TopProductsChart;
