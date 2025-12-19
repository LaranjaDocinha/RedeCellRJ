import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';

const BreakEvenPage: React.FC = () => {
  const [breakEvenData, setBreakEvenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));

  const { token } = useAuth();

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
    const fetchBreakEvenData = async () => {
      if (!token || !selectedBranch) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/break-even?branchId=${selectedBranch}&startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setBreakEvenData(data);
      } catch (error) {
        console.error('Error fetching break-even data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBreakEvenData();
  }, [token, selectedBranch, startDate, endDate]);

  const chartOptions = {
    chart: {
      id: 'break-even-point',
      type: 'line',
    },
    xaxis: {
      categories: ['Unidades Vendidas'], // Placeholder, actual data will vary
    },
    yaxis: {
      title: {
        text: 'Valor (R$)',
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        },
      },
    },
  };

  const chartSeries = breakEvenData ? [
    {
      name: 'Receita Total',
      data: [breakEvenData.totalRevenue],
    },
    {
      name: 'Custo Total',
      data: [breakEvenData.totalFixedCosts + breakEvenData.totalVariableCosts],
    },
    {
      name: 'Custo Fixo',
      data: [breakEvenData.totalFixedCosts],
    },
  ] : [];

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Ponto de Equilíbrio</Typography>

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

      {breakEvenData && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>Resultados do Ponto de Equilíbrio</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><b>Custos Fixos Totais:</b> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(breakEvenData.totalFixedCosts)}</Typography>
              <Typography><b>Custos Variáveis Totais:</b> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(breakEvenData.totalVariableCosts)}</Typography>
              <Typography><b>Receita Total:</b> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(breakEvenData.totalRevenue)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><b>Ponto de Equilíbrio (Unidades):</b> {breakEvenData.breakEvenUnits}</Typography>
              <Typography><b>Ponto de Equilíbrio (Receita):</b> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(breakEvenData.breakEvenRevenue)}</Typography>
            </Grid>
          </Grid>
          <Box mt={3}>
            <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default BreakEvenPage;
