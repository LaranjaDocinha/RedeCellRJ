import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Avatar,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  Card,
  CardActionArea,
  CardContent
} from '@mui/material';
import { 
  CellTower as CarrierIcon, 
  CheckCircle, 
  Error as ErrorIcon, 
  Bolt, 
  Add as AddIcon,
  Timeline as LogIcon,
  SimCard as ChipIcon,
  SignalCellularAlt as SignalIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const CarrierApiPage: React.FC = () => {
  const theme = useTheme();
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState('Vivo');

  const { token } = useAuth();

  const carriers = [
    { name: 'Vivo', color: '#660099', logo: 'V' },
    { name: 'Claro', color: '#ff0000', logo: 'C' },
    { name: 'TIM', color: '#003399', logo: 'T' },
  ];

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setApiLogs(prev => [{ msg, type, time: moment().format('HH:mm:ss') }, ...prev.slice(0, 14)]);
  };

  useEffect(() => {
    if (selectedCarrier) {
      setLoadingStatus(true);
      setTimeout(() => {
        setApiStatus({ status: 'active', lastCheck: new Date() });
        setLoadingStatus(false);
      }, 800);
    }
  }, [selectedCarrier]);

  const handleAction = async (action: string) => {
    addLog(`Solicitando ${action} via API ${selectedCarrier}...`);
    await new Promise(r => setTimeout(r, 1500));
    addLog(`${action} processado com sucesso pelo gateway.`, 'success');
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <CarrierIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 400, color: 'primary.main', letterSpacing: 2 }}>
              CONECTIVIDADE MÓVEL
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Integração Operadoras
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Ative chips, planos e consulte status de linhas diretamente pelo painel Redecell.
          </Typography>
        </Box>
        <Chip icon={<Bolt />} label="GATEWAY ATIVO" color="success" sx={{ fontWeight: 400, borderRadius: '8px', px: 1 }} />
      </Box>

      <Grid container spacing={4}>
        {/* Seleção de Operadora */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {carriers.map((c) => (
              <Grid item xs={12} sm={4} key={c.name}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: '20px', 
                    border: '2px solid',
                    borderColor: selectedCarrier === c.name ? c.color : 'divider',
                    bgcolor: selectedCarrier === c.name ? `${c.color}05` : 'background.paper',
                    transition: '0.3s'
                  }}
                >
                  <CardActionArea onClick={() => setSelectedCarrier(c.name)} sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: c.color, fontWeight: 400, width: 48, height: 48 }}>{c.logo}</Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6" fontWeight={400}>{c.name}</Typography>
                        <Typography variant="caption" color="text.secondary">API v4.2 • REST</Typography>
                      </Box>
                      {selectedCarrier === c.name && <CheckCircle sx={{ color: c.color }} />}
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Lado Esquerdo: Ações e Config */}
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={400} mb={3}>Ações Disponíveis</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<ChipIcon />} 
                    onClick={() => handleAction('Ativação de Chip')}
                    sx={{ borderRadius: '12px', py: 2, fontWeight: 400, borderStyle: 'dashed' }}
                  >
                    Ativar Novo Chip
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<SignalIcon />} 
                    onClick={() => handleAction('Ativação de Plano')}
                    sx={{ borderRadius: '12px', py: 2, fontWeight: 400, borderStyle: 'dashed' }}
                  >
                    Ativar Plano/Combo
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<SendIcon />} 
                    onClick={() => handleAction('Recarga Avulsa')}
                    sx={{ borderRadius: '12px', py: 2, fontWeight: 400 }}
                  >
                    Realizar Recarga Expressa
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={400}>Credenciais de Integração</Typography>
                <IconButton size="small"><SettingsIcon /></IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth disabled label="API Key" value="sk_live_********************" size="small" variant="filled" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth disabled label="Merchant ID" value="RC_VIVO_9921" size="small" variant="filled" />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        {/* Lado Direito: Status e Logs */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="subtitle2" fontWeight={400} gutterBottom>Status do Serviço</Typography>
              {loadingStatus ? (
                <CircularProgress color="inherit" size={24} sx={{ my: 2 }} />
              ) : (
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                  <CheckCircle sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={400}>OPERACIONAL</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Última resposta: 142ms</Typography>
                  </Box>
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#1e1e1e', color: '#d4d4d4', height: '100%', minHeight: 400 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LogIcon sx={{ color: '#4caf50' }} />
                <Typography variant="subtitle2" fontWeight={400} sx={{ color: '#fff' }}>Eventos de Conectividade</Typography>
              </Box>
              <Box sx={{ height: 350, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <AnimatePresence>
                  {apiLogs.length === 0 ? (
                    <Typography color="rgba(255,255,255,0.3)" variant="caption">Aguardando atividades...</Typography>
                  ) : (
                    apiLogs.map((log, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                        <Typography variant="inherit" sx={{ 
                          color: log.type === 'error' ? '#f44336' : log.type === 'success' ? '#4caf50' : 'inherit',
                          mb: 0.5
                        }}>
                          <span style={{ opacity: 0.5 }}>[{log.time}]</span> {log.msg}
                        </Typography>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarrierApiPage;
