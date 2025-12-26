import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  useTheme,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Balance as BalanceIcon, 
  TrendingUp, 
  AttachMoney, 
  Store as StoreIcon, 
  CalendarMonth as CalendarIcon,
  ShowChart as ChartIcon,
  InfoOutlined as InfoIcon,
  CheckCircle as SafeIcon,
  Warning as DangerIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import { motion } from 'framer-motion';

const BreakEvenPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('1');
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [breakEvenData, setBreakEvenData] = useState<any>(null);

  useEffect(() => {
    // Simulated initial load
    setTimeout(() => {
      setBreakEvenData({
        totalFixedCosts: 45000,
        totalVariableCosts: 62000,
        totalRevenue: 125000,
        breakEvenRevenue: 85000,
        breakEvenUnits: 42,
        currentProgress: 74, // % of the month passed
        profitMargin: 14.4
      });
      setLoading(false);
    }, 1000);
  }, [selectedBranch]);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { 
      type: 'line', 
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: { curve: 'straight', width: [3, 3, 2] },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.warning.main],
    xaxis: { 
      categories: ['0%', '25%', '50%', '75%', '100%'],
      title: { text: 'Progresso do Período (%)', style: { fontWeight: 700 } }
    },
    yaxis: {
      labels: { formatter: (val) => `R$ ${val.toLocaleString()}` }
    },
    markers: { size: 5 },
    tooltip: { y: { formatter: (val) => `R$ ${val.toLocaleString()}` } },
    legend: { position: 'top', fontWeight: 700 }
  };

  const chartSeries = breakEvenData ? [
    { name: 'Receita Real', data: [0, 30000, 65000, 95000, 125000] },
    { name: 'Custos Totais', data: [45000, 60000, 75000, 90000, 107000] },
    { name: 'Ponto de Equilíbrio', data: [85000, 85000, 85000, 85000, 85000] }
  ] : [];

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress thickness={5} size={60} />
    </Box>
  );

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'success.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <BalanceIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'success.main', letterSpacing: 2 }}>
              SAÚDE FINANCEIRA
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Ponto de Equilíbrio
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Saiba exatamente quanto você precisa vender para cobrir seus custos e começar a lucrar.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Filial</InputLabel>
            <Select value={selectedBranch} label="Filial" onChange={(e) => setSelectedBranch(e.target.value)} sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}>
              <MenuItem value="1">Filial Matriz</MenuItem>
              <MenuItem value="2">Filial Barra</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Key Metrics */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: 'background.paper' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary">Receita de Equilíbrio</Typography>
                <Typography variant="h4" fontWeight={900} sx={{ mt: 1, mb: 1 }}>
                  R$ {breakEvenData.breakEvenRevenue.toLocaleString()}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <SafeIcon color="success" sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={700} color="success.main">VOCÊ ATINGIU ESTA META!</Typography>
                </Box>
              </CardContent>
            </Card>

            <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Resumo de Custos</Typography>
              <Stack spacing={2.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.light' }}><BankIcon sx={{ fontSize: 16 }} /></Avatar>
                    <Typography variant="body2" fontWeight={700}>Custos Fixos</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={800}>R$ {breakEvenData.totalFixedCosts.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.light' }}><TrendingUp sx={{ fontSize: 16 }} /></Avatar>
                    <Typography variant="body2" fontWeight={700}>Custos Variáveis</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={800}>R$ {breakEvenData.totalVariableCosts.toLocaleString()}</Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={900}>Total Geral</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="error.main">R$ {(breakEvenData.totalFixedCosts + breakEvenData.totalVariableCosts).toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Paper>

            <Card sx={{ borderRadius: '24px', bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800 }}>Margem de Segurança</Typography>
                <Typography variant="h4" fontWeight={900}>+{breakEvenData.profitMargin}%</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>Receita acima do ponto de equilíbrio.</Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Chart Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Gráfico de Intersecção</Typography>
                <Typography variant="caption" color="text.secondary">Acompanhamento do lucro acumulado vs. custos operacionais</Typography>
              </Box>
              <Chip icon={<ChartIcon />} label="LIVE DATA" size="small" variant="outlined" sx={{ fontWeight: 800 }} />
            </Box>
            
            <Box sx={{ minHeight: 400 }}>
              <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={400} />
            </Box>

            <Box mt={4} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '16px' }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon fontSize="small" color="primary" /> Insight de Operação
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.5}>
                O Ponto de Equilíbrio foi atingido no dia <strong>18 deste mês</strong>. Todas as vendas a partir desta data contribuem diretamente para o lucro líquido da filial.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BreakEvenPage;