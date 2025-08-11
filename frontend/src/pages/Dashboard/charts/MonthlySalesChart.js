import React from 'react';
import ReactApexChart from 'react-apexcharts';

import { useTheme } from '../../../context/ThemeContext';
import { useDashboard } from '../../../context/DashboardContext';

const DailyRevenueChart = () => {
  const { theme, chartTheme, chartColor1, chartColor2, dailyRevenueChartType, showXAxisLabels, showYAxisLabels, showChartLegend } = useTheme();
  const { dashboardData } = useDashboard();

  const chartData = dashboardData?.widgets?.dailyRevenueAndProfit || [];

  const series = [
    {
      name: 'Faturamento',
      data: chartData.map((item) => ({ x: new Date(item.date).getTime(), y: item.revenue })),
    },
    {
      name: 'Lucro',
      data: chartData.map((item) => ({ x: new Date(item.date).getTime(), y: item.profit })),
    },
  ];

  const options = {
    chart: {
      type: dailyRevenueChartType,
      height: '100%',
      toolbar: { show: false },
      foreColor: var(--color-body-text),
    },
    theme: { mode: chartTheme },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      type: 'datetime',
      labels: { show: showXAxisLabels, format: 'dd/MM' },
    },
    yaxis: {
      labels: {
        show: showYAxisLabels,
        formatter: (value) =>
          value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
          }),
      },
    },
    tooltip: {
      x: { format: 'dd/MM/yyyy' },
      y: {
        formatter: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      },
    },
    legend: {
      show: showChartLegend,
      position: 'top',
      horizontalAlign: 'right',
    },
    colors: [chartColor1, chartColor2],
    grid: {
      borderColor: var(--color-border),
      strokeDashArray: 4,
    },
  };

  return (
    <div className='chart-container'>
      <ReactApexChart height='100%' options={options} series={series} type={dailyRevenueChartType} />
    </div>
  );
};

export default DailyRevenueChart;


  return (
    <div className='chart-container'>
      <ReactApexChart height='100%' options={options} series={series} type='area' />
    </div>
  );
};

export default DailyRevenueChart;
