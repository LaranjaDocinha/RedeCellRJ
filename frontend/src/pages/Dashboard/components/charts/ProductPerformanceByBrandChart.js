import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../../context/ThemeContext';

const ProductPerformanceByBrandChart = ({ data }) => {
  const { chartTheme, chartColor1, topProductsChartType, showXAxisLabels, showYAxisLabels, showChartLegend } = useTheme();

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
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: data.map(item => item.brand),
      labels: { show: showXAxisLabels, style: { colors: 'var(--color-text-muted)' } },
    },
    yaxis: {
      labels: {
        show: showYAxisLabels,
        formatter: (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      },
    },
    legend: {
      show: showChartLegend,
      labels: { colors: 'var(--color-body-text)' },
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

export default ProductPerformanceByBrandChart;
