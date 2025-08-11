import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import Chart from 'react-apexcharts';
import { useTheme } from '../../../../context/ThemeContext';

const SalesChart = ({ data, loading }) => {
  const { chartTheme, showXAxisLabels, showYAxisLabels, showChartLegend } = useTheme();

  const options = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: true },
    },
    theme: { mode: chartTheme },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      type: 'datetime',
      categories: (data || []).map((d) => d.date),
      labels: { show: showXAxisLabels },
    },
    yaxis: {
      title: { text: 'Receita (R$)' },
      labels: { show: showYAxisLabels },
    },
    tooltip: {
      x: { format: 'dd/MM/yyyy' },
      y: {
        formatter: (val) => `R$ ${val.toFixed(2)}`,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
    legend: { show: showChartLegend },
  };

  const series = [
    {
      name: 'Receita',
      data: (data || []).map((d) => d.total_revenue),
    },
  ];

  return (
    <Card>
      <CardBody>
        <CardTitle className='h5 mb-4'>Vendas ao Longo do Tempo</CardTitle>
        {loading ? (
          <Skeleton height={350} />
        ) : (
          <Chart height={350} options={options} series={series} type='area' />
        )}
      </CardBody>
    </Card>
  );
};

export default SalesChart;
