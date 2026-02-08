import React from 'react';
import Chart from 'react-apexcharts';
import { Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';

interface HourlyData {
  hour: number;
  day_of_week: number;
  sales_count: string;
  total_revenue: string;
}

interface SalesHeatmapWidgetProps {
  data?: HourlyData[];
  isLoading?: boolean;
}

const SalesHeatmapWidget: React.FC<SalesHeatmapWidgetProps> = ({ data, isLoading }) => {
  const theme = useTheme();

  if (isLoading) return <DashboardWidgetSkeleton />;

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const series = days.map((day, dIdx) => ({
    name: day,
    data: hours.map(h => {
      const match = data?.find(d => Number(d.day_of_week) === dIdx && Number(d.hour) === h);
      return {
        x: `${h}h`,
        y: match ? Number(match.sales_count) : 0
      };
    })
  }));

  const options: any = {
    chart: {
      type: 'heatmap',
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    colors: [theme.palette.primary.main],
    title: {
      text: 'Densidade de Vendas (Dia x Hora)',
      align: 'left',
      style: { fontWeight: 400, color: theme.palette.text.secondary }
    },
    xaxis: {
      type: 'category',
      labels: {
          rotate: -45,
          style: { fontSize: '10px' }
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            { from: 0, to: 0, name: 'Sem vendas', color: alpha(theme.palette.divider, 0.1) },
            { from: 1, to: 5, name: 'Baixo', color: alpha(theme.palette.primary.main, 0.3) },
            { from: 6, to: 15, name: 'Médio', color: alpha(theme.palette.primary.main, 0.6) },
            { from: 16, to: 1000, name: 'Alto', color: theme.palette.primary.main }
          ]
        }
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Chart options={options} series={series} type="heatmap" height={350} />
    </motion.div>
  );
};

export default SalesHeatmapWidget;