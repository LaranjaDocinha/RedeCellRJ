import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  LinearProgress, 
  Box 
} from '@mui/material';
import { FiAlertCircle } from 'react-icons/fi';

interface InactivityModalProps {
  open: boolean;
  onStay: () => void;
  countdown: number;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({ open, onStay, countdown }) => {
  const progress = (countdown / 60) * 100;

  return (
    <Dialog open={open} PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 400 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FiAlertCircle color="#ed6c02" size={32} />
        Sua sessão vai expirar
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" mb={3}>
          Você está inativo há algum tempo. Por segurança, sua sessão será encerrada em <strong>{countdown} segundos</strong>.
        </Typography>
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={progress} color="warning" sx={{ height: 10, borderRadius: 5 }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onStay} variant="contained" size="large" fullWidth sx={{ borderRadius: 3 }}>
          Continuar Conectado
        </Button>
      </DialogActions>
    </Dialog>
  );
};
