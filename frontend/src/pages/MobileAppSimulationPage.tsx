import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const MobileAppSimulationPage: React.FC = () => {
  const [appStatus, setAppStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [appLogs, setAppLogs] = useState<string[]>([]);
  const [userId, setUserId] = useState('1'); // Placeholder for user ID

  const { token } = useAuth();

  useEffect(() => {
    const fetchAppStatus = async () => {
      if (!token) return;
      setLoadingStatus(true);
      try {
        const res = await fetch('/api/mobile-app/status', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setAppStatus(data);
      } catch (error) {
        console.error('Error fetching mobile app status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchAppStatus();
  }, [token]);

  const handleFetchOfflineData = async () => {
    if (!token || !userId) return;
    setAppLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Simulando busca de dados offline para o usuário ${userId}...`]);
    try {
      const res = await fetch(`/api/mobile-app/offline-data/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAppLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Dados offline buscados (simulado): ${JSON.stringify(data.data)}`]);
    } catch (error) {
      console.error('Error fetching offline data:', error);
      setAppLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro ao buscar dados offline.`]);
    }
  };

  const handleSyncMobileData = async () => {
    if (!token) return;
    setAppLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Simulando sincronização de dados do app móvel...`]);
    try {
      // Dummy data for mobile app sync
      const dummyMobileData = { sales: [{ id: 1, amount: 150 }], serviceOrders: [{ id: 5, status: 'completed' }] };
      const res = await fetch('/api/mobile-app/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: dummyMobileData }),
      });
      const data = await res.json();
      setAppLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Dados do app móvel sincronizados (simulado): ${data.message}`]);
    } catch (error) {
      console.error('Error syncing mobile data:', error);
      setAppLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro ao sincronizar dados do app móvel.`]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Simulação de App Móvel (PWA)</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Status do App Móvel</Typography>
            {loadingStatus ? (
              <CircularProgress />
            ) : appStatus ? (
              <Box>
                <Typography><b>Status:</b> {appStatus.status}</Typography>
                <Typography><b>Última Sincronização:</b> {moment(appStatus.lastSync).format('DD/MM/YYYY HH:mm:ss')}</Typography>
                <Typography><b>Versão do App:</b> {appStatus.appVersion}</Typography>
              </Box>
            ) : (
              <Typography>Nenhuma conexão com app móvel detectada.</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Controles de Simulação</Typography>
            <TextField
              fullWidth
              label="ID do Usuário (para dados offline)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleFetchOfflineData} sx={{ mr: 2, my: 1 }}>Buscar Dados Offline</Button>
            <Button variant="contained" onClick={handleSyncMobileData} sx={{ my: 1 }}>Sincronizar Dados do App</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Log de Atividades do App</Typography>
            <List sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                {appLogs.map((log, index) => <ListItem key={index}><ListItemText primary={log} /></ListItem>)}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6">Interface Simplificada do App (Placeholder)</Typography>
        <Typography variant="body2" color="text.secondary">Imagine aqui uma lista de Ordens de Serviço, um formulário de venda rápida, etc.</Typography>
        <Box sx={{ border: '1px dashed grey', p: 3, mt: 2, minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">Conteúdo do App Móvel (Simulado)</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MobileAppSimulationPage;
