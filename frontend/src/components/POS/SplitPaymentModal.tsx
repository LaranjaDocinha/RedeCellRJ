import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material'; // Added ContentCopyIcon
import { useTranslation } from 'react-i18next';
import { Customer360ViewData } from '../../components/POS/Customer360View'; // Import Customer360ViewData
import axios from 'axios'; // Import axios
import { useNotification } from '../../contexts/NotificationContext'; // Import useNotification

interface PaymentInput {
  id: number;
  method: string;
  amount: number;
  pixQrCode?: string; // Base64 QR code image
  pixCopiaECola?: string; // PIX Copia e Cola string
  pixTransactionId?: string; // Backend transaction ID for PIX
  pixStatus?: 'pending' | 'paid' | 'expired';
  tefTransactionId?: string; // Backend transaction ID for TEF
  tefStatus?: 'pending' | 'approved' | 'denied';
  tefCardBrand?: string;
  tefNsu?: string;
  tefAuthorizationCode?: string;
  tefInstallments?: number;
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
  const { addNotification } = useNotification(); // Use notification context
  const [payments, setPayments] = useState<PaymentInput[]>([]);
  const [nextId, setNextId] = useState(0);
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null); // For PIX and TEF payment status polling

  useEffect(() => {
    if (open) {
      setPayments([]);
      setNextId(0);
    }
  }, [open]);

  // Effect for PIX and TEF polling
  useEffect(() => {
    if (!open) {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
      }
      return;
    }

    const paymentsToPoll = payments.filter(p =>
      (p.method === 'pix' && p.pixTransactionId && p.pixStatus === 'pending') ||
      ((p.method === 'credit_card' || p.method === 'debit_card') && p.tefTransactionId && p.tefStatus === 'pending')
    );

    if (paymentsToPoll.length > 0 && !pollingIntervalId) {
      const interval = setInterval(async () => {
        for (const payment of paymentsToPoll) {
          if (payment.method === 'pix' && payment.pixTransactionId) {
            try {
              const response = await axios.get(`/api/pix/status/${payment.pixTransactionId}`);
              const status = response.data.status; // 'pending' | 'paid' | 'expired'

              if (status !== 'pending') {
                setPayments(prev =>
                  prev.map(p =>
                    p.id === payment.id ? { ...p, pixStatus: status } : p
                  )
                );
                if (status === 'paid') {
                  addNotification(t('pix_payment_confirmed', { transactionId: payment.pixTransactionId }), 'success');
                } else if (status === 'expired') {
                  addNotification(t('pix_payment_expired', { transactionId: payment.pixTransactionId }), 'warning');
                }
              }
            } catch (error: any) {
              console.error('Error checking PIX payment status:', error);
              addNotification(t('failed_to_check_pix_status', { message: error.message }), 'error');
            }
          } else if ((payment.method === 'credit_card' || payment.method === 'debit_card') && payment.tefTransactionId) {
            try {
              const response = await axios.get(`/api/tef/status/${payment.tefTransactionId}`);
              const status = response.data.status; // 'pending' | 'approved' | 'denied'

              if (status !== 'pending') {
                setPayments(prev =>
                  prev.map(p =>
                    p.id === payment.id ? { ...p, tefStatus: status } : p
                  )
                );
                if (status === 'approved') {
                  addNotification(t('tef_payment_approved', { transactionId: payment.tefTransactionId }), 'success');
                } else if (status === 'denied') {
                  addNotification(t('tef_payment_denied', { transactionId: payment.tefTransactionId }), 'error');
                }
              }
            } catch (error: any) {
              console.error('Error checking TEF payment status:', error);
              addNotification(t('failed_to_check_tef_status', { message: error.message }), 'error');
            }
          }
        }

        // If all payments are no longer pending, clear interval
        const allPaymentsHandled = payments.every(p =>
          (p.method !== 'pix' || p.pixStatus !== 'pending') &&
          ((p.method !== 'credit_card' && p.method !== 'debit_card') || p.tefStatus !== 'pending')
        );
        if (allPaymentsHandled && pollingIntervalId) {
          clearInterval(pollingIntervalId);
          setPollingIntervalId(null);
        }
      }, 5000); // Poll every 5 seconds

      setPollingIntervalId(interval);
    } else if (paymentsToPoll.length === 0 && pollingIntervalId) {
      // No pending payments, clear interval
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }

    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
      }
    };
  }, [open, payments, pollingIntervalId, addNotification, t]);

  const handleAddPayment = () => {
    setPayments((prev) => [
      ...prev,
      { id: nextId, method: availablePaymentMethods[0] || '', amount: 0, pixStatus: 'pending', tefStatus: 'pending' }, // Initialize pixStatus and tefStatus
    ]);
    setNextId((prev) => prev + 1);
  };

  const handlePaymentChange = async ( // Made async
    id: number,
    field: keyof PaymentInput,
    value: any
  ) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );

    if (field === 'method' && value === 'pix') {
      const paymentToUpdate = payments.find(p => p.id === id);
      if (paymentToUpdate && paymentToUpdate.amount > 0) {
        try {
          const response = await axios.post('/api/pix/generate-qr', { amount: paymentToUpdate.amount });
          setPayments((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    pixQrCode: response.data.qrCodeBase64,
                    pixCopiaECola: response.data.pixCopiaECola,
                    pixTransactionId: response.data.transactionId,
                    pixStatus: 'pending',
                  }
                : p
            )
          );
          addNotification(t('pix_qr_code_generated'), 'success');
        } catch (error: any) {
          addNotification(t('failed_to_generate_pix_qr_code', { message: error.response?.data?.message || error.message }), 'error');
          setPayments((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, method: availablePaymentMethods[0] || '', pixQrCode: undefined, pixCopiaECola: undefined, pixTransactionId: undefined, pixStatus: undefined }
                : p
            )
          );
        }
      } else {
        addNotification(t('enter_amount_before_pix'), 'warning');
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, method: availablePaymentMethods[0] || '' }
              : p
          )
        );
      }
    } else if (field === 'amount' && paymentToUpdate?.method === 'pix' && value > 0) {
      // If amount changes for a PIX payment, regenerate QR code
      const paymentToUpdate = payments.find(p => p.id === id);
      if (paymentToUpdate) {
        try {
          const response = await axios.post('/api/pix/generate-qr', { amount: value });
          setPayments((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    pixQrCode: response.data.qrCodeBase64,
                    pixCopiaECola: response.data.pixCopiaECola,
                    pixTransactionId: response.data.transactionId,
                    pixStatus: 'pending',
                  }
                : p
            )
          );
          addNotification(t('pix_qr_code_regenerated'), 'success');
        } catch (error: any) {
          addNotification(t('failed_to_generate_pix_qr_code', { message: error.response?.data?.message || error.message }), 'error');
          setPayments((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, pixQrCode: undefined, pixCopiaECola: undefined, pixTransactionId: undefined, pixStatus: undefined }
                : p
            )
          );
        }
      }
    } else if (field === 'method' && (value === 'credit_card' || value === 'debit_card')) {
      const paymentToUpdate = payments.find(p => p.id === id);
      if (paymentToUpdate && paymentToUpdate.amount > 0) {
        // Simulate initiating TEF transaction
        const transactionId = `TEF-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        try {
          // In a real scenario, this would trigger a local TEF client application
          // For now, we simulate the backend receiving the transaction
          const response = await axios.post('/api/tef/transaction', {
            transactionId,
            amount: paymentToUpdate.amount,
            paymentMethod: value,
            status: 'pending', // Initial status
          });
          setPayments((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    tefTransactionId: transactionId,
                    tefStatus: 'pending',
                    tefCardBrand: response.data.cardBrand, // Simulated
                    tefNsu: response.data.nsu, // Simulated
                    tefAuthorizationCode: response.data.authorizationCode, // Simulated
                    tefInstallments: response.data.installments, // Simulated
                  }
                : p
            )
          );
          addNotification(t('tef_transaction_initiated'), 'info');
        } catch (error: any) {
          addNotification(t('failed_to_initiate_tef_transaction', { message: error.response?.data?.message || error.message }), 'error');
          setPayments((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, method: availablePaymentMethods[0] || '', tefTransactionId: undefined, tefStatus: undefined }
                : p
            )
          );
        }
      } else {
        addNotification(t('enter_amount_before_tef'), 'warning');
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, method: availablePaymentMethods[0] || '' }
              : p
          )
        );
      }
    }
  };

  const handleRemovePayment = (id: number) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const remainingBalance = useMemo(() => {
    return totalAmount - totalPaid;
  }, [totalAmount, totalPaid]);

  const handleConfirm = async () => { // Made async
    if (remainingBalance !== 0) {
      addNotification(t('remaining_balance_not_zero'), 'warning');
      return;
    }

    // Check if any cash payment was made
    const cashPayment = payments.find(p => p.method === 'cash' && p.amount > 0);
    if (cashPayment) {
      try {
        await axios.post('/api/cash-drawer/open');
        addNotification(t('cash_drawer_opened'), 'info');
      } catch (error: any) {
        addNotification(t('failed_to_open_cash_drawer', { message: error.response?.data?.message || error.message }), 'error');
        // Do not block sale completion if cash drawer fails to open
      }
    }

    onConfirm(payments);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('split_payment')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>
          {t('total_to_pay')}: R$ {totalAmount.toFixed(2)}
        </Typography>
        {customer360Data && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {t('customer_store_credit')}: R$ {customer360Data.store_credit_balance.toFixed(2)}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          {payments.map((payment) => (
            <Box key={payment.id} sx={{ mb: 2, border: '1px solid #eee', p: 2, borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  select
                  label={t('payment_method')}
                  value={payment.method}
                  onChange={(e) =>
                    handlePaymentChange(payment.id, 'method', e.target.value)
                  }
                  sx={{ flex: 1 }}
                >
                  {availablePaymentMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {t(method)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label={t('amount')}
                  type="number"
                  value={payment.amount}
                  onChange={(e) =>
                    handlePaymentChange(
                      payment.id,
                      'amount',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => {
                            const currentTotalOther = payments.reduce((sum, p) => (p.id === payment.id ? sum : sum + p.amount), 0);
                            const remaining = totalAmount - currentTotalOther;
                            handlePaymentChange(payment.id, 'amount', remaining > 0 ? parseFloat(remaining.toFixed(2)) : 0);
                          }}
                          sx={{ minWidth: 'auto', p: 0.5 }}
                        >
                          MAX
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1 }}
                />
                <IconButton onClick={() => handleRemovePayment(payment.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              {payment.method === 'pix' && payment.pixQrCode && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">{t('pix_payment_details')}</Typography>
                  <img src={payment.pixQrCode} alt="PIX QR Code" style={{ maxWidth: '150px', height: 'auto', margin: '10px auto' }} />
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {t('pix_copia_e_cola')}: {payment.pixCopiaECola}
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(payment.pixCopiaECola || '');
                        addNotification(t('copied_to_clipboard'), 'info');
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('pix_status')}: {t(payment.pixStatus || 'pending')}
                  </Typography>
                </Box>
              )}

              {(payment.method === 'credit_card' || payment.method === 'debit_card') && payment.tefStatus && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">{t('tef_payment_details')}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('tef_status')}: {t(payment.tefStatus)}
                  </Typography>
                  {payment.tefStatus === 'pending' && (
                    <Typography variant="body2" color="textSecondary">
                      {t('tef_awaiting_card_terminal')}
                    </Typography>
                  )}
                  {payment.tefStatus === 'approved' && (
                    <>
                      <Typography variant="body2">
                        {t('tef_card_brand')}: {payment.tefCardBrand}
                      </Typography>
                      <Typography variant="body2">
                        {t('tef_nsu')}: {payment.tefNsu}
                      </Typography>
                      <Typography variant="body2">
                        {t('tef_authorization_code')}: {payment.tefAuthorizationCode}
                      </Typography>
                      {payment.tefInstallments && (
                        <Typography variant="body2">
                          {t('tef_installments')}: {payment.tefInstallments}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddPayment}
          variant="outlined"
          fullWidth
        >
          {t('add_payment')}
        </Button>

        <Box sx={{ mt: 3, p: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="h6">
            {t('total_paid')}: R$ {totalPaid.toFixed(2)}
          </Typography>
          <Typography variant="h6" color={remainingBalance === 0 ? 'primary' : 'error'}>
            {t('remaining_balance')}: R$ {remainingBalance.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleConfirm} disabled={remainingBalance !== 0} variant="contained">
          {t('confirm_payment')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitPaymentModal;
