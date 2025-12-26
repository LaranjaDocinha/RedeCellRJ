import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Chip, 
  Paper, 
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Avatar,
  Divider,
  Fade,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle, 
  Error as ErrorIcon, 
  Warning, 
  Speed, 
  Storage, 
  Memory, 
  Dns,
  CloudDone,
  Router,
  MonitorHeart,
  History,
  Security,
  Bolt
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { motion, AnimatePresence } from 'framer-motion';

const PulsingIndicator: React.FC<{ color: string }> = ({ color }) => (
  <motion.div
    animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    style={{ 
      width: 12, 
      height: 12, 
      borderRadius: '50%', 
      backgroundColor: color,
      boxShadow: `0 0 8px ${color}` 
    }}
  />
);

const SystemHealthPage: React.FC = () => {
  const theme = useTheme();
  const [realTimeMemory, setRealTimeMemory] = useState<number[]>(Array(20).fill(400));
  
  const { data: healthData, isLoading, error } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const response = await axios.get('/api/health');
      return response.data;
    },
    refetchInterval: 3000,
  });

  // Simulate dynamic charts
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMemory(prev => {
        const next = [...prev.slice(1), 400 + Math.random() * 50];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !healthData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { 
      type: 'area', 
      toolbar: { show: false },
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } }
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: { 
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } 
    },
    colors: [theme.palette.primary.main],
    tooltip: { enabled: false }
  };

  const services = [
    { name: 'Gateway API', status: 'active', latency: '42ms', icon: <Router />, color: '#4caf50' },
    { name: 'Auth Service', status: 'active', latency: '15ms', icon: <Security />, color: '#4caf50' },
    { name: 'Database (PostgreSQL)', status: healthData?.services?.database === 'connected' ? 'active' : 'error', latency: '5ms', icon: <Storage />, color: healthData?.services?.database === 'connected' ? '#4caf50' : '#f44336' },
    { name: 'Redis Cache', status: 'active', latency: '2ms', icon: <Bolt />, color: '#4caf50' },
    { name: 'Worker (Background Jobs)', status: 'active', latency: 'N/A', icon: <CloudDone />, color: '#4caf50' },
  ];

  const recentIncidents = [
    { id: 1, type: 'info', msg: 'Backup diário concluído com sucesso', time: 'Há 2 horas' },
    { id: 2, type: 'warning', msg: 'Latência elevada detectada na API Gateway', time: 'Há 5 horas' },
    { id: 3, type: 'error', msg: 'Falha de conexão temporária no serviço de email', time: 'Há 12 horas' },
  ];

  return (
    <Box p={4} sx={{ maxWidth: 1600, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px', color: 'text.primary' }}>
            System Health
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5} mt={1}>
            <PulsingIndicator color="#4caf50" />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Todos os sistemas operacionais. Última atualização: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        <Chip 
          icon={<MonitorHeart />} 
          label="GOD MODE ACTIVE" 
          color="primary" 
          sx={{ fontWeight: 900, borderRadius: '8px', px: 1 }} 
        />
      </Box>

      <Grid container spacing={3}>
        {/* Main Stat Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" fontWeight={700}>Server Uptime</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>99.98%</Typography>
              <Box mt={2}>
                <LinearProgress variant="determinate" value={99.9} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Online há 42 dias, 5 horas</Typography>
            </CardContent>
            <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.05 }}>
              <Speed sx={{ fontSize: 120 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" fontWeight={700}>System Load (CPU)</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>12%</Typography>
              <Box mt={1} height={60}>
                <ReactApexChart options={chartOptions} series={[{ data: [10, 15, 8, 12, 20, 15, 12] }]} type="area" height={60} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" fontWeight={700}>RAM Usage</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>428 MB</Typography>
              <Box mt={1} height={60}>
                <ReactApexChart options={chartOptions} series={[{ data: realTimeMemory }]} type="area" height={60} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderRadius: '24px', bgcolor: 'primary.main', color: 'white', boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>Total Requests (24h)</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>1.2M</Typography>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>+15% em relação a ontem</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Services Status List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Component Status</Typography>
            <List>
              {services.map((s, idx) => (
                <React.Fragment key={s.name}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'action.hover', color: s.color, borderRadius: '12px' }}>
                        {s.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography fontWeight={700}>{s.name}</Typography>}
                      secondary="Cloud Infrastructure (redercell-core-01)"
                    />
                    <Box textAlign="right" mr={4}>
                      <Typography variant="body2" fontWeight={700}>{s.latency}</Typography>
                      <Typography variant="caption" color="text.secondary">LATENCY</Typography>
                    </Box>
                    <Chip 
                      label={s.status.toUpperCase()} 
                      sx={{ 
                        bgcolor: `${s.color}15`, 
                        color: s.color, 
                        fontWeight: 900, 
                        fontSize: '0.65rem',
                        borderRadius: '6px'
                      }} 
                    />
                  </ListItem>
                  {idx < services.length - 1 && <Divider variant="inset" component="li" sx={{ opacity: 0.5 }} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Incidents & Timeline */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <History color="action" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Incidents</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentIncidents.map((incident) => (
                <Box 
                  key={incident.id} 
                  sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    border: '1px solid', 
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateX(5px)', borderColor: 'primary.main' }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Chip 
                      label={incident.type.toUpperCase()} 
                      size="small" 
                      color={incident.type as any} 
                      sx={{ fontSize: '0.6rem', height: 18, fontWeight: 900 }} 
                    />
                    <Typography variant="caption" color="text.secondary">{incident.time}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{incident.msg}</Typography>
                </Box>
              ))}
            </Box>
            <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
              Ver Histórico Completo
            </Button>
          </Paper>
        </Grid>

        {/* Technical Data Raw */}
        <Grid item xs={12}>
          <Accordion elevation={0} sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'divider', borderRadius: '16px !important' }}>
            <AccordionSummary expandIcon={<Box sx={{ color: 'primary.main', fontWeight: 800, fontSize: '0.8rem' }}>EXPAND RAW DATA</Box>}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Telemetry Raw JSON Payload</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Card sx={{ bgcolor: '#1e1e1e', borderRadius: '12px', p: 2 }}>
                <pre style={{ margin: 0, color: '#00ff00', fontSize: '0.8rem', overflow: 'auto' }}>
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </Card>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

// Simple Accordion components since I'm using MUI
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

export default SystemHealthPage;