import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import Chart from 'react-apexcharts';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import { FaGripVertical } from 'react-icons/fa';
import { DragHandle } from '../../styles/POSStyles'; // Assuming DragHandle is exported from here

interface ShiftReportData {
  totalSalesAmount: number;
  totalTransactions: number;
  salesByPaymentMethod: Array<{ method: string; amount: number }>;
  salesByCategory: Array<{ category: string; amount: number }>;
  averageTransactionValue: number;
}

interface ShiftDashboardProps {
  listeners?: any; // For drag and drop
}

const ShiftDashboard: React.FC<ShiftDashboardProps> = ({ listeners }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [reportData, setReportData] = useState<ShiftReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShiftReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ShiftReportData>('/api/shift-reports/current');
        setReportData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
        addNotification(t('failed_to_fetch_shift_report', { message: err.response?.data?.message || err.message }), 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchShiftReport();
    const interval = setInterval(fetchShiftReport, 60000); // Refresh every minute
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
        <Typography variant="h6">{t('error_loading_report')}</Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!reportData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">{t('no_report_data')}</Typography>
      </Box>
    );
  }

  // ApexCharts data preparation
  const salesByPaymentMethodSeries = reportData.salesByPaymentMethod.map(item => item.amount);
  const salesByPaymentMethodLabels = reportData.salesByPaymentMethod.map(item => t(item.method));

  const salesByCategorySeries = reportData.salesByCategory.map(item => item.amount);
  const salesByCategoryLabels = reportData.salesByCategory.map(item => item.category);

  const pieChartOptions = {
    chart: {
      type: 'donut',
    },
    labels: salesByPaymentMethodLabels,
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const barChartOptions = {
    chart: {
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: salesByCategoryLabels,
    },
    yaxis: {
      title: {
        text: `R$ (${t('amount')})`
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return "R$ " + val.toFixed(2)
        }
      }
    }
  };

  const barChartSeries = [{
    name: t('sales'),
    data: salesByCategorySeries
  }];

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{t('shift_dashboard_title')}</Typography>
        {listeners && <DragHandle {...listeners}><FaGripVertical /></DragHandle>}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" color="primary">R$ {reportData.totalSalesAmount.toFixed(2)}</Typography>
          <Typography variant="subtitle2">{t('total_sales_amount')}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" color="secondary">{reportData.totalTransactions}</Typography>
          <Typography variant="subtitle2">{t('total_transactions')}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" color="info">R$ {reportData.averageTransactionValue.toFixed(2)}</Typography>
          <Typography variant="subtitle2">{t('average_transaction_value')}</Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" gutterBottom>{t('sales_by_payment_method')}</Typography>
          {salesByPaymentMethodSeries.length > 0 ? (
            <Chart options={pieChartOptions} series={salesByPaymentMethodSeries} type="donut" height={250} />
          ) : (
            <Typography variant="body2">{t('no_sales_data_for_payment_method')}</Typography>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" gutterBottom>{t('sales_by_category')}</Typography>
          {salesByCategorySeries.length > 0 ? (
            <Chart options={barChartOptions} series={barChartSeries} type="bar" height={250} />
          ) : (
            <Typography variant="body2">{t('no_sales_data_for_category')}</Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ShiftDashboard;
