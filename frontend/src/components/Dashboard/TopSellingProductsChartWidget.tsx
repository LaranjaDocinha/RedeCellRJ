import React from 'react';
import Chart from 'react-apexcharts';
import { Paper, Typography, Box } from '@mui/material';

interface TopSellingProductsChartWidgetProps {
  data: {
    topSellingProducts: {
      mainPeriodTopSellingProducts: Array<{ product_name: string; variation_color: string; total_quantity_sold: number }>;
    }
  };
}

const TopSellingProductsChartWidget: React.FC<TopSellingProductsChartWidgetProps> = ({ data }) => {
  const topSellingProducts = data?.topSellingProducts?.mainPeriodTopSellingProducts || [];

  const topProductsChartOptions = {
    chart: {
      id: 'top-selling-products',
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout' as const, speed: 800 }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: { position: 'top' }
      }
    },
    xaxis: {
      categories: topSellingProducts.map((p) => `${p.product_name} (${p.variation_color})`),
    },
    colors: ['#03DAC6'],
    tooltip: {
      y: {
        formatter: (val: number) => `${val} unidades`
      }
    }
  };

  const topProductsChartSeries = [
    {
      name: 'Quantidade Vendida',
      data: topSellingProducts.map((p) => p.total_quantity_sold),
    },
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: '16px', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Top 5 Produtos Vendidos
      </Typography>
      <Box sx={{ mt: 2 }}>
        {topSellingProducts.length > 0 ? (
          <Chart options={topProductsChartOptions} series={topProductsChartSeries} type="bar" height={300} />
        ) : (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.disabled">Sem dados no período</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TopSellingProductsChartWidget;