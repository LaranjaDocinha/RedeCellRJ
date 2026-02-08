import React from 'react';
import Chart from 'react-apexcharts';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';

interface ABCItem {
  name: string;
  total_revenue: number;
  category: 'A' | 'B' | 'C';
}

interface StockABCWidgetProps {
  data?: ABCItem[];
  isLoading?: boolean;
}

const StockABCWidget: React.FC<StockABCWidgetProps> = ({ data, isLoading }) => {
  const theme = useTheme();

  if (isLoading) return <DashboardWidgetSkeleton />;

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', opacity: 0.5 }}>
        <Typography>Sem dados para Curva ABC</Typography>
      </Box>
    );
  }

  const series = [
    {
      data: data.map(item => ({
        x: item.name,
        y: Number(item.total_revenue),
        fillColor: item.category === 'A' ? theme.palette.success.main : 
                   item.category === 'B' ? theme.palette.warning.main : 
                   theme.palette.error.main
      }))
    }
  ];

  const options: any = {
    legend: { show: false },
    chart: {
      type: 'treemap',
      toolbar: { show: false }
    },
    title: {
      text: 'Análise de Estoque (Curva ABC)',
      align: 'left',
      style: { fontWeight: 400, color: theme.palette.text.secondary }
    },
    colors: [
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ],
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false
      }
    },
    tooltip: {
        y: {
            formatter: (val: number) => `R$ ${val.toLocaleString()}`
        }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Chart options={options} series={series} type="treemap" height={300} />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
          <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: 'success.main' }} />
              <Typography variant="caption">Classe A (70% Receita)</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: 'warning.main' }} />
              <Typography variant="caption">Classe B (20%)</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: 'error.main' }} />
              <Typography variant="caption">Classe C (10%)</Typography>
          </Box>
      </Box>
    </motion.div>
  );
};

export default StockABCWidget;
