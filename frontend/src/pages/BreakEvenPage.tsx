import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Stack, 
  Divider, 
  useTheme, 
  Chip,
  alpha
} from '@mui/material';
import { 
  FaBalanceScale, FaArrowUp, FaStore
} from 'react-icons/fa';
import ReactApexChart from 'react-apexcharts';

const BreakEvenPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const donutOptions: any = {
    labels: ['Produtos', 'Peças', 'Serviços'],
    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main],
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '70%' } } }
  };

  const lineOptions: any = {
    chart: { toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: [theme.palette.success.main, theme.palette.error.main],
    xaxis: { categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'] },
    tooltip: { y: { formatter: (v: number) => `R$ ${v.toLocaleString()}` } }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
            <Typography variant="h4" fontWeight={400} sx={{ letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: 2 }}>
                <FaBalanceScale color={theme.palette.primary.main} /> Rentabilidade Enterprise
            </Typography>
            <Typography variant="body2" color="text.secondary">DRE Consolidado e Análise de Margem Real</Typography>
        </Box>
        <Chip icon={<FaStore />} label="Filial Matriz" variant="outlined" sx={{ fontWeight: 400 }} />
      </Stack>

      <Grid container spacing={3}>
        
        {/* Cards de Topo */}
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: '24px', borderLeft: `6px solid ${theme.palette.success.main}` }}>
                <Typography variant="overline" color="text.secondary" fontWeight={400}>RECEITA BRUTA</Typography>
                <Typography variant="h4" fontWeight={400}>R$ 142.500,00</Typography>
                <Box display="flex" alignItems="center" gap={1} color="success.main" mt={1}>
                    <FaArrowUp size={12} /> <Typography variant="caption" fontWeight={400}>+12% vs mês anterior</Typography>
                </Box>
            </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: '24px', borderLeft: `6px solid ${theme.palette.error.main}` }}>
                <Typography variant="overline" color="text.secondary" fontWeight={400}>DEDUÇÕES E CUSTOS (CMV)</Typography>
                <Typography variant="h4" fontWeight={400}>R$ 88.200,00</Typography>
                <Box display="flex" alignItems="center" gap={1} color="error.main" mt={1}>
                    <FaArrowUp size={12} /> <Typography variant="caption" fontWeight={400}>Taxas: R$ 4.250,00</Typography>
                </Box>
            </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: theme.palette.primary.main, color: 'white' }}>
                <Typography variant="overline" sx={{ opacity: 0.8 }} fontWeight={400}>LUCRO LÍQUIDO REAL</Typography>
                <Typography variant="h4" fontWeight={400}>R$ 54.300,00</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Margem Líquida: 38.1%</Typography>
            </Paper>
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: '24px', height: '100%' }}>
                <Typography variant="h6" fontWeight={400} mb={3}>Fluxo de Receita vs Despesa (Semanal)</Typography>
                <ReactApexChart 
                    options={lineOptions} 
                    series={[
                        { name: 'Entradas', data: [35000, 42000, 38000, 27500] },
                        { name: 'Saídas', data: [22000, 25000, 21000, 20200] }
                    ]} 
                    type="line" 
                    height={350} 
                />
            </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: '24px', height: '100%' }}>
                <Typography variant="h6" fontWeight={400} mb={3}>Mix de Margem</Typography>
                <ReactApexChart 
                    options={donutOptions} 
                    series={[45, 30, 25]} 
                    type="donut" 
                    height={300} 
                />
                <Box mt={4}>
                    <Typography variant="subtitle2" fontWeight={400} gutterBottom>Insights de Lucratividade</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        Serviços representam 25% do faturamento mas <strong>65% do lucro líquido</strong> devido ao baixo custo variável.
                    </Typography>
                </Box>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default BreakEvenPage;
