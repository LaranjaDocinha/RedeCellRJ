import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';

const CategoryProfitabilityPage: React.FC = () => {
  const [profitabilityData, setProfitabilityData] = useState<any[]>([]);
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
    const fetchProfitabilityData = async () => {
      if (!token || !selectedBranch) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/category-profitability?branchId=${selectedBranch}&startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setProfitabilityData(data);
      } catch (error) {
        console.error('Error fetching category profitability data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfitabilityData();
  }, [token, selectedBranch, startDate, endDate]);

  const chartOptions = {
    chart: {
      id: 'category-profitability',
      type: 'bar',
    },
    xaxis: {
      categories: profitabilityData.map(item => item.category_name),
    },
    yaxis: {
      title: {
        text: 'Lucro (R$)',
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        }
      }
    }
  };

  const chartSeries = [
    {
      name: 'Lucro',
      data: profitabilityData.map(item => parseFloat(item.total_profit)),
    },
  ];

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Análise de Rentabilidade por Categoria</Typography>

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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Rentabilidade Detalhada</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Categoria</TableCell>
                <TableCell>Receita Total</TableCell>
                <TableCell>Custo Total</TableCell>
                <TableCell>Lucro Total</TableCell>
                <TableCell>Margem de Lucro (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profitabilityData.map((item) => (
                <TableRow key={item.category_id}>
                  <TableCell>{item.category_name}</TableCell>
                  <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.total_revenue))}</TableCell>
                  <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.total_cost))}</TableCell>
                  <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.total_profit))}</TableCell>
                  <TableCell>{item.profit_margin}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Lucro por Categoria</Typography>
        <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
      </Paper>
    </Box>
  );
};

export default CategoryProfitabilityPage;
