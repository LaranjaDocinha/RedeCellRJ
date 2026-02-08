import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Avatar, 
  Stack,
  useTheme,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
  Badge,
  alpha
} from '@mui/material';
import { 
  AddShoppingCart, 
  Build, 
  PersonAdd, 
  Analytics, 
  NotificationsActive,
  AccessTime,
  LightMode,
  DarkMode,
  Login,
  Logout,
  WarningAmber,
  CheckCircle,
  TrendingUp,
  Bolt,
  Sync,
  HelpOutline,
  Inventory2Outlined,
  Assessment
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import moment from 'moment';

// --- Styled Components Premium ---

const PageBackground = styled(Box)`
  min-height: 100vh;
  background: ${({ theme }) => theme.palette.mode === 'light' 
    ? 'linear-gradient(135deg, #f8faff 0%, #e0e7ff 100%)' 
    : `linear-gradient(135deg, ${theme.palette.background.default} 0%, #0f172a 100%)`};
  padding: 40px 0;
  position: relative;
`;

const GlassActionCard = styled(motion.div)<{ color?: string }>`
  background: ${({ theme }) => alpha(theme.palette.background.paper, 0.8)};
  backdrop-filter: blur(12px);
  border-radius: 32px;
  padding: 32px;
  cursor: pointer;
  border: 1px solid ${({ theme, color }) => color ? alpha(color, 0.3) : alpha(theme.palette.divider, 0.1)};
  position: relative;
  overflow: hidden;
  height: 240px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  box-sizing: border-box;
  
  &:hover {
    border-color: ${({ color }) => color || 'primary.main'};
  }
`;

const StatusPill = styled(Chip)<{ status: 'online' | 'offline' }>`
  font-weight: 400;
  font-size: 0.65rem;
  height: 22px;
  background: ${({ status, theme }) => status === 'online' ? theme.palette.success.main : theme.palette.error.main};
  color: #fff;
  border: none;
`;

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addNotification } = useNotification();
  const [time, setTime] = useState(new Date());

  // Time Clock Logic
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockLoading, setClockLoading] = useState(true);
  const [clockActionLoading, setClockActionLoading] = useState(false);

  // Fetching Vital Data for Cockpit
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['home-cockpit-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard?period=today', { headers: { 'Authorization': `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token
  });

  const fetchClockStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/time-clock/me/latest', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 200) {
        const entry = await res.json();
        setIsClockedIn(entry && entry.clock_in_time && !entry.clock_out_time);
      }
    } catch (e) { console.error(e); } finally { setClockLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchClockStatus();
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [fetchClockStatus]);

  const handleClockAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setClockActionLoading(true);
    const endpoint = isClockedIn ? '/api/time-clock/clock-out' : '/api/time-clock/clock-in';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ branchId: 1 })
      });
      if (!res.ok) throw new Error('Falha no registro');
      addNotification(`Turno ${!isClockedIn ? 'iniciado' : 'encerrado'}!`, 'success');
      fetchClockStatus();
    } catch (err: any) { addNotification(err.message, 'error'); } finally { setClockActionLoading(false); }
  };

  const greeting = useMemo(() => {
    const hr = time.getHours();
    if (hr < 12) return 'Bom dia';
    if (hr < 18) return 'Boa tarde';
    return 'Boa noite';
  }, [time]);

  // Framer Motion Variants
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <PageBackground>
      <Container maxWidth="lg">
        <motion.div variants={container} initial="hidden" animate="show">
          
          {/* Header Superior */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
            <Box component={motion.div} variants={item}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color={isClockedIn ? "success" : "error"} sx={{ '& .MuiBadge-badge': { width: 14, height: 14, borderRadius: '50%', border: `3px solid ${theme.palette.background.default}` } }}>
                  <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontWeight: 400, fontSize: '1.8rem', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
                    {user?.name?.[0].toUpperCase()}
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px', mb: 0.5 }}>
                    {greeting}, {user?.name.split(' ')[0]}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 400 }}>
                      {time.getHours() >= 18 ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" color="warning" />}
                      {moment(time).format('HH:mm')}
                    </Typography>
                    <StatusPill status={isClockedIn ? 'online' : 'offline'} label={isClockedIn ? "ONLINE" : "OFFLINE"} />
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Box component={motion.div} variants={item} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: '24px', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 4, bgcolor: 'background.paper' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400, display: 'block' }}>VENDAS HOJE</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 400, color: 'primary.main' }}>R$ {(stats?.totalSales?.mainPeriodSales || 0).toLocaleString()}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400, display: 'block' }}>OS ATIVAS</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 400 }}>08</Typography>
                </Box>
                <IconButton onClick={() => refetchStats()} size="small" sx={{ alignSelf: 'center', bgcolor: 'action.hover' }}><Sync fontSize="small" /></IconButton>
              </Paper>
            </Box>
          </Box>

          {/* Grid de Ações Rápidas - CORREÇÃO DEFINITIVA GRID V2 */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {/* Registro de Ponto */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <GlassActionCard 
                variants={item}
                whileHover={{ y: -8, boxShadow: `0 20px 40px ${isClockedIn ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.success.main, 0.2)}` }}
                onClick={handleClockAction}
                color={isClockedIn ? theme.palette.error.main : theme.palette.success.main}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: isClockedIn ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: isClockedIn ? 'error.main' : 'success.main' }}>
                    {clockActionLoading ? <CircularProgress size={24} color="inherit" /> : (isClockedIn ? <Logout fontSize="large" /> : <Login fontSize="large" />)}
                  </Box>
                  <Chip label="PONTO" size="small" sx={{ fontWeight: 400, borderRadius: '6px' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 400, mb: 1 }}>{isClockedIn ? 'Fechar Turno' : 'Abrir Turno'}</Typography>
                  <Typography variant="body2" color="text.secondary">Registro de presença</Typography>
                </Box>
              </GlassActionCard>
            </Grid>

            {/* Ações Estratégicas */}
            {[
              { label: 'PDV Master', sub: 'SHIFT + 1', icon: <AddShoppingCart fontSize="large" />, path: '/pos', color: theme.palette.primary.main, desc: 'Venda rápida' },
              { label: 'Centro Técnico', sub: 'SHIFT + 2', icon: <Build fontSize="large" />, path: '/orders', color: '#9c27b0', desc: 'Gerenciar OS' },
              { label: 'Novo Cliente', sub: 'SHIFT + 3', icon: <PersonAdd fontSize="large" />, path: '/customers', color: '#2e7d32', desc: 'Novo lead' }
            ].map((action, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <GlassActionCard 
                  variants={item}
                  whileHover={{ y: -8, boxShadow: `0 20px 40px ${alpha(action.color, 0.2)}` }}
                  onClick={() => navigate(action.path)}
                  color={action.color}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: alpha(action.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color }}>
                      {action.icon}
                    </Box>
                    <Chip label={action.sub} size="small" sx={{ fontWeight: 400, borderRadius: '6px' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 400, mb: 1 }}>{action.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{action.desc}</Typography>
                  </Box>
                </GlassActionCard>
              </Grid>
            ))}
          </Grid>

          {/* Seção de Inteligência & Urgências */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper component={motion.div} variants={item} sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}><NotificationsActive /></Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 400 }}>Ações Prioritárias</Typography>
                      <Typography variant="body2" color="text.secondary">Alertas críticos do sistema</Typography>
                    </Box>
                  </Box>
                  <Button startIcon={<Bolt />} color="warning" sx={{ fontWeight: 400 }}>Radar Ativo</Button>
                </Box>

                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.error.main, 0.02), borderColor: alpha(theme.palette.error.main, 0.1) }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ color: 'error.main' }}><WarningAmber /></Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>Ruptura de Estoque</Typography>
                        <Typography variant="caption" color="text.secondary">5 produtos em nível crítico.</Typography>
                      </Box>
                    </Stack>
                    <Button variant="contained" color="error" size="small" sx={{ borderRadius: '10px' }} onClick={() => navigate('/inventory')}>Resolver</Button>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.info.main, 0.02), borderColor: alpha(theme.palette.info.main, 0.1) }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ color: 'info.main' }}><Assessment /></Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>Orçamentos Pendentes</Typography>
                        <Typography variant="caption" color="text.secondary">12 OS aguardando aprovação.</Typography>
                      </Box>
                    </Stack>
                    <Button variant="contained" color="info" size="small" sx={{ borderRadius: '10px' }} onClick={() => navigate('/orders')}>Ver Todas</Button>
                  </Paper>
                </Stack>
              </Paper>
            </Grid>

            {/* Banner de Performance */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper 
                component={motion.div} 
                variants={item} 
                sx={{ 
                  p: 4, 
                  borderRadius: '32px', 
                  bgcolor: 'primary.main', 
                  color: '#fff',
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                  <TrendingUp sx={{ fontSize: 200 }} />
                </Box>
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 400, mb: 2 }}>Performance</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 4, lineHeight: 1.6 }}>
                    Conversão de orçamentos em 85%. Meta do mês próxima!
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" sx={{ fontWeight: 400 }}>VENDAS</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 400 }}>83% da Meta</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={83} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }} />
                  </Box>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={() => navigate('/my-performance')}
                    sx={{ bgcolor: '#fff', color: 'primary.main', fontWeight: 400, borderRadius: '14px', py: 1.5, '&:hover': { bgcolor: '#f0f0f0' } }}
                    startIcon={<Analytics />}
                  >
                    Meu Desempenho
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Footer de Status com Espaçamento Corrigido */}
          <Box sx={{ mt: 12, pb: 4, display: 'flex', justifyContent: 'center' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 6 }} alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 400 }}>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> SISTEMA OPERACIONAL
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 400 }}>
                <Inventory2Outlined sx={{ fontSize: 16, color: 'primary.main' }} /> UNIDADE: MATRIZ RJ
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 400 }}>
                <HelpOutline sx={{ fontSize: 16, color: 'secondary.main' }} /> CENTRAL DE AJUDA
              </Typography>
            </Stack>
          </Box>

        </motion.div>
      </Container>
    </PageBackground>
  );
};

export default HomePage;

