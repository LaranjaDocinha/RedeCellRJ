import React from 'react';
import { Paper, Typography, Box, useTheme, alpha } from '@mui/material';
import Chart from 'react-apexcharts';
import { motion } from 'framer-motion';

interface SalesGoalsWidgetProps {
  data: any;
}

const SalesGoalsWidget: React.FC<SalesGoalsWidgetProps> = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const goal = data?.salesGoals?.targetAmount || 0;
  const current = data?.salesGoals?.currentSalesAmount || 0;
  const progress = Math.round(data?.salesGoals?.progressPercentageAmount || 0);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { height: 250, type: 'radialBar' as const, sparkline: { enabled: true }, background: 'transparent' },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '70%' },
        track: { background: isDarkMode ? alpha(theme.palette.common.white, 0.05) : theme.palette.divider, strokeWidth: '97%' },
        dataLabels: {
          name: { show: true, color: theme.palette.text.secondary, fontSize: '12px', offsetY: 20 },
          value: { offsetY: -15, fontSize: '30px', fontWeight: 400, color: theme.palette.text.primary, formatter: (val: number) => `${val}%` }
        }
      }
    },
    fill: { 
      type: 'gradient', 
      gradient: { 
        shade: isDarkMode ? 'dark' : 'light', 
        type: 'horizontal', 
        gradientToColors: [theme.palette.success.main], 
        stops: [0, 100] 
      } 
    },
    stroke: { lineCap: 'round' as const },
    labels: ['DA META ATINGIDA'],
    theme: { mode: isDarkMode ? 'dark' : 'light' }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', width: '100%' }}>
      <Paper sx={{ 
        p: 3, borderRadius: '24px', height: '100%', minHeight: '400px',
        boxShadow: isDarkMode ? 'none' : '0 10px 40px rgba(0,0,0,0.04)', 
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box',
        bgcolor: 'background.paper',
        backgroundImage: 'none'
      }}>
        <Typography variant="overline" sx={{ fontWeight: 400, color: 'text.secondary', width: '100%', letterSpacing: 1 }}>
          Meta Mensal
        </Typography>
        <Box sx={{ mt: 'auto', mb: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Chart options={chartOptions} series={[Math.min(progress, 100)]} type="radialBar" height={280} />
        </Box>
        <Box sx={{ textAlign: 'center', mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(current)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal)}
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default SalesGoalsWidget;