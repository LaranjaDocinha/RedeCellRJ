import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SerialInputModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (serials: string[]) => void;
  productName: string;
  quantity: number;
}

const SerialInputModal: React.FC<SerialInputModalProps> = ({
  open,
  onClose,
  onConfirm,
  productName,
  quantity,
}) => {
  const { t } = useTranslation();
  const [serials, setSerials] = useState<string[]>(Array(quantity).fill(''));

  const handleChange = (index: number, value: string) => {
    const newSerials = [...serials];
    newSerials[index] = value;
    setSerials(newSerials);
  };

  const handleConfirm = () => {
    // Simple validation: check if all fields are filled
    if (serials.some(s => !s.trim())) {
      alert(t('fill_all_serials')); // Replace with notification if possible
      return;
    }
    onConfirm(serials);
    setSerials(Array(quantity).fill('')); // Reset
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('enter_serials_for', { productName })}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" gutterBottom>
          {t('enter_unique_serial_for_each_item')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {Array.from({ length: quantity }).map((_, index) => (
            <TextField
              key={index}
              label={`${t('serial_number')} ${index + 1}`}
              value={serials[index] || ''}
              onChange={(e) => handleChange(index, e.target.value)}
              fullWidth
              autoFocus={index === 0}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={serials.some(s => !s.trim())}>
          {t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SerialInputModal;
