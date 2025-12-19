import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';

const WhatIfPromotionPage: React.FC = () => {
  const [simulationData, setSimulationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [durationDays, setDurationDays] = useState(30);
  const [expectedSalesIncrease, setExpectedSalesIncrease] = useState(10);
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const { token } = useAuth();

  useEffect(() => {
    const fetchFilters = async () => {
      if (!token) return;
      try {
        const [productsRes, categoriesRes, branchesRes] = await Promise.all([
          fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const branchesData = await branchesRes.json();
        setProducts(productsData);
        setCategories(categoriesData);
        setBranches(branchesData);
        if (branchesData.length > 0) setSelectedBranch(branchesData[0].id);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    fetchFilters();
  }, [token]);

  const handleSimulate = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/what-if/promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          discount_percentage: discountPercentage,
          target_product_ids: selectedProducts.length > 0 ? selectedProducts : undefined,
          target_category_ids: selectedCategories.length > 0 ? selectedCategories : undefined,
          duration_days: durationDays,
          expected_sales_increase_percentage: expectedSalesIncrease,
          branch_id: selectedBranch ? parseInt(selectedBranch, 10) : undefined,
        }),
      });
      const data = await res.json();
      setSimulationData(data);
    } catch (error) {
      console.error('Error running simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const profitChartOptions = {
    chart: {
      id: 'profit-comparison',
    },
    xaxis: {
      categories: ['Cenário Base', 'Cenário Simulado'],
    },
    yaxis: {
      title: {
        text: 'Lucro (R$)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        },
      },
    },
  };

  const profitChartSeries = simulationData
    ? [
        {
          name: 'Lucro',
          data: [simulationData.baseline.profit, simulationData.simulated.profit],
        },
      ]
    : [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Análise "What-If" de Promoções</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="% Desconto"
              type="number"
              fullWidth
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(parseFloat(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Duração (dias)"
              type="number"
              fullWidth
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value))}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="% Aumento Vendas Esperado"
              type="number"
              fullWidth
              value={expectedSalesIncrease}
              onChange={(e) => setExpectedSalesIncrease(parseFloat(e.target.value))}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filial</InputLabel>
              <Select
                multiple
                value={selectedProducts}
                onChange={(e) => setSelectedProducts(e.target.value as number[])}
                renderValue={(selected) => selected.map(id => products.find(p => p.id === id)?.name).join(', ')}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Categorias</InputLabel>
              <Select
                multiple
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(e.target.value as number[])}
                renderValue={(selected) => selected.map(id => categories.find(c => c.id === id)?.name).join(', ')}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filial</InputLabel>
              <Select value={selectedBranch} label="Filial" onChange={(e) => setSelectedBranch(e.target.value as string)}>
                {branches.map(branch => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSimulate} disabled={loading}>Simular Promoção</Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <CircularProgress />}

      {simulationData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Resultados da Simulação</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Lucro Base:</Typography>
              <Typography variant="h5">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationData.baseline.profit)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Lucro Simulado:</Typography>
              <Typography variant="h5">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationData.simulated.profit)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Mudança no Lucro:</Typography>
              <Typography variant="h5" color={simulationData.impact.profitChange >= 0 ? 'success.main' : 'error.main'}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationData.impact.profitChange)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <ReactApexChart options={profitChartOptions} series={profitChartSeries} type="bar" height={350} />
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default WhatIfPromotionPage;
