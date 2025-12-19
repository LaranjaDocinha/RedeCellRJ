import React from 'react';
import Chart from 'react-apexcharts';
const TopSellingProductsChartWidget: React.FC<TopSellingProductsChartWidgetProps> = React.memo(({
  topSellingProducts,
}) => {
  const topProductsChartOptions = {
    chart: {
      id: 'top-selling-products',
      type: 'bar',
      toolbar: { show: false },
      animations: { // Enable and configure animations
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: -6,
      style: {
        fontSize: '12px',
        colors: ['#fff'],
      },
    },
    xaxis: {
      categories: topSellingProducts.map((p) => `${p.product_name} (${p.variation_color})`),
    },
    colors: ['#03DAC6'],
    tooltip: { // Configure detailed tooltips
      x: {
        show: true,
        formatter: function (val: string) {
          return `Produto: ${val}`;
        }
      },
      y: {
        formatter: function (val: number) {
          return `${val} unidades`;
        }
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
  };
  const topProductsChartSeries = [
    {
      name: 'Quantidade Vendida',
      data: topSellingProducts.map((p) => p.total_quantity_sold),
    },
  ];

  return (
    <Chart
      options={topProductsChartOptions}
      series={topProductsChartSeries}
      type="bar"
      height={350}
    />
  );
});

export default TopSellingProductsChartWidget;


