import React from 'react';
import { Snackbar as MuiSnackbar, Alert, AlertColor } from '@mui/material';

export interface SnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertColor;
  duration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  onClose,
  message,
  severity = 'success',
  duration = 6000,
}) => {
  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </MuiSnackbar>
  );
};