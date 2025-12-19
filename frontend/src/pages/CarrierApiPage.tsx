import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const CarrierApiPage: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [carrierApiKey, setCarrierApiKey] = useState('');
  const [carrierAccountId, setCarrierAccountId] = useState('');

  const { token } = useAuth();

  const availableCarriers = ['Vivo', 'Claro', 'TIM'];

  useEffect(() => {
    const fetchApiStatus = async () => {
      if (!token || !selectedCarrier) return;
      setLoadingStatus(true);
      try {
        const res = await fetch(`/api/carrier-api/status?carrier=${selectedCarrier}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setApiStatus(data);
      } catch (error) {
        console.error('Error fetching carrier API status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchApiStatus();
  }, [token, selectedCarrier]);

  const handleActivateChip = async () => {
    if (!token || !selectedCarrier) return;
    setApiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Iniciando ativação de chip com ${selectedCarrier}...`]);
    try {
      // Dummy data for chip activation
      const dummyCustomerData = { name: 'João Silva', cpf: '123.456.789-00' };
      const dummyPlanDetails = { plan: 'Pre-pago', value: 'R$ 25' };
      const res = await fetch('/api/carrier-api/activate-chip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerData: dummyCustomerData, planDetails: dummyPlanDetails, carrier: selectedCarrier }),
      });
      const data = await res.json();
      setApiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Ativação de chip com ${selectedCarrier}: ${data.message}`]);
    } catch (error) {
      console.error('Error activating chip:', error);
      setApiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro na ativação de chip com ${selectedCarrier}.`]);
    }
  };

  const handleActivatePlan = async () => {
    if (!token || !selectedCarrier) return;
    setApiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Iniciando ativação de plano com ${selectedCarrier}...`]);
    try {
      // Dummy data for plan activation
      const dummyCustomerData = { name: 'João Silva', cpf: '123.456.789-00' };
      const dummyPlanDetails = { plan: 'Controle 5GB', value: 'R$ 50' };
      const res = await fetch('/api/carrier-api/activate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerData: dummyCustomerData, planDetails: dummyPlanDetails, carrier: selectedCarrier }),
      });
      const data = await res.json();
      setApiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Ativação de plano com ${selectedCarrier}: ${data.message}`]);
    } catch (error) {
      console.error('Error activating plan:', error);
      setApiLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro na ativação de plano com ${selectedCarrier}.`]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Integração com APIs de Operadoras</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Selecionar Operadora</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Operadora</InputLabel>
              <Select value={selectedCarrier} label="Operadora" onChange={(e) => setSelectedCarrier(e.target.value as string)}>
                {availableCarriers.map(carrier => <MenuItem key={carrier} value={carrier}>{carrier}</MenuItem>)}
              </Select>
            </FormControl>

            {selectedCarrier && loadingStatus ? (
              <CircularProgress />
            ) : apiStatus && selectedCarrier ? (
              <Box>
                <Typography><b>Status:</b> {apiStatus.status}</Typography>
                <Typography><b>Última Verificação:</b> {moment(apiStatus.lastCheck).format('DD/MM/YYYY HH:mm:ss')}</Typography>
                <Typography><b>Operadora:</b> {apiStatus.carrier}</Typography>
              </Box>
            ) : selectedCarrier && (
              <Typography>Nenhuma integração configurada para {selectedCarrier}.</Typography>
            )}
          </Paper>

          {selectedCarrier && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Configurações de {selectedCarrier} (Placeholder)</Typography>
              <TextField
                fullWidth
                label="API Key da Operadora"
                value={carrierApiKey}
                onChange={(e) => setCarrierApiKey(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Chave API"
              />
              <TextField
                fullWidth
                label="ID da Conta"
                value={carrierAccountId}
                onChange={(e) => setCarrierAccountId(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="ID da Conta"
              />
              <Button variant="contained" disabled>Salvar Configurações</Button>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Ações Manuais</Typography>
            <Button variant="contained" onClick={handleActivateChip} sx={{ mr: 2, my: 1 }} disabled={!selectedCarrier}>Ativar Chip</Button>
            <Button variant="contained" onClick={handleActivatePlan} sx={{ my: 1 }} disabled={!selectedCarrier}>Ativar Plano</Button>
            <List sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                {apiLogs.map((log, index) => <ListItem key={index}><ListItemText primary={log} /></ListItem>)}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarrierApiPage;
