import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Avatar, 
  ListItemAvatar,
  Stack,
  alpha,
  useTheme,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import { 
  FaTasks, 
  FaTools, 
  FaChartLine, 
  FaCalendarCheck, 
  FaChevronRight, 
  FaClock, 
  FaStar,
  FaRocket
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { 
  FaTasks, 
  FaTools, 
  FaChartLine, 
  FaCalendarCheck, 
  FaChevronRight, 
  FaClock, 
  FaStar,
  FaRocket,
  FaCloudSun,
  FaLightbulb,
  FaHistory
} from 'react-icons/fa';

import { 
  FaTasks, 
  FaTools, 
  FaChartLine, 
  FaCalendarCheck, 
  FaChevronRight, 
  FaClock, 
  FaStar,
  FaRocket,
  FaCloudSun,
  FaLightbulb,
  FaHistory,
  FaExclamationTriangle,
  FaBirthdayCake,
  FaTicketAlt
} from 'react-icons/fa';

const UserDashboardPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* 3.4 Briefing Matinal & 3.2 Clima & 3.14 Aniversariantes */}
      <Grid container spacing={3} mb={5}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '24px', height: '100%', bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                <Typography variant="subtitle2" fontWeight={400} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaLightbulb color={theme.palette.warning.main} /> Briefing Matinal
                </Typography>
                <Stack spacing={1}>
                    <Typography variant="body2" fontWeight={400}>• 4 OS aguardando peças há mais de 2 dias.</Typography>
                    <Typography variant="body2" fontWeight={400}>• Sua meta de vendas está em 85%.</Typography>
                    <Box display="flex" alignItems="center" gap={1} color="secondary.main">
                        <FaBirthdayCake size={12} />
                        <Typography variant="body2" fontWeight={400}>2 clientes fazem aniversário hoje!</Typography>
                    </Box>
                </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: '24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <FaCloudSun size={32} color={theme.palette.info.main} style={{ marginBottom: 8 }} />
                <Typography variant="h5" fontWeight={400}>28°C</Typography>
                <Typography variant="caption" color="text.secondary">Rio de Janeiro, RJ</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: '24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `2px solid ${theme.palette.error.main}` }}>
                <FaExclamationTriangle size={32} color={theme.palette.error.main} style={{ marginBottom: 8 }} />
                <Typography variant="h6" fontWeight={400} color="error">AUDITORIA</Typography>
                <Typography variant="caption" color="text.secondary">3 Pendências</Typography>
            </Paper>
          </Grid>
      </Grid>

      <Grid container spacing={3}>
        
        {/* 3.1 Kanban Pessoal & 3.16 Status Tickets */}
        <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
                <Paper sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.palette.divider}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight={400} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <FaTasks color={theme.palette.primary.main} /> Minhas Tarefas
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip icon={<FaTicketAlt />} label="2 Tickets Abertos" size="small" variant="outlined" color="info" />
                            <Button size="small" variant="outlined" sx={{ borderRadius: '10px' }}>Nova</Button>
                        </Stack>
                    </Stack>
                    {/* ... */}
                    
                    <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                        {['To-Do', 'Fazendo', 'Pronto'].map((status) => (
                            <Box key={status} sx={{ minWidth: 200, bgcolor: 'action.hover', p: 1.5, borderRadius: '16px' }}>
                                <Typography variant="caption" fontWeight={400} sx={{ opacity: 0.6, mb: 1, display: 'block' }}>{status.toUpperCase()}</Typography>
                                <Paper sx={{ p: 1.5, borderRadius: '12px', mb: 1, cursor: 'grab' }}>
                                    <Typography variant="caption" fontWeight={400}>Limpar Bancada</Typography>
                                </Paper>
                            </Box>
                        ))}
                    </Stack>
                </Paper>

                {/* 3.10 Cronômetro de Almoço */}
                <Paper sx={{ p: 3, borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <FaClock color={theme.palette.info.main} />
                        <Box>
                            <Typography variant="subtitle2" fontWeight={400}>Controle de Intervalo</Typography>
                            <Typography variant="caption" color="text.secondary">Iniciado há 15m</Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" color="info" size="small" sx={{ borderRadius: '8px' }}>Finalizar Pausa</Button>
                </Paper>

                {/* 3.15 Calculadora de Ganhos & 3.12 Frases */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                            <Typography variant="subtitle2" fontWeight={400} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaDollarSign color={theme.palette.success.main} /> Estimativa de Ganhos (Hoje)
                            </Typography>
                            <Typography variant="h4" fontWeight={400} color="success.main">R$ 142,50</Typography>
                            <Typography variant="caption" color="text.secondary">Comissões acumuladas nas últimas 8h</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '24px', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                "Excelência não é um ato, mas um hábito." <br/><strong>— Aristóteles</strong>
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* 3.11 Itens Recentes */}
                <Paper sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" fontWeight={400} mb={2}>Acessados Recentemente</Typography>
                    <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                        {[
                            { name: 'iPhone 11', type: 'Produto' },
                            { name: 'João Silva', type: 'Cliente' },
                            { name: 'Tela iP13', type: 'Peça' },
                        ].map((item, i) => (
                            <Chip 
                                key={i} 
                                label={item.name} 
                                variant="outlined" 
                                size="small" 
                                sx={{ borderRadius: '8px', fontWeight: 400 }} 
                                onClick={() => {}}
                            />
                        ))}
                    </Stack>
                </Paper>
            </Stack>
        </Grid>

        {/* Direita: Gamificação e Atalhos */}
        <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
                <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: theme.palette.primary.main, color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}><FaRocket size={120} /></Box>
                    <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>NÍVEL ATUAL</Typography>
                    <Typography variant="h2" fontWeight={400}>12</Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>Faltam 450 XP para o Lvl 13</Typography>
                    <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 400, borderRadius: '12px', '&:hover': { bgcolor: alpha('#fff', 0.9) } }} component={Link} to="/gamification">Ver Ranking</Button>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: '24px' }}>
                    <Typography variant="subtitle2" fontWeight={400} mb={2}>Acesso Rápido</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Button fullWidth variant="outlined" sx={{ py: 2, flexDirection: 'column', gap: 1, borderRadius: '16px' }} component={Link} to="/pos">
                                <FaRocket /> <Typography variant="caption" fontWeight={400}>Vender</Typography>
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth variant="outlined" sx={{ py: 2, flexDirection: 'column', gap: 1, borderRadius: '16px' }} component={Link} to="/tech-bench">
                                <FaTools /> <Typography variant="caption" fontWeight={400}>Bancada</Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Stack>
        </Grid>

      </Grid>
    </Box>
  );
};

export default UserDashboardPage;

