import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { useTheme } from '../../context/ThemeContext'; // Assuming you have a ThemeContext
import { motion } from 'framer-motion';

const ABCChart = ({ data, title, animationDelay = 0 }) => {
  const { theme } = useTheme(); // Get current theme from context

  const categories = data.map(item => item.product_name);
  const seriesData = data.map(item => parseFloat(item.total_revenue));
  const cumulativePercentageData = data.map(item => parseFloat(item.cumulative_percentage));

  const options = {
    chart: {
      id: 'abc-chart',
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: theme === 'dark' ? '#A0AEC0' : '#4A5568',
        },
      },
      tickPlacement: 'on',
    },
    yaxis: [
      {
        title: {
          text: 'Faturamento (R$)',
          style: {
            color: theme === 'dark' ? '#A0AEC0' : '#4A5568',
          },
        },
        labels: {
          formatter: function (val) {
            return `R$ ${val.toFixed(2)}`;
          },
          style: {
            colors: theme === 'dark' ? '#A0AEC0' : '#4A5568',
          },
        },
      },
      {
        opposite: true,
        title: {
          text: 'Percentual Acumulado (%)',
          style: {
            color: theme === 'dark' ? '#A0AEC0' : '#4A5568',
          },
        },
        labels: {
          formatter: function (val) {
            return `${val.toFixed(2)}%`;
          },
          style: {
            colors: theme === 'dark' ? '#A0AEC0' : '#4A5568',
          },
        },
        min: 0,
        max: 100,
      },
    ],
    grid: {
      borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0',
      strokeDashArray: 4,
    },
    plotOptions: {
      bar: {
        columnWidth: '70%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [0, 4],
      curve: 'smooth',
    },
    colors: [theme === 'dark' ? '#63B3ED' : '#4299E1', theme === 'dark' ? '#F6AD55' : '#ED8936'], // Bar and Line colors
    tooltip: {
      theme: theme,
      y: [
        {
          formatter: function (val) {
            return `R$ ${val.toFixed(2)}`;
          },
        },
        {
          formatter: function (val) {
            return `${val.toFixed(2)}%`;
          },
        },
      ],
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          xaxis: {
            labels: {
              rotate: -45,
            },
          },
        },
      },
    ],
  };

  const series = [
    {
      name: 'Faturamento',
      type: 'column',
      data: seriesData,
    },
    {
      name: 'Percentual Acumulado',
      type: 'line',
      data: cumulativePercentageData,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className="abc-chart-wrapper"
    >
      <Card>
        <CardBody>
          <CardTitle tag="h5" className="mb-4">{title}</CardTitle>
          <Chart options={options} series={series} type="line" height={350} />
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ABCChart;