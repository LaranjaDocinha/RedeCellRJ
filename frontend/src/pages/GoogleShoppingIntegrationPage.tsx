import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const GoogleShoppingIntegrationPage: React.FC = () => {
  const [gsStatus, setGsStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [gsLogs, setGsLogs] = useState<string[]>([]);
  const [merchantId, setMerchantId] = useState('');
  const [apiKey, setApiKey] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    const fetchGsStatus = async () => {
      if (!token) return;
      setLoadingStatus(true);
      try {
        const res = await fetch('/api/google-shopping/status', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setGsStatus(data);
      } catch (error) {
        console.error('Error fetching Google Shopping status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchGsStatus();
  }, [token]);

  const handleSyncProductFeed = async () => {
    if (!token) return;
    setGsLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Iniciando sincronização do feed de produtos para Google Shopping...`]);
    try {
      // In a real scenario, you'd fetch actual product data from your system
      const dummyProductData = [{ id: 1, title: 'Smartphone Y', price: 1099.99, link: 'http://example.com/product/y' }];
      const res = await fetch('/api/google-shopping/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productsData: dummyProductData }),
      });
      const data = await res.json();
      setGsLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Sincronização do feed de produtos para Google Shopping: ${data.message}`]);
    } catch (error) {
      console.error('Error syncing product feed:', error);
      setGsLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro na sincronização do feed de produtos para Google Shopping.`]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Integração com Google Shopping</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Status da Conexão</Typography>
            {loadingStatus ? (
              <CircularProgress />
            ) : gsStatus ? (
              <Box>
                <Typography><b>Status:</b> {gsStatus.status}</Typography>
                <Typography><b>Última Sincronização:</b> {moment(gsStatus.lastSync).format('DD/MM/YYYY HH:mm:ss')}</Typography>
                <Typography><b>Plataforma:</b> {gsStatus.platform}</Typography>
              </Box>
            ) : (
              <Typography>Nenhuma integração com Google Shopping configurada.</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Configurações do Google Shopping (Placeholder)</Typography>
            <TextField
              fullWidth
              label="ID do Comerciante (Merchant ID)"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="123456789"
            />
            <TextField
              fullWidth
              label="Chave API (Opcional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <Button variant="contained" disabled>Salvar Configurações</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Sincronização Manual</Typography>
            <Button variant="contained" onClick={handleSyncProductFeed} sx={{ mr: 2, my: 1 }}>Sincronizar Feed de Produtos</Button>
            <List sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                {gsLogs.map((log, index) => <ListItem key={index}><ListItemText primary={log} /></ListItem>)}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GoogleShoppingIntegrationPage;
