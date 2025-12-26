import React from 'react';
import Chart from 'react-apexcharts';
import { Paper, Typography, Box, Skeleton, useTheme, alpha } from '@mui/material';

interface SalesByMonthChartWidgetProps {
  data: any;
  loading?: boolean;
}

const SalesByMonthChartWidget: React.FC<SalesByMonthChartWidgetProps> = ({ data, loading = false }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const currentPeriod = data?.salesByMonth?.mainPeriodSalesByMonth || [];
  const previousPeriod = data?.salesByMonth?.comparisonPeriodSalesByMonth || [];

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: '24px', height: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', bgcolor: 'background.paper', backgroundImage: 'none' }}>
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="rectangular" height={280} sx={{ mt: 4, borderRadius: '16px' }} />
      </Paper>
    );
  }

  const series = [
    { name: 'Atual', data: currentPeriod.map((s: any) => s.monthly_sales) },
    { name: 'Anterior', data: previousPeriod.map((s: any) => s.monthly_sales) }
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { id: 'sales-comp', toolbar: { show: false }, background: 'transparent' },
    stroke: { curve: 'smooth' as const, width: [4, 2], dashArray: [0, 5] },
    colors: [theme.palette.primary.main, theme.palette.text.disabled],
    xaxis: { 
      categories: currentPeriod.map((s: any) => s.month),
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    yaxis: { show: false },
    grid: { show: false },
    dataLabels: { enabled: false },
    legend: { 
      position: 'top' as const, 
      horizontalAlign: 'right' as const,
      labels: { colors: theme.palette.text.primary }
    },
    theme: { mode: isDarkMode ? 'dark' : 'light' }
  };

  return (
    <Paper sx={{ 
      p: 3, borderRadius: '24px', height: '100%',
      boxShadow: isDarkMode ? 'none' : '0 10px 40px rgba(0,0,0,0.04)', 
      border: `1px solid ${theme.palette.divider}`,
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      bgcolor: 'background.paper',
      backgroundImage: 'none'
    }}>
      <Typography variant="overline" sx={{ fontWeight: 400, color: 'text.secondary', letterSpacing: 1 }}>Comparativo de Vendas</Typography>
      <Box sx={{ mt: 'auto', width: '100%', minHeight: 0 }}>
        <Chart options={chartOptions} series={series} type="area" height={280} width="100%" />
      </Box>
    </Paper>
  );
};

export default SalesByMonthChartWidget;