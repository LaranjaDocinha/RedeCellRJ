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
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, startOfDay, endOfDay } from 'date-fns';

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
  borderRadius: '24px'
};

const ZReportModal: React.FC<ZReportModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const { token } = useAuth();
  const [reportData, setReportData] = useState<ZReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const fetchZReport = async (date: Date) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const sDate = startOfDay(date).toISOString();
      const eDate = endOfDay(date).toISOString();

      const response = await axios.get<ZReportData>('/api/reports/z-report', {
        params: {
          startDate: sDate,
          endDate: eDate,
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      addNotification(t('failed_to_fetch_z_report'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && selectedDate) {
      fetchZReport(selectedDate);
    }
  }, [open, selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="z-report-modal-title"
    >
      <Box sx={style}>
        <Typography id="z-report-modal-title" variant="h5" fontWeight={400} gutterBottom>
          RELATÓRIO Z (FECHAMENTO)
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Selecionar Data"
            value={selectedDate}
            onChange={(val) => setSelectedDate(val)}
            slotProps={{
                textField: {
                    fullWidth: true,
                    size: 'small',
                    sx: { mb: 3 }
                }
            }}
          />
        </LocalizationProvider>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center" sx={{ my: 3 }}>
            Erro ao carregar: {error}
          </Typography>
        )}

        {reportData && !loading && (
          <Paper elevation={0} sx={{ p: 3, mb: 2, bgcolor: 'action.hover', borderRadius: '16px' }}>
            <Typography variant="overline" fontWeight={400} color="text.secondary">RESUMO DO PERÍODO</Typography>
            <Grid container spacing={2} mt={1}>
              <Grid size={{ xs: 6 }}><Typography variant="body2">Total de Vendas:</Typography></Grid>
              <Grid size={{ xs: 6 }} textAlign="right"><Typography fontWeight={400}>R$ {reportData.totalSalesAmount.toFixed(2)}</Typography></Grid>

              <Grid size={{ xs: 6 }}><Typography variant="body2">Transações:</Typography></Grid>
              <Grid size={{ xs: 6 }} textAlign="right"><Typography fontWeight={400}>{reportData.totalTransactions}</Typography></Grid>

              <Grid size={{ xs: 6 }}><Typography variant="body2">Descontos:</Typography></Grid>
              <Grid size={{ xs: 6 }} textAlign="right"><Typography color="error">R$ {reportData.totalDiscounts.toFixed(2)}</Typography></Grid>

              <Divider sx={{ width: '100%', my: 1 }} />

              <Grid size={{ xs: 6 }}><Typography variant="subtitle1" fontWeight={400}>SALDO LÍQUIDO:</Typography></Grid>
              <Grid size={{ xs: 6 }} textAlign="right"><Typography variant="subtitle1" fontWeight={400} color="primary">R$ {reportData.netCash.toFixed(2)}</Typography></Grid>
            </Grid>

            <Box mt={4}>
                <Typography variant="overline" fontWeight={400} color="text.secondary">POR MÉTODO DE PAGAMENTO</Typography>
                {reportData.salesByPaymentMethod.map((item, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="body2">{t(item.method)}:</Typography>
                        <Typography variant="body2" fontWeight={400}>R$ {item.amount.toFixed(2)}</Typography>
                    </Box>
                ))}
            </Box>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '12px' }}>
            Fechar
          </Button>
          <Button variant="contained" onClick={handlePrint} disabled={!reportData} sx={{ borderRadius: '12px', px: 4 }}>
            Imprimir
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ZReportModal;
