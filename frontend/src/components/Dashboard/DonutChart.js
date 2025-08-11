import React from 'react';
import ReactApexChart from 'react-apexcharts';
import WidgetContainer from './WidgetContainer';

const DonutChart = ({ data, title }) => {
  const series = data.map(item => item.value);
  const labels = data.map(item => item.name);

  const options = {
    chart: {
      type: 'donut',
    },
    labels: labels,
    colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'], // Manter as cores existentes ou usar variáveis de tema
    legend: {
      position: 'bottom',
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
    <WidgetContainer title={title} style={{ height: '100%' }}>
      <ReactApexChart options={options} series={series} type="donut" height="100%" />
    </WidgetContainer>
  );
};

export default DonutChart;
