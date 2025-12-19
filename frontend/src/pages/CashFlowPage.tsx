import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';

const CashFlowPage: React.FC = () => {
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchBranches = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0].id);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, [token]);

  useEffect(() => {
    const fetchCashFlowData = async () => {
      if (!token || !selectedBranch) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/cash-flow?branchId=${selectedBranch}&startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setCashFlowData(data);
      } catch (error) {
        console.error('Error fetching cash flow data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlowData();
  }, [token, selectedBranch, startDate, endDate]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!cashFlowData) {
    return <Typography>Não foi possível carregar os dados de fluxo de caixa.</Typography>;
  }

  const chartOptions = {
    chart: {
      id: 'cash-flow-trend'
    },
    xaxis: {
      categories: cashFlowData.cashFlowTrend.map((item: any) => moment(item.date).format('DD/MM'))
    }
  };

  const chartSeries = [
    {
      name: 'Entradas',
      data: cashFlowData.cashFlowTrend.map((item: any) => item.inflow)
    },
    {
      name: 'Saídas',
      data: cashFlowData.cashFlowTrend.map((item: any) => item.outflow)
    }
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Fluxo de Caixa</Typography>
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filial</InputLabel>
            <Select value={selectedBranch} label="Filial" onChange={(e) => setSelectedBranch(e.target.value as string)}>
              {branches.map(branch => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Data Início"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Data Fim"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total de Entradas</Typography>
              <Typography variant="h4" color="success.main">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cashFlowData.totalInflow)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total de Saídas</Typography>
              <Typography variant="h4" color="error.main">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cashFlowData.totalOutflow)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Fluxo de Caixa Líquido</Typography>
              <Typography variant="h4" color={cashFlowData.netCashFlow >= 0 ? 'success.main' : 'error.main'}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cashFlowData.netCashFlow)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Cash Flow Trend Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tendência de Fluxo de Caixa</Typography>
            <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CashFlowPage;
