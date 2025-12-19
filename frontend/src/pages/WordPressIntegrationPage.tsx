import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const WordPressIntegrationPage: React.FC = () => {
  const [wpStatus, setWpStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [wpLogs, setWpLogs] = useState<string[]>([]);
  const [wpSiteUrl, setWpSiteUrl] = useState('');
  const [wpConsumerKey, setWpConsumerKey] = useState('');
  const [wpConsumerSecret, setWpConsumerSecret] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    const fetchWpStatus = async () => {
      if (!token) return;
      setLoadingStatus(true);
      try {
        const res = await fetch('/api/wordpress/status', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setWpStatus(data);
      } catch (error) {
        console.error('Error fetching WordPress status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchWpStatus();
  }, [token]);

  const handleSyncProducts = async () => {
    if (!token) return;
    setWpLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Iniciando sincronização de produtos para WordPress/WooCommerce...`]);
    try {
      // In a real scenario, you'd fetch actual product data from your system
      const dummyProductData = [{ id: 1, name: 'Smartphone Z', stock: 5, price: 1299.99 }];
      const res = await fetch('/api/wordpress/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productsData: dummyProductData }),
      });
      const data = await res.json();
      setWpLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Sincronização de produtos para WordPress/WooCommerce: ${data.message}`]);
    } catch (error) {
      console.error('Error syncing products:', error);
      setWpLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro na sincronização de produtos para WordPress/WooCommerce.`]);
    }
  };

  const handleSyncOrders = async () => {
    if (!token) return;
    setWpLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Iniciando busca de pedidos de WordPress/WooCommerce...`]);
    try {
      const res = await fetch('/api/wordpress/sync-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWpLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Busca de pedidos de WordPress/WooCommerce: ${data.message}`]);
    } catch (error) {
      console.error('Error syncing orders:', error);
      setWpLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro na busca de pedidos de WordPress/WooCommerce.`]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Integração com WordPress/WooCommerce</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Status da Conexão</Typography>
            {loadingStatus ? (
              <CircularProgress />
            ) : wpStatus ? (
              <Box>
                <Typography><b>Status:</b> {wpStatus.status}</Typography>
                <Typography><b>Última Verificação:</b> {moment(wpStatus.lastCheck).format('DD/MM/YYYY HH:mm:ss')}</Typography>
                <Typography><b>Plataforma:</b> {wpStatus.platform}</Typography>
              </Box>
            ) : (
              <Typography>Nenhuma integração com WordPress/WooCommerce configurada.</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Configurações de WordPress/WooCommerce (Placeholder)</Typography>
            <TextField
              fullWidth
              label="URL do Site WordPress"
              value={wpSiteUrl}
              onChange={(e) => setWpSiteUrl(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="https://seusite.com"
            />
            <TextField
              fullWidth
              label="WooCommerce Consumer Key"
              value={wpConsumerKey}
              onChange={(e) => setWpConsumerKey(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <TextField
              fullWidth
              label="WooCommerce Consumer Secret"
              value={wpConsumerSecret}
              onChange={(e) => setWpConsumerSecret(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <Button variant="contained" disabled>Salvar Configurações</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Sincronização Manual</Typography>
            <Button variant="contained" onClick={handleSyncProducts} sx={{ mr: 2, my: 1 }}>Sincronizar Produtos</Button>
            <Button variant="contained" onClick={handleSyncOrders} sx={{ my: 1 }}>Buscar Pedidos</Button>
            <List sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                {wpLogs.map((log, index) => <ListItem key={index}><ListItemText primary={log} /></ListItem>)}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WordPressIntegrationPage;
