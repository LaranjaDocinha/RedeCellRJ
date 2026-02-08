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
  Divider,
  Avatar,
  IconButton,
  Chip,
  useTheme,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Smartphone as MobileIcon, 
  Sync as SyncIcon, 
  Wifi as WifiIcon, 
  WifiOff as OfflineIcon,
  Terminal as ConsoleIcon,
  PlayCircleOutline as PlayIcon,
  RestartAlt as ResetIcon,
  Security as LockIcon,
  PowerSettingsNew as PowerIcon,
  SignalCellularAlt as SignalIcon,
  BatteryFull as BatteryIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const MobileAppSimulationPage: React.FC = () => {
  const theme = useTheme();
  const [appStatus, setAppStatus] = useState<any>({ status: 'online', appVersion: '2.4.0', lastSync: new Date() });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [appLogs, setAppLogs] = useState<any[]>([]);
  const [userId, setUserId] = useState('1');
  const [isPowerOn, setIsPowerOn] = useState(true);

  const { token } = useAuth();

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setAppLogs(prev => [{ msg, type, time: moment().format('HH:mm:ss') }, ...prev.slice(0, 19)]);
  };

  const handleFetchOfflineData = async () => {
    if (!token || !userId) return;
    addLog(`Iniciando busca de pacotes offline para USER_ID: ${userId}...`);
    try {
      // Simulate API
      await new Promise(r => setTimeout(r, 1000));
      addLog(`Cache de 154 produtos e 12 clientes baixado com sucesso.`, 'success');
    } catch (error) {
      addLog(`Falha ao conectar com o serviço de sincronização.`, 'error');
    }
  };

  const handleSyncMobileData = async () => {
    if (!token) return;
    addLog(`Sincronizando transações locais com a nuvem...`);
    try {
      await new Promise(r => setTimeout(r, 1500));
      addLog(`3 vendas e 1 OS sincronizadas. Banco local limpo.`, 'success');
      setAppStatus((prev: any) => ({ ...prev, lastSync: new Date() }));
    } catch (error) {
      addLog(`Erro crítico de rede durante o upload.`, 'error');
    }
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Simulador PWA
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Teste a experiência mobile e monitore os fluxos de sincronização offline.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<ResetIcon />} onClick={() => setAppLogs([])} sx={{ borderRadius: '12px', fontWeight: 400 }}>Limpar Console</Button>
          <Button 
            variant="contained" 
            startIcon={<PlayIcon />} 
            onClick={handleSyncMobileData}
            sx={{ borderRadius: '12px', px: 3, fontWeight: 400, boxShadow: '0 10px 20px rgba(25, 118, 210, 0.2)' }}
          >
            Forçar Sync
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={6}>
        {/* Lado Esquerdo: Phone Emulator */}
        <Grid item xs={12} md={5} lg={4}>
          <Box sx={{ position: 'relative', width: 320, height: 650, margin: '0 auto' }}>
            {/* Case */}
            <Box sx={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              border: '12px solid #1e1e1e', borderRadius: '48px',
              bgcolor: '#000', boxShadow: '0 50px 100px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}>
              {/* Screen */}
              <AnimatePresence>
                {isPowerOn ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
                    {/* Status Bar */}
                    <Box sx={{ height: 40, bgcolor: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 1, color: 'white' }}>
                      <Typography variant="caption" fontWeight={400}>09:41</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <SignalIcon sx={{ fontSize: 14 }} />
                        <WifiIcon sx={{ fontSize: 14 }} />
                        <BatteryIcon sx={{ fontSize: 14 }} />
                      </Stack>
                    </Box>
                    {/* App Content */}
                    <Box p={2} sx={{ flexGrow: 1, overflowY: 'auto' }}>
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24, fontSize: '0.7rem' }}>RC</Avatar>
                        <Typography variant="body2" fontWeight={400} color="primary.main">REDECELL PDV</Typography>
                      </Box>
                      
                      <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', mb: 2 }}>
                        <Typography variant="caption" fontWeight={400} color="text.secondary">VENDA RÁPIDA</Typography>
                        <Typography variant="h6" fontWeight={400}>R$ 0,00</Typography>
                      </Paper>

                      <Typography variant="caption" fontWeight={400} sx={{ mb: 1, display: 'block' }}>REPAROS AGENDADOS</Typography>
                      <Stack spacing={1}>
                        {[1, 2].map(i => (
                          <Paper key={i} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" fontWeight={400}>#{440+i} - iPhone 13</Typography>
                            <Typography variant="caption" display="block" color="text.secondary">Tela Quebrada</Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                    {/* Bottom Nav */}
                    <Box sx={{ height: 60, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                      <SyncIcon color="primary" />
                      <HistoryIcon color="disabled" />
                      <LockIcon color="disabled" />
                    </Box>
                  </motion.div>
                ) : (
                  <Box sx={{ height: '100%', bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography color="rgba(255,255,255,0.2)" variant="caption">POWER OFF</Typography>
                  </Box>
                )}
              </AnimatePresence>
            </Box>
            {/* Buttons on hardware */}
            <Box onClick={() => setIsPowerOn(!isPowerOn)} sx={{ position: 'absolute', right: -16, top: 100, width: 4, height: 60, bgcolor: '#333', borderRadius: '0 4px 4px 0', cursor: 'pointer' }} />
          </Box>
        </Grid>

        {/* Lado Direito: Controls & Console */}
        <Grid item xs={12} md={7} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={400} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SyncIcon color="primary" /> Estado de Sincronização
                </Typography>
                <Box mt={3} display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Status Global</Typography>
                    <Chip size="small" label={appStatus.status.toUpperCase()} color="success" sx={{ fontWeight: 400, borderRadius: '6px' }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Versão Local</Typography>
                    <Typography variant="body2" fontWeight={400}>v{appStatus.appVersion}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Última Sync</Typography>
                    <Typography variant="body2" fontWeight={400}>{moment(appStatus.lastSync).fromNow()}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Button fullWidth variant="contained" onClick={handleFetchOfflineData} sx={{ borderRadius: '10px', py: 1, fontWeight: 400 }}>Atualizar Cache Offline</Button>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="h6" fontWeight={400} gutterBottom>Configurações de Teste</Typography>
                <TextField
                  fullWidth
                  label="Simular User ID"
                  size="small"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: '8px' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Use este simulador para validar como o sistema se comporta em dispositivos reais antes de publicar uma nova versão do PWA.
                </Typography>
              </Paper>
            </Grid>

            {/* Console Log */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#1e1e1e', color: '#d4d4d4', position: 'relative' }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <ConsoleIcon sx={{ color: '#4caf50' }} />
                  <Typography variant="subtitle2" fontWeight={400} sx={{ color: '#fff' }}>Debug Console</Typography>
                </Box>
                <Box sx={{ height: 250, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  <AnimatePresence>
                    {appLogs.length === 0 ? (
                      <Typography color="rgba(255,255,255,0.3)" variant="caption">Console vazio. Aguardando eventos...</Typography>
                    ) : (
                      appLogs.map((log, i) => (
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
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MobileAppSimulationPage;
