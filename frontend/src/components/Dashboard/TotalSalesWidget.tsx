import React from 'react';
import { Box, Typography, Paper, useTheme, Skeleton, alpha } from '@mui/material';
import { TrendingUp, TrendingDown, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';

interface TotalSalesWidgetProps {
  data: any;
  loading?: boolean;
}

const TotalSalesWidget: React.FC<TotalSalesWidgetProps> = ({ data, loading = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const sales = data?.totalSales?.mainPeriodSales || 0;
  const comparison = data?.totalSales?.comparisonPeriodSales || 0;
  const trendData = data?.salesByMonth?.mainPeriodSalesByMonth?.map((s: any) => s.monthly_sales) || [];
  
  const percentageChange = comparison > 0 ? ((sales - comparison) / comparison) * 100 : 0;
  const isPositive = percentageChange >= 0;

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: '24px', height: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', backgroundImage: 'none' }}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="70%" height={60} />
        <Box sx={{ mt: 'auto' }}><Skeleton variant="rectangular" height={80} sx={{ borderRadius: '16px' }} /></Box>
      </Paper>
    );
  }

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { 
      sparkline: { enabled: true },
      background: 'transparent'
    },
    stroke: { curve: 'smooth', width: 3 },
    colors: [theme.palette.primary.main],
    tooltip: { enabled: false },
    theme: { mode: isDarkMode ? 'dark' : 'light' }
  };

  return (
    <Paper 
      onClick={() => navigate('/pos/sales-history')}
      sx={{ 
        p: 3, borderRadius: '24px', height: '100%',
        bgcolor: 'background.paper', 
        boxShadow: isDarkMode ? 'none' : '0 10px 40px rgba(0,0,0,0.04)', 
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex', flexDirection: 'column', cursor: 'pointer',
        boxSizing: 'border-box',
        backgroundImage: 'none'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="overline" sx={{ fontWeight: 400, color: 'text.secondary' }}>Faturamento</Typography>
        <ArrowForward sx={{ color: 'primary.main', opacity: 0.5, fontSize: 20 }} />
      </Box>
      
      <Box sx={{ mt: 1 }}>
        <Typography variant="h3" sx={{ fontWeight: 400, color: 'text.primary', letterSpacing: '-1px' }}>
          R$ {sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.1), px: 1, py: 0.5, borderRadius: '8px', color: isPositive ? 'success.main' : 'error.main' }}>
            {isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            <Typography variant="caption" sx={{ fontWeight: 400, ml: 0.5 }}>{Math.abs(percentageChange).toFixed(1)}%</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '16px', border: '1px dashed', borderColor: alpha(theme.palette.primary.main, 0.3) }}>
        <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 400 }}>Margem Estimada: 30%</Typography>
      </Box>

      <Box sx={{ mt: 'auto', pt: 2, width: '100%' }}>
        <Chart options={chartOptions} series={[{ data: trendData.length > 0 ? trendData : [0,0,0,0] }]} type="line" height={60} />
      </Box>
    </Paper>
  );
};

export default TotalSalesWidget;