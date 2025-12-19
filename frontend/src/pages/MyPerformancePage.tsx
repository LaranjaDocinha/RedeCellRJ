import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, List, ListItem, ListItemText, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';

const MyPerformancePage: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/performance/me', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setPerformanceData(data);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [token]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!performanceData) {
    return <Typography>Não foi possível carregar os dados de performance.</Typography>;
  }

  const salesChartOptions = {
    chart: {
      id: 'sales-trend'
    },
    xaxis: {
      categories: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'] // Placeholder
    }
  };
  const salesChartSeries = [{
    name: 'Vendas',
    data: [1200, 1900, 1500, 2800] // Placeholder
  }];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Meu Desempenho</Typography>
      <Grid container spacing={3}>
        {/* Statistic Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Vendas Totais (Mês)</Typography>
              <Typography variant="h4">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(performanceData.totalSales)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Nº de Vendas (Mês)</Typography>
              <Typography variant="h4">{performanceData.numSales}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Reparos Finalizados (Mês)</Typography>
              <Typography variant="h4">{performanceData.numRepairs}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tendência de Vendas</Typography>
            <ReactApexChart options={salesChartOptions} series={salesChartSeries} type="line" height={350} />
          </Paper>
        </Grid>

        {/* Goals and Badges */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Metas Atuais</Typography>
            <List>
              {performanceData.goals.map((goal: any) => (
                <ListItem key={goal.name}>
                  <ListItemText primary={goal.name} secondary={`Progresso: ${goal.current_value} / ${goal.target_value}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Emblemas Conquistados</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {performanceData.badges.map((badge: any) => (
                    <Chip key={badge.name} label={badge.name} color="primary" />
                ))}
            </Box>
          </Paper>
        </Grid>

        {/* Commissions Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Comissões Recentes</Typography>
            {/* Basic table for now */}
            <List>
                {performanceData.commissions.map((c: any) => (
                    <ListItem key={c.id}>
                        <ListItemText primary={`Venda #${c.saleId} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.amount)}`} secondary={`Data: ${moment(c.date).format('DD/MM/YYYY')}`} />
                    </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyPerformancePage;
