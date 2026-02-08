import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  TextField,
  Box,
  Typography,
  MenuItem,
  IconButton,
  InputAdornment,
  LinearProgress,
  Switch,
  FormControlLabel,
  Paper,
  Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Customer360ViewData } from '../../components/POS/Customer360View';
import { useNotification } from '../../contexts/NotificationContext';

interface PaymentInput {
  id: number;
  method: string;
  amount: number;
}

interface SplitPaymentModalProps {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
  availablePaymentMethods: string[];
  onConfirm: (payments: PaymentInput[]) => void;
  customer360Data?: Customer360ViewData;
}

const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  open,
  onClose,
  totalAmount,
  availablePaymentMethods,
  onConfirm,
  customer360Data,
}) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [payments, setPayments] = useState<PaymentInput[]>([]);
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  const [useLoyaltyPoints, setUseStorePoints] = useState(false);
  const [nextId, setNextId] = useState(0);

  const POINTS_CONVERSION_RATE = 0.1;
  const creditAvailable = customer360Data?.store_credit_balance || 0;
  const pointsAvailable = customer360Data?.loyalty_points || 0;
  const pointsValue = pointsAvailable * POINTS_CONVERSION_RATE;

  useEffect(() => {
    if (open) {
      setPayments([]);
      setNextId(0);
      setUseStoreCredit(false);
      setUseStorePoints(false);
    }
  }, [open]);

  const totalPaid = useMemo(() => {
    let paid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (useStoreCredit) paid += Math.min(creditAvailable, totalAmount);
    if (useLoyaltyPoints) paid += Math.min(pointsValue, totalAmount - (useStoreCredit ? Math.min(creditAvailable, totalAmount) : 0));
    return paid;
  }, [payments, useStoreCredit, useLoyaltyPoints, creditAvailable, pointsValue, totalAmount]);

  const remainingBalance = useMemo(() => Math.max(0, totalAmount - totalPaid), [totalAmount, totalPaid]);

  const handleAddPayment = () => {
    const defaultMethod = availablePaymentMethods.filter(m => m !== 'store_credit')[0] || 'cash';
    setPayments([...payments, { id: nextId, method: defaultMethod, amount: remainingBalance }]);
    setNextId(nextId + 1);
  };

  const handleRemovePayment = (id: number) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handlePaymentChange = (id: number, field: keyof PaymentInput, value: any) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleConfirm = () => {
    if (totalPaid < totalAmount) {
      addNotification(t('remaining_balance_not_zero'), 'warning');
      return;
    }

    const finalPayments = [...payments];
    if (useStoreCredit) finalPayments.push({ id: -1, method: 'store_credit', amount: Math.min(creditAvailable, totalAmount) });
    if (useLoyaltyPoints) finalPayments.push({ id: -2, method: 'loyalty_redeem', amount: Math.min(pointsValue, totalAmount) });

    onConfirm(finalPayments);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
      <DialogTitle sx={{ fontWeight: 400 }}>{t('split_payment')}</DialogTitle>
      <DialogContent dividers>
        {customer360Data && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover', borderRadius: '16px' }}>
                <Typography variant="overline" fontWeight={400} color="text.secondary">CARTEIRA DO CLIENTE</Typography>
                <Stack spacing={1} mt={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Crédito Disponível: <strong>R$ {creditAvailable.toFixed(2)}</strong></Typography>
                        <FormControlLabel control={<Switch size="small" checked={useStoreCredit} onChange={(e) => setUseStoreCredit(e.target.checked)} disabled={creditAvailable <= 0} />} label={<Typography variant="caption">Usar Saldo</Typography>} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Fidelidade: <strong>{pointsAvailable} pts</strong> (R$ {pointsValue.toFixed(2)})</Typography>
                        <FormControlLabel control={<Switch size="small" checked={useLoyaltyPoints} onChange={(e) => setUseStorePoints(e.target.checked)} disabled={pointsAvailable <= 0} />} label={<Typography variant="caption">Resgatar</Typography>} />
                    </Box>
                </Stack>
            </Paper>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">Progresso do Pagamento</Typography>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 400 }}>
                {Math.min(100, Math.round((totalPaid / totalAmount) * 100))}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(100, (totalPaid / totalAmount) * 100)} 
            sx={{ height: 10, borderRadius: 5 }}
            color={totalPaid >= totalAmount ? "success" : "primary"}
          />
        </Box>

        <Typography variant="h5" fontWeight={400} color="primary" gutterBottom align="center">
          VALOR FINAL: R$ {totalAmount.toFixed(2)}
        </Typography>

        <Box sx={{ mb: 2, mt: 4 }}>
          {payments.map((payment) => (
            <Box key={payment.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', p: 2, borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  select
                  label="Método"
                  value={payment.method}
                  onChange={(e) => handlePaymentChange(payment.id, 'method', e.target.value)}
                  sx={{ flex: 1.5 }}
                  size="small"
                >
                  {availablePaymentMethods.filter(m => m !== 'store_credit').map((method) => (
                    <MenuItem key={method} value={method}>{t(method)}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Valor"
                  type="number"
                  value={payment.amount}
                  onChange={(e) => handlePaymentChange(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                  sx={{ flex: 1 }}
                  size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                />
                <IconButton onClick={() => handleRemovePayment(payment.id)} color="error"><DeleteIcon /></IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <MuiButton
          startIcon={<AddIcon />}
          onClick={handleAddPayment}
          variant="outlined"
          fullWidth
          sx={{ borderRadius: '12px', borderStyle: 'dashed' }}
        >
          ADICIONAR MÉTODO DE PAGAMENTO
        </MuiButton>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.900', color: 'white', borderRadius: '16px' }}>
          <Box display="flex" justifyContent="space-between"><Typography>Total Pago:</Typography><Typography fontWeight={400}>R$ {totalPaid.toFixed(2)}</Typography></Box>
          <Box display="flex" justifyContent="space-between" mt={1}><Typography>Restante:</Typography><Typography fontWeight={400} color={remainingBalance > 0 ? '#ffeb3b' : 'inherit'}>R$ {remainingBalance.toFixed(2)}</Typography></Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <MuiButton onClick={onClose} sx={{ fontWeight: 400 }}>Cancelar</MuiButton>
        <MuiButton 
            onClick={handleConfirm} 
            disabled={totalPaid < totalAmount} 
            variant="contained" 
            sx={{ borderRadius: '12px', px: 4, fontWeight: 400 }}
        >
          Confirmar e Finalizar
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default SplitPaymentModal;
