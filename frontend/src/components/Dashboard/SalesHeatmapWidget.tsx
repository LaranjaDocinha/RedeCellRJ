import React from 'react';
import Chart from 'react-apexcharts';
import { Paper, Typography, Box, useTheme, Skeleton, alpha } from '@mui/material';

interface SalesHeatmapWidgetProps {
  data: any;
  loading?: boolean;
}

const SalesHeatmapWidget: React.FC<SalesHeatmapWidgetProps> = ({ data, loading = false }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const heatmapData = Array.isArray(data?.salesHeatmap) ? data.salesHeatmap : [];
  
  const FIXED_HEIGHT = '400px';

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: '24px', height: FIXED_HEIGHT, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', boxSizing: 'border-box', bgcolor: 'background.paper', backgroundImage: 'none' }}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={280} sx={{ mt: 4, borderRadius: '16px' }} />
      </Paper>
    );
  }

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const series = days.map((day, idx) => ({
    name: day,
    data: Array.from({ length: 24 }, (_, hour) => {
      const found = heatmapData.find((d: any) => d.day_of_week === idx && d.hour === hour);
      return { x: `${hour}h`, y: found ? Number(found.count) : 0 };
    })
  }));

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { 
      toolbar: { show: false }, 
      background: 'transparent'
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: [theme.palette.background.paper] },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    xaxis: {
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: isDarkMode ? alpha(theme.palette.common.white, 0.05) : '#f0f0f0', name: 'Nenhuma' },
            { from: 1, to: 5, color: alpha(theme.palette.primary.main, 0.3), name: 'Baixa' },
            { from: 6, to: 15, color: alpha(theme.palette.primary.main, 0.6), name: 'Média' },
            { from: 16, to: 100, color: theme.palette.primary.main, name: 'Alta' }
          ]
        }
      }
    }
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
      <Typography variant="overline" sx={{ fontWeight: 400, color: 'text.secondary', letterSpacing: 1 }}>Horários de Pico</Typography>
      <Box sx={{ mt: 'auto', flexGrow: 1, minHeight: 0 }}>
        <Chart options={chartOptions} series={series} type="heatmap" height="100%" width="100%" />
      </Box>
    </Paper>
  );
};

export default SalesHeatmapWidget;