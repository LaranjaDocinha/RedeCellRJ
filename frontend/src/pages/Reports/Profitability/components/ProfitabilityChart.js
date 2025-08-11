import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import Chart from 'react-apexcharts';
import { useTheme } from '../../../../context/ThemeContext';

const ProfitabilityChart = ({ data, loading }) => {
  const { chartTheme, showXAxisLabels, showYAxisLabels, showChartLegend } = useTheme();

  const options = {
    chart: {
      toolbar: { show: false },
      stacked: false,
    },
    theme: { mode: chartTheme },
    dataLabels: { enabled: false },
    stroke: {
      width: [3, 3],
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      categories: (data || []).map((d) => d.date),
      labels: { show: showXAxisLabels },
    },
    yaxis: [
      {
        seriesName: 'Receita',
        axisTicks: { show: true },
        axisBorder: { show: true, color: '#008FFB' },
        labels: {
          show: showYAxisLabels,
          style: { colors: '#008FFB' },
          formatter: (val) => `R$ ${val ? val.toFixed(0) : 0}`,
        },
        title: { text: 'Receita (R$)', style: { color: '#008FFB' } },
      },
      {
        seriesName: 'Custo',
        opposite: true,
        axisTicks: { show: true },
        axisBorder: { show: true, color: '#FF4560' },
        labels: {
          show: showYAxisLabels,
          style: { colors: '#FF4560' },
          formatter: (val) => `R$ ${val ? val.toFixed(0) : 0}`,
        },
        title: { text: 'Custo (R$)', style: { color: '#FF4560' } },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `R$ ${val ? val.toFixed(2) : 0}`,
      },
    },
    legend: { show: showChartLegend, horizontalAlign: 'left', offsetX: 40 },
  };

  const series = [
    { name: 'Receita', type: 'line', data: (data || []).map((d) => d.total_revenue) },
    { name: 'Custo', type: 'line', data: (data || []).map((d) => d.total_cost) },
  ];

  return (
    <Card>
      <CardBody>
        <CardTitle className='h5 mb-4'>Receita vs. Custo</CardTitle>
        {loading ? (
          <Skeleton height={350} />
        ) : (
          <Chart height={350} options={options} series={series} type='line' />
        )}
      </CardBody>
    </Card>
  );
};

export default ProfitabilityChart;
