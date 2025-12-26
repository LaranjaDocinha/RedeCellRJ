import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Slider,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  useTheme,
  Tooltip,
  IconButton,
  Chip
} from '@mui/material';
import { 
  Science as LabIcon, 
  TrendingUp, 
  TrendingDown, 
  AttachMoney, 
  Percent, 
  Timeline, 
  InfoOutlined as InfoIcon,
  Calculate as CalcIcon,
  CheckCircle as SuccessIcon,
  Warning as RiskIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import { motion, AnimatePresence } from 'framer-motion';

const WhatIfPromotionPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  
  // Simulation Inputs
  const [discountPercentage, setDiscountPercentage] = useState(15);
  const [expectedSalesIncrease, setExpectedSalesIncrease] = useState(25);
  const [durationDays, setDurationDays] = useState(30);
  
  const [products, setProducts] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('1');

  // Initial fetch for baseline comparison (Mocked for demonstration)
  useEffect(() => {
    handleSimulate();
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    // Simulated backend logic for "What-If"
    setTimeout(() => {
      const baselineProfit = 50000;
      const baselineRevenue = 120000;
      
      const simulatedRevenue = baselineRevenue * (1 + expectedSalesIncrease / 100) * (1 - discountPercentage / 100);
      const simulatedProfit = simulatedRevenue * 0.35; // Simplified fixed margin for simulation
      const profitChange = simulatedProfit - baselineProfit;

      setSimulationData({
        baseline: { profit: baselineProfit, revenue: baselineRevenue },
        simulated: { profit: simulatedProfit, revenue: simulatedRevenue },
        impact: { 
          profitChange, 
          percentage: (profitChange / baselineProfit) * 100,
          revenueChange: simulatedRevenue - baselineRevenue
        }
      });
      setLoading(false);
    }, 800);
  };

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 10, columnWidth: '50%' } },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    xaxis: { categories: ['Receita', 'Lucro Estimado'], labels: { style: { fontWeight: 700 } } },
    yaxis: { labels: { formatter: (val) => `R$ ${val.toLocaleString()}` } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `R$ ${val.toLocaleString()}` } }
  };

  const chartSeries = simulationData ? [
    { name: 'Cenário Base', data: [simulationData.baseline.revenue, simulationData.baseline.profit] },
    { name: 'Simulação', data: [simulationData.simulated.revenue, simulationData.simulated.profit] }
  ] : [];

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <LabIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
              ESTRATÉGIA COMERCIAL
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Simulador "What-If"
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Preveja o impacto financeiro de promoções e descontos antes de colocá-los em prática.
          </Typography>
        </Box>
        <Chip icon={<Timeline />} label="MODO INTELIGÊNCIA ATIVO" color="info" sx={{ fontWeight: 900, borderRadius: '8px', px: 1 }} />
      </Box>

      <Grid container spacing={4}>
        {/* Parâmetros da Simulação */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 4, borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', height: '100%' }}>
            <Typography variant="h6" fontWeight={800} mb={4}>Configurar Cenário</Typography>
            
            <Box mb={5}>
              <Typography variant="body2" fontWeight={700} gutterBottom display="flex" justifyContent="space-between">
                <span>Desconto Aplicado</span>
                <span style={{ color: theme.palette.primary.main }}>{discountPercentage}%</span>
              </Typography>
              <Slider 
                value={discountPercentage} 
                onChange={(_, v) => setDiscountPercentage(v as number)} 
                min={0} max={50}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box mb={5}>
              <Typography variant="body2" fontWeight={700} gutterBottom display="flex" justifyContent="space-between">
                <span>Aumento de Vendas Esperado</span>
                <span style={{ color: theme.palette.secondary.main }}>{expectedSalesIncrease}%</span>
              </Typography>
              <Slider 
                value={expectedSalesIncrease} 
                onChange={(_, v) => setExpectedSalesIncrease(v as number)} 
                min={0} max={200}
                color="secondary"
                valueLabelDisplay="auto"
              />
            </Box>

            <Box mb={5}>
              <Typography variant="body2" fontWeight={700} gutterBottom>Duração da Campanha (Dias)</Typography>
              <TextField 
                type="number" 
                fullWidth 
                size="small" 
                value={durationDays} 
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              startIcon={<CalcIcon />}
              onClick={handleSimulate}
              disabled={loading}
              sx={{ borderRadius: '16px', py: 2, fontWeight: 800, boxShadow: '0 10px 30px rgba(25, 118, 210, 0.3)' }}
            >
              RECALCULAR IMPACTO
            </Button>
          </Paper>
        </Grid>

        {/* Resultados e Gráficos */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>
            {/* Impact Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary">Mudança no Lucro Líquido</Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Avatar sx={{ bgcolor: simulationData?.impact?.profitChange >= 0 ? 'success.light' : 'error.light', borderRadius: '12px' }}>
                        {simulationData?.impact?.profitChange >= 0 ? <TrendingUp /> : <TrendingDown />}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={900}>
                          R$ {Math.abs(simulationData?.impact?.profitChange || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color={simulationData?.impact?.profitChange >= 0 ? 'success.main' : 'error.main'} fontWeight={800}>
                          {simulationData?.impact?.percentage.toFixed(1)}% em relação ao normal
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary">Indicador de Viabilidade</Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Avatar sx={{ bgcolor: simulationData?.impact?.profitChange > 0 ? 'success.main' : 'warning.main', borderRadius: '12px' }}>
                        {simulationData?.impact?.profitChange > 0 ? <SuccessIcon /> : <RiskIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={900}>
                          {simulationData?.impact?.profitChange > 0 ? 'Campanha Lucrativa' : 'Alerta de Margem'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {simulationData?.impact?.profitChange > 0 ? 'O aumento de volume compensa o desconto.' : 'Risco de prejuízo operacional.'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Main Chart */}
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={800}>Comparação de Performance</Typography>
                <Stack direction="row" spacing={2}>
                  <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} /><Typography variant="caption" fontWeight={700}>BASE</Typography></Box>
                  <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'secondary.main' }} /><Typography variant="caption" fontWeight={700}>SIMULADO</Typography></Box>
                </Stack>
              </Box>
              <Box sx={{ minHeight: 350 }}>
                {loading ? <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box> : <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />}
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Insights Section */}
      <Box mt={6}>
        <Typography variant="h6" fontWeight={800} mb={3}>Recomendações da Inteligência</Typography>
        <Grid container spacing={3}>
          {[
            { title: 'Otimização de Preço', desc: 'Para este cenário, um aumento de 5% no volume já cobre os custos fixos.', icon: <CalcIcon />, color: 'primary' },
            { title: 'Risco de Estoque', desc: 'Atenção: O aumento esperado de vendas pode esgotar o estoque de iPhones em 12 dias.', icon: <RiskIcon />, color: 'warning' },
            { title: 'Janela de Oportunidade', desc: 'Sexta-feira e Sábado são os melhores dias para iniciar esta promoção.', icon: <Timeline />, color: 'success' },
          ].map((insight, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
                <Box sx={{ color: `${insight.color}.main` }}>{insight.icon}</Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>{insight.title}</Typography>
                  <Typography variant="caption" color="text.secondary" lineHeight={1.4} display="block">{insight.desc}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default WhatIfPromotionPage;