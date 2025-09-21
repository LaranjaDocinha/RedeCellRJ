
import React from 'react';
import Chart from 'react-apexcharts';
import DashboardWidget from './DashboardWidget';

interface SalesByMonthChartWidgetProps {
  salesByMonth: Array<{ month: string; monthly_sales: number }>;
}

const SalesByMonthChartWidget: React.FC<SalesByMonthChartWidgetProps> = ({ salesByMonth }) => {
  const salesChartOptions = {
    chart: {
      id: 'sales-by-month',
      toolbar: { show: false },
    },
    xaxis: {
      categories: salesByMonth.map(s => s.month),
    },
    colors: ['#6200EE'],
  };
  const salesChartSeries = [
    {
      name: 'Monthly Sales',
      data: salesByMonth.map(s => s.monthly_sales),
    },
  ];

  return (
    <DashboardWidget title="Sales by Month">
      <Chart options={salesChartOptions} series={salesChartSeries} type="area" height={350} />
    </DashboardWidget>
  );
};

export default SalesByMonthChartWidget;
