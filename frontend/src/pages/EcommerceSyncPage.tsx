import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const EcommerceSyncPage: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [ecommerceApiKey, setEcommerceApiKey] = useState('');
  const [ecommerceStoreUrl, setEcommerceStoreUrl] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    const fetchSyncStatus = async () => {
      if (!token) return;
      setLoadingStatus(true);
      try {
        const res = await fetch('/api/ecommerce-sync/status', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setSyncStatus(data);
      } catch (error) {
        console.error('Error fetching e-commerce sync status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchSyncStatus();
  }, [token]);

  const handleSyncProducts = async () => {
    if (!token) return;
    setSyncLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Iniciando sincronização de produtos...`]);
    try {
      // In a real scenario, you'd fetch actual product data from your system
      const dummyProductData = [{ id: 1, name: 'Smartphone X', stock: 10, price: 999.99 }];
      const res = await fetch('/api/ecommerce-sync/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(dummyProductData),
      });
      const data = await res.json();
      setSyncLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Sincronização de produtos: ${data.message}`]);
    } catch (error) {
      console.error('Error syncing products:', error);
      setSyncLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro na sincronização de produtos.`]);
    }
  };

  const handleSyncOrders = async () => {
    if (!token) return;
    setSyncLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Iniciando busca de pedidos...`]);
    try {
      const res = await fetch('/api/ecommerce-sync/sync-orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSyncLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Busca de pedidos: ${data.message}`]);
    } catch (error) {
      console.error('Error syncing orders:', error);
      setSyncLogs(prev => [...prev, `[${moment().format('DD/MM/YYYY HH:mm:ss')}] Erro na busca de pedidos.`]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Sincronização com E-commerce</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Status da Sincronização</Typography>
            {loadingStatus ? (
              <CircularProgress />
            ) : syncStatus ? (
              <Box>
                <Typography><b>Status:</b> {syncStatus.status}</Typography>
                <Typography><b>Última Sincronização:</b> {moment(syncStatus.lastSync).format('DD/MM/YYYY HH:mm:ss')}</Typography>
                <Typography><b>Plataforma:</b> {syncStatus.platform}</Typography>
              </Box>
            ) : (
              <Typography>Nenhuma sincronização configurada.</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Configurações de E-commerce (Placeholder)</Typography>
            <TextField
              fullWidth
              label="API Key do E-commerce"
              value={ecommerceApiKey}
              onChange={(e) => setEcommerceApiKey(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Chave API (ex: Shopify, WooCommerce)"
            />
            <TextField
              fullWidth
              label="URL da Loja E-commerce"
              value={ecommerceStoreUrl}
              onChange={(e) => setEcommerceStoreUrl(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="URL da sua loja (ex: https://minhaloja.com)"
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
                {syncLogs.map((log, index) => <ListItem key={index}><ListItemText primary={log} /></ListItem>)}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EcommerceSyncPage;
