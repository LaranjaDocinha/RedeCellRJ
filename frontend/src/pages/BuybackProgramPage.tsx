import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../contexts/AuthContext';
import moment, { Moment } from 'moment';

const BuybackProgramPage: React.FC = () => {
  const [deviceId, setDeviceId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Moment | null>(null);
  const [buybackValue, setBuybackValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState('1'); // Placeholder for logged-in customer ID

  const { token } = useAuth();

  const handleCalculateBuyback = async () => {
    if (!token || !deviceId || !purchaseDate) return;
    setLoading(true);
    setBuybackValue(null);
    try {
      const res = await fetch(`/api/buyback/value?deviceId=${deviceId}&purchaseDate=${purchaseDate.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBuybackValue(data.buybackValue);
      } else {
        alert(data.message || 'Erro ao calcular valor de recompra.');
      }
    } catch (error) {
      console.error('Error calculating buyback value:', error);
      alert('Erro ao calcular valor de recompra.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateBuyback = async () => {
    if (!token || !deviceId || !buybackValue || !customerId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/buyback/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerId: parseInt(customerId, 10), deviceId: parseInt(deviceId, 10), buybackValue }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setDeviceId('');
        setPurchaseDate(null);
        setBuybackValue(null);
      } else {
        alert(data.message || 'Erro ao iniciar recompra.');
      }
    } catch (error) {
      console.error('Error initiating buyback:', error);
      alert('Erro ao iniciar recompra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>Programa de Recompra Garantida</Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Calcular Valor de Recompra</Typography>
          <TextField
            fullWidth
            label="ID do Dispositivo"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <DatePicker
            label="Data da Compra"
            value={purchaseDate}
            onChange={(newValue) => setPurchaseDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            disabled={loading}
          />
          <Button variant="contained" onClick={handleCalculateBuyback} disabled={loading || !deviceId || !purchaseDate}>Calcular Valor de Recompra</Button>

          {loading && <CircularProgress sx={{ mt: 2 }} />}

          {buybackValue !== null && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5">Valor de Recompra Estimado: R$ {buybackValue.toFixed(2)}</Typography>
              <Button variant="contained" color="primary" onClick={handleInitiateBuyback} sx={{ mt: 2 }} disabled={loading}>Iniciar Recompra</Button>
            </Box>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default BuybackProgramPage;
