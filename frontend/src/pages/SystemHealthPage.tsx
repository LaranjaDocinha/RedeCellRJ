import React from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Chip } from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Warning } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';

const SystemHealthPage: React.FC = () => {
  const { data: healthData, isLoading, error } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const response = await axios.get('/api/health');
      return response.data;
    },
    refetchInterval: 5000, // Poll every 5s
  });

  if (isLoading && !healthData) return <CircularProgress />;
  if (error) return <Typography color="error">Erro ao conectar com servidor.</Typography>;

  const uptimeHours = healthData?.uptime ? (healthData.uptime / 3600).toFixed(2) : 0;

  // Mock data for charts since the simple health check endpoint doesn't return historical data
  const memorySeries = [{
    name: 'Memory Usage',
    data: [40, 45, 42, 48, 50, 45, 42]
  }];
  
  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', height: 100, sparkline: { enabled: true } },
    stroke: { curve: 'smooth' },
    fill: { opacity: 0.3 },
    colors: ['#4caf50'],
    tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Monitoramento do Sistema (God Mode)
      </Typography>

      <Grid container spacing={3}>
        {/* Status Geral */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Status API</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle color="success" fontSize="large" />
                <Typography variant="h5">Operacional</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Uptime: {uptimeHours} horas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Database */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Banco de Dados</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {healthData?.services?.database === 'connected' ? 
                  <CheckCircle color="success" /> : <ErrorIcon color="error" />}
                <Typography variant="h6">{healthData?.services?.database === 'connected' ? 'Conectado' : 'Erro'}</Typography>
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>PostgreSQL 15</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Redis / Queue (Mocked for now if not in health endpoint) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Filas (BullMQ)</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle color="success" />
                <Typography variant="h6">Ativo</Typography>
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>Jobs Processados: 1,240</Typography>
            </CardContent>
          </Card>
        </Grid>

         {/* Memory Chart */}
         <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ pb: 0 }}>
              <Typography color="textSecondary">Uso de Memória</Typography>
              <Typography variant="h5">450 MB</Typography>
            </CardContent>
            <ReactApexChart options={chartOptions} series={memorySeries} type="area" height={100} />
          </Card>
        </Grid>
      </Grid>
      
      {/* Detalhes Técnicos JSON */}
      <Box mt={4}>
        <Typography variant="h6">Raw Telemetry Data</Typography>
        <Card sx={{ bgcolor: '#1e1e1e', color: '#00ff00', p: 2, fontFamily: 'monospace' }}>
            <pre>{JSON.stringify(healthData, null, 2)}</pre>
        </Card>
      </Box>
    </Box>
  );
};

export default SystemHealthPage;
