import React from 'react';
import Chart from 'react-apexcharts';
const SalesByMonthChartWidget: React.FC<SalesByMonthChartWidgetProps> = React.memo(({ salesByMonth }) => {
  const salesChartOptions = {
    chart: {
      id: 'sales-by-month',
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
    xaxis: {
      categories: salesByMonth.map((s) => s.month),
    },
    colors: ['#6200EE'],
    tooltip: { // Configure detailed tooltips
      y: {
        formatter: function (val: number) {
          return "R$ " + val.toFixed(2);
        }
      },
      x: {
        formatter: function (val: string) {
          return `Mês: ${val}`;
        }
      }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    },
  };
  const salesChartSeries = [
    {
      name: 'Vendas no Mês',
      data: salesByMonth.map((s) => s.monthly_sales),
    },
  ];

  return (
    <Chart options={salesChartOptions} series={salesChartSeries} type="area" height={350} />
  );
});

export default SalesByMonthChartWidget;
