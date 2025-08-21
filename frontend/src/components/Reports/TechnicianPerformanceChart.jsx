import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { useTheme } from '../../context/ThemeContext'; // Assuming you have a ThemeContext
import { motion } from 'framer-motion';

const TechnicianPerformanceChart = ({ series, categories, title, type = 'bar', animationDelay = 0 }) => {
  const { theme } = useTheme(); // Get current theme from context

  const options = {
    chart: {
      id: 'technician-performance-chart',
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: theme === 'dark' ? '#A0AEC0' : '#4A5568', // Adjust label color based on theme
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme === 'dark' ? '#A0AEC0' : '#4A5568', // Adjust label color based on theme
        },
      },
    },
    grid: {
      borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0', // Adjust grid color based on theme
      strokeDashArray: 4,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    colors: [theme === 'dark' ? '#63B3ED' : '#4299E1'], // Adjust bar color based on theme
    tooltip: {
      theme: theme, // Tooltip theme
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '70%',
            },
          },
          xaxis: {
            labels: {
              rotate: -45,
            },
          },
        },
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className="technician-performance-chart-wrapper"
    >
      <Card>
        <CardBody>
          <CardTitle tag="h5" className="mb-4">{title}</CardTitle>
          <Chart options={options} series={series} type={type} height={350} />
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default TechnicianPerformanceChart;