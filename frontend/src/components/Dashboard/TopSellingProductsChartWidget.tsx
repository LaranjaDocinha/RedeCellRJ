
import React from 'react';
import Chart from 'react-apexcharts';
import DashboardWidget from './DashboardWidget';

interface TopSellingProductsChartWidgetProps {
  topSellingProducts: Array<{ product_name: string; variation_color: string; total_quantity_sold: number }>;
}

const TopSellingProductsChartWidget: React.FC<TopSellingProductsChartWidgetProps> = ({ topSellingProducts }) => {
  const topProductsChartOptions = {
    chart: {
      id: 'top-selling-products',
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    xaxis: {
      categories: topSellingProducts.map(p => `${p.product_name} (${p.variation_color})`),
    },
    colors: ['#03DAC6'],
  };
  const topProductsChartSeries = [
    {
      name: 'Quantity Sold',
      data: topSellingProducts.map(p => p.total_quantity_sold),
    },
  ];

  return (
    <DashboardWidget title="Top Selling Products">
      <Chart options={topProductsChartOptions} series={topProductsChartSeries} type="bar" height={350} />
    </DashboardWidget>
  );
};

export default TopSellingProductsChartWidget;
