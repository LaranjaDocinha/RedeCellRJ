import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
  useTheme,
  Button,
  IconButton,
  Tooltip,
  ListItemIcon
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  EmojiEvents as TrophyIcon, 
  MilitaryTech as MedalIcon,
  AttachMoney as MoneyIcon,
  Timeline as ChartIcon,
  History as HistoryIcon,
  Stars as GoalIcon,
  Handyman as RepairIcon,
  ArrowForwardIos as ArrowIcon,
  WorkspacePremium as BadgeIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const MyPerformancePage: React.FC = () => {
  const theme = useTheme();
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    // Simulated Performance Data
    setTimeout(() => {
      setPerformanceData({
        totalSales: 12450.00,
        numSales: 28,
        numRepairs: 12,
        currentCommission: 845.50,
        goals: [
          { name: 'Vendas Smartphones', current: 12, target: 20, color: theme.palette.primary.main },
          { name: 'Reparos Finalizados', current: 12, target: 15, color: '#9c27b0' },
          { name: 'Ticket Médio', current: 445, target: 500, color: '#4caf50' }
        ],
        badges: [
          { name: 'Top Seller', date: 'Há 2 dias', icon: <TrophyIcon /> },
          { name: 'Expert Técnico', date: 'Há 1 semana', icon: <BadgeIcon /> }
        ],
        commissions: [
          { id: 1, saleId: '102', amount: 45.50, date: new Date(), status: 'pending' },
          { id: 2, saleId: '098', amount: 15.00, date: moment().subtract(1, 'day'), status: 'approved' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const salesChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: [theme.palette.primary.main],
    xaxis: { categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], labels: { style: { fontWeight: 700 } } },
    yaxis: { show: false },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `R$ ${val.toLocaleString()}` } }
  };

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
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <TrendingUp />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
              SUA PERFORMANCE
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Meu Cockpit
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Acompanhe seus números, metas e comissões acumuladas no mês.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<HistoryIcon />} sx={{ borderRadius: '12px', fontWeight: 700 }}>Histórico Completo</Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: Stats e Gráfico */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            {/* Top Stat Cards */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary">Vendas (Mês)</Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>R$ {performanceData.totalSales.toLocaleString()}</Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1} color="success.main">
                      <TrendingUp sx={{ fontSize: 16 }} />
                      <Typography variant="caption" fontWeight={800}>+12% vs mês anterior</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary">Reparos</Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>{performanceData.numRepairs}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>Média de 1.2/dia</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ borderRadius: '24px', bgcolor: 'primary.main', color: 'white', boxShadow: '0 10px 30px rgba(25, 118, 210, 0.2)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800 }}>Sua Carteira</Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>R$ {performanceData.currentCommission.toFixed(2)}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 700 }}>Comissão Estimada</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Sales Trend Chart */}
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={800}>Volume de Vendas Semanal</Typography>
                <Chip label="LIVE" size="small" variant="outlined" color="primary" sx={{ fontWeight: 900 }} />
              </Box>
              <Box sx={{ height: 300 }}>
                <ReactApexChart options={salesChartOptions} series={[{ name: 'Vendas', data: [1200, 1900, 1500, 2800, 2400, 3100] }]} type="area" height={300} />
              </Box>
            </Paper>

            {/* Recent Commissions */}
            <Paper sx={{ borderRadius: '32px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box p={3} borderBottom="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={800}>Últimas Comissões</Typography>
                <Button size="small" sx={{ fontWeight: 700 }}>Ver Detalhes</Button>
              </Box>
              <List sx={{ p: 0 }}>
                {performanceData.commissions.map((c: any, idx: number) => (
                  <ListItem key={c.id} sx={{ px: 3, py: 2, borderBottom: idx < performanceData.commissions.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <ListItemIcon><Avatar sx={{ bgcolor: 'action.hover', color: 'primary.main' }}><MoneyIcon /></Avatar></ListItemIcon>
                    <ListItemText primary={<Typography fontWeight={700}>Venda #{c.saleId}</Typography>} secondary={moment(c.date).format('LLL')} />
                    <Box textAlign="right">
                      <Typography fontWeight={900} color="success.main">+ R$ {c.amount.toFixed(2)}</Typography>
                      <Chip label={c.status.toUpperCase()} size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 900 }} />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>

        {/* Lado Direito: Goals e Badges */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={4}>
            {/* Goals Card */}
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" alignItems="center" gap={1} mb={4}>
                <GoalIcon color="primary" />
                <Typography variant="h6" fontWeight={800}>Metas Ativas</Typography>
              </Box>
              <Stack spacing={4}>
                {performanceData.goals.map((goal: any) => (
                  <Box key={goal.name}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" fontWeight={700}>{goal.name}</Typography>
                      <Typography variant="caption" fontWeight={800} color="primary">{goal.current} / {goal.target}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(goal.current / goal.target) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: goal.color } }} />
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Badges Display */}
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Conquistas Recentes</Typography>
              <Grid container spacing={2}>
                {performanceData.badges.map((badge: any) => (
                  <Grid size={{ xs: 6 }} key={badge.name}>
                    <Tooltip title={`Conquistado em ${badge.date}`}>
                      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: '20px', textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                        <Avatar sx={{ width: 48, height: 48, margin: '0 auto 12px', bgcolor: 'warning.light', color: 'warning.dark' }}>
                          {badge.icon}
                        </Avatar>
                        <Typography variant="caption" fontWeight={800} display="block">{badge.name}</Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Team Ranking Preview */}
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'primary.900', color: 'white' }}>
              <Typography variant="subtitle2" fontWeight={800} mb={2}>Ranking da Filial</Typography>
              <Stack spacing={2}>
                {[
                  { pos: 1, name: 'Ana Paula', xp: '15.2k' },
                  { pos: 2, name: 'Marcos P.', xp: '14.8k' },
                  { pos: 3, name: 'Juliana D.', xp: '13.1k' },
                  { pos: 4, name: 'Você', xp: '12.4k', current: true },
                ].map((r) => (
                  <Box key={r.pos} display="flex" alignItems="center" gap={2} sx={{ opacity: r.current ? 1 : 0.7 }}>
                    <Typography variant="caption" fontWeight={900}>{r.pos}º</Typography>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: r.current ? 'secondary.main' : 'white', color: r.current ? 'white' : 'primary.main' }}>{r.name[0]}</Avatar>
                    <Typography variant="caption" fontWeight={700} sx={{ flexGrow: 1 }}>{r.name}</Typography>
                    <Typography variant="caption" fontWeight={900}>{r.xp} XP</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyPerformancePage;
