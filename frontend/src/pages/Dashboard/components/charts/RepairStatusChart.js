import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../../../context/ThemeContext';

const RepairStatusChart = ({ data }) => {
  const { chartTheme, chartColor1, chartColor2, chartColor3, repairStatusChartType, showChartLegend } = useTheme();

  const series = data.map(item => item.value);
  const labels = data.map(item => item.name);

  const options = {
    chart: {
      type: repairStatusChartType,
      foreColor: 'var(--color-body-text)',
    },
    labels: labels,
    colors: [chartColor1, chartColor2, chartColor3, '#FF8042', '#AF19FF'], // Usar variáveis de tema
    legend: {
      show: showChartLegend,
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
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
  };

  return (
    <div className='chart-container'>
      <ReactApexChart options={options} series={series} type={repairStatusChartType} height={300} />
    </div>
  );
};

export default RepairStatusChart;
