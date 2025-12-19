import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, TextField, Button, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';

const AccountingIntegrationPage: React.FC = () => {
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncLogs, setSyncLogs] = useState<string[]>([]); // To store simulated sync logs
  const { token } = useAuth();

  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      if (!token) return;
      setLoadingStatus(true);
      try {
        const res = await fetch('/api/accounting-integration/status', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setIntegrationStatus(data);
      } catch (error) {
        console.error('Error fetching integration status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchIntegrationStatus();
  }, [token]);

  const handleSyncSales = async () => {
    if (!token) return;
    setSyncLogs(prev => [...prev, `[${new Date().toLocaleString()}] Iniciando sincronização de vendas...`]);
    try {
      const res = await fetch('/api/accounting-integration/sync-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ /* dummy sales data */ sales: [{ id: 1, amount: 100 }, { id: 2, amount: 200 }] })
      });
      const data = await res.json();
      setSyncLogs(prev => [...prev, `[${new Date().toLocaleString()}] Sincronização de vendas: ${data.message}`]);
    } catch (error) {
      console.error('Error syncing sales:', error);
      setSyncLogs(prev => [...prev, `[${new Date().toLocaleString()}] Erro na sincronização de vendas.`]);
    }
  };

  const handleSyncExpenses = async () => {
    if (!token) return;
    setSyncLogs(prev => [...prev, `[${new Date().toLocaleString()}] Iniciando sincronização de despesas...`]);
    try {
      const res = await fetch('/api/accounting-integration/sync-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ /* dummy expense data */ expenses: [{ id: 101, amount: 50 }, { id: 102, amount: 75 }] })
      });
      const data = await res.json();
      setSyncLogs(prev => [...prev, `[${new Date().toLocaleString()}] Sincronização de despesas: ${data.message}`]);
    } catch (error) {
      console.error('Error syncing expenses:', error);
      setSyncLogs(prev => [...prev, `[${new Date().toLocaleString()}] Erro na sincronização de despesas.`]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Integração Contábil</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Status da Integração</Typography>
            {loadingStatus ? (
              <CircularProgress />
            ) : integrationStatus ? (
              <Box>
                <Typography><b>Status:</b> {integrationStatus.status}</Typography>
                <Typography><b>Última Sincronização:</b> {new Date(integrationStatus.lastSync).toLocaleString()}</Typography>
                <Typography><b>Software Integrado:</b> {integrationStatus.software}</Typography>
              </Box>
            ) : (
              <Typography>Nenhuma integração configurada.</Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Sincronização Manual</Typography>
            <Button variant="contained" onClick={handleSyncSales} sx={{ mr: 2, my: 1 }}>Sincronizar Vendas</Button>
            <Button variant="contained" onClick={handleSyncExpenses} sx={{ my: 1 }}>Sincronizar Despesas</Button>
            <List sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                {syncLogs.map((log, index) => <ListItem key={index}><ListItemText primary={log} /></ListItem>)}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountingIntegrationPage;
