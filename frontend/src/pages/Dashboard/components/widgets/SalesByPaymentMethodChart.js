import React from 'react';
import ReactApexChart from 'react-apexcharts';

import { useTheme } from '../../../../context/ThemeContext';
import { useDashboard } from '../../../../context/DashboardContext';
import './Charts.scss';

const SalesByPaymentMethodChart = () => {
  const { theme } = useTheme();
  const { dashboardData } = useDashboard();

  const paymentData = dashboardData?.widgets?.paymentMethods || [];

  const series = paymentData.map((item) => item.total);
  const labels = paymentData.map((item) =>
    item.total > 0 ? item.payment_method : `${item.payment_method} (R$ 0)`,
  );

  const options = {
    chart: {
      type: 'donut',
      foreColor: var(--color-body-text),
    },
    labels: labels,
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return `${opts.w.globals.labels[opts.seriesIndex]}: ${val.toFixed(1)}%`;
      },
    },
    legend: {
      show: false,
    },
    colors: ['var(--color-success)', 'var(--color-primary)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-danger)', 'var(--color-secondary)'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <div className='chart-container'>
      <ReactApexChart height='100%' options={options} series={series} type='donut' />
    </div>
  );
};

export default SalesByPaymentMethodChart;
