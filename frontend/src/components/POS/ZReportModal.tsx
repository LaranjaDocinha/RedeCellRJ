import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Grid,
  TextField, // Import TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import moment from 'moment';

interface ZReportData {
  startDate: string;
  endDate: string;
  totalSalesAmount: number;
  totalTransactions: number;
  totalDiscounts: number;
  totalReturns: number;
  cashIn: number;
  cashOut: number;
  netCash: number;
  salesByPaymentMethod: Array<{ method: string; amount: number }>;
  salesByCategory: Array<{ category: string; amount: number }>;
}

interface ZReportModalProps {
  open: boolean;
  onClose: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: '70%', lg: '50%' },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const ZReportModal: React.FC<ZReportModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [reportData, setReportData] = useState<ZReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const fetchZReport = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const startOfDay = moment(date).startOf('day').toISOString();
      const endOfDay = moment(date).endOf('day').toISOString();

      const response = await axios.get<ZReportData>('/api/reports/z-report', {
        params: {
          startDate: startOfDay,
          endDate: endOfDay,
        },
      });
      setReportData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      addNotification(t('failed_to_fetch_z_report', { message: err.response?.data?.message || err.message }), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && selectedDate) {
      fetchZReport(selectedDate);
    }
  }, [open, selectedDate]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handlePrint = () => {
    // Implement print functionality here
    window.print();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="z-report-modal-title"
      aria-describedby="z-report-modal-description"
    >
      <Box sx={style}>
        <Typography id="z-report-modal-title" variant="h5" component="h2" gutterBottom>
          {t('z_report_title')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={t('select_date')}
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
          />
        </LocalizationProvider>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {t('error_loading_report')}: {error}
          </Typography>
        )}

        {reportData && !loading && (
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>{t('summary')}</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}><Typography>{t('report_period')}:</Typography></Grid>
              <Grid item xs={6}><Typography>{moment(reportData.startDate).format('DD/MM/YYYY HH:mm')} - {moment(reportData.endDate).format('DD/MM/YYYY HH:mm')}</Typography></Grid>

              <Grid item xs={6}><Typography>{t('total_sales_amount')}:</Typography></Grid>
              <Grid item xs={6}><Typography>R$ {reportData.totalSalesAmount.toFixed(2)}</Typography></Grid>

              <Grid item xs={6}><Typography>{t('total_transactions')}:</Typography></Grid>
              <Grid item xs={6}><Typography>{reportData.totalTransactions}</Typography></Grid>

              <Grid item xs={6}><Typography>{t('total_discounts')}:</Typography></Grid>
              <Grid item xs={6}><Typography>R$ {reportData.totalDiscounts.toFixed(2)}</Typography></Grid>

              <Grid item xs={6}><Typography>{t('total_returns')}:</Typography></Grid>
              <Grid item xs={6}><Typography>R$ {reportData.totalReturns.toFixed(2)}</Typography></Grid>

              <Grid item xs={6}><Typography>{t('cash_in')}:</Typography></Grid>
              <Grid item xs={6}><Typography>R$ {reportData.cashIn.toFixed(2)}</Typography></Grid>

              <Grid item xs={6}><Typography>{t('cash_out')}:</Typography></Grid>
              <Grid item xs={6}><Typography>R$ {reportData.cashOut.toFixed(2)}</Typography></Grid>

              <Grid item xs={6}><Typography variant="h6">{t('net_cash')}:</Typography></Grid>
              <Grid item xs={6}><Typography variant="h6">R$ {reportData.netCash.toFixed(2)}</Typography></Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>{t('sales_by_payment_method')}</Typography>
            {reportData.salesByPaymentMethod.length > 0 ? (
              reportData.salesByPaymentMethod.map((item, index) => (
                <Grid container spacing={1} key={index}>
                  <Grid item xs={6}><Typography>{t(item.method)}:</Typography></Grid>
                  <Grid item xs={6}><Typography>R$ {item.amount.toFixed(2)}</Typography></Grid>
                </Grid>
              ))
            ) : (
              <Typography variant="body2">{t('no_sales_data_for_payment_method')}</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>{t('sales_by_category')}</Typography>
            {reportData.salesByCategory.length > 0 ? (
              reportData.salesByCategory.map((item, index) => (
                <Grid container spacing={1} key={index}>
                  <Grid item xs={6}><Typography>{item.category}:</Typography></Grid>
                  <Grid item xs={6}><Typography>R$ {item.amount.toFixed(2)}</Typography></Grid>
                </Grid>
              ))
            ) : (
              <Typography variant="body2">{t('no_sales_data_for_category')}</Typography>
            )}
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="contained" onClick={handlePrint} disabled={!reportData}>
            {t('print_report')}
          </Button>
          <Button variant="outlined" onClick={onClose}>
            {t('close')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ZReportModal;
