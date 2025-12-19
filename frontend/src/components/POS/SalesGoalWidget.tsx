import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import Chart from 'react-apexcharts';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import { FaGripVertical } from 'react-icons/fa';
import { DragHandle } from '../../styles/POSStyles'; // Assuming DragHandle is exported from here

interface SalesGoalData {
  targetAmount: number;
  currentSalesAmount: number;
  progressPercentage: number;
  remainingAmount: number;
}

interface SalesGoalWidgetProps {
  listeners?: any; // For drag and drop
}

const SalesGoalWidget: React.FC<SalesGoalWidgetProps> = ({ listeners }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [goalData, setGoalData] = useState<SalesGoalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesGoal = async () => {
      try {
        setLoading(true);
        const response = await axios.get<SalesGoalData>('/api/sales-goals/current-daily');
        setGoalData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
        addNotification(t('failed_to_fetch_sales_goal', { message: err.response?.data?.message || err.message }), 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesGoal();
    const interval = setInterval(fetchSalesGoal, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [addNotification, t]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography variant="h6">{t('error_loading_sales_goal')}</Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!goalData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">{t('no_sales_goal_data')}</Typography>
      </Box>
    );
  }

  const gaugeChartOptions = {
    chart: {
      type: 'radialBar',
      offsetY: -20,
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: '97%',
          margin: 5, // margin is in pixels
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            color: '#999',
            opacity: 1,
            blur: 2
          }
        },
        dataLabels: {
          name: {
            show: false
          },
          value: {
            offsetY: -2,
            fontSize: '22px'
          }
        }
      }
    },
    grid: {
      padding: {
        top: -10
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91]
      },
    },
    labels: [t('progress')],
  };

  const gaugeChartSeries = [goalData.progressPercentage];

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
        <Typography variant="h6">{t('daily_sales_goal')}</Typography>
        {listeners && <DragHandle {...listeners}><FaGripVertical /></DragHandle>}
      </Box>

      <Box sx={{ width: '100%', maxWidth: 300, mb: 2 }}>
        <Chart options={gaugeChartOptions} series={gaugeChartSeries} type="radialBar" height={250} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', mt: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="primary">R$ {goalData.currentSalesAmount.toFixed(2)}</Typography>
          <Typography variant="subtitle2">{t('current_sales')}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="secondary">R$ {goalData.targetAmount.toFixed(2)}</Typography>
          <Typography variant="subtitle2">{t('target_sales')}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="info">R$ {goalData.remainingAmount.toFixed(2)}</Typography>
          <Typography variant="subtitle2">{t('remaining_to_target')}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SalesGoalWidget;
