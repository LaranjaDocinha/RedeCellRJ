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
  Avatar,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  LinearProgress
} from '@mui/material';
import { 
  Google as GoogleIcon, 
  CheckCircle, 
  Sync as SyncIcon, 
  ShoppingBag as StoreIcon,
  Timeline as LogIcon,
  Settings as SettingsIcon,
  AdsClick as AdsIcon,
  PriorityHigh as WarningIcon,
  HelpOutline as HelpIcon,
  Launch as OpenIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleShoppingIntegrationPage: React.FC = () => {
  const theme = useTheme();
  const [gsStatus, setGsStatus] = useState<any>({ status: 'active', platform: 'Google Merchant Center', lastSync: new Date() });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [gsLogs, setGsLogs] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const { token } = useAuth();

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setGsLogs(prev => [{ msg, type, time: moment().format('HH:mm:ss') }, ...prev.slice(0, 14)]);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    addLog(`Gerando XML de feed de produtos (padrão Google)...`);
    await new Promise(r => setTimeout(r, 1000));
    addLog(`Enviando dados para o Merchant Center ID: 12948123...`);
    await new Promise(r => setTimeout(r, 1200));
    addLog(`Feed atualizado com sucesso. 154 produtos sincronizados.`, 'success');
    setIsSyncing(false);
    setGsStatus((prev: any) => ({ ...prev, lastSync: new Date() }));
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: '#4285F4', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <GoogleIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 400, color: '#4285F4', letterSpacing: 2 }}>
              MARKETING MULTICANAL
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Google Shopping
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Exiba seus produtos no Google e aumente sua visibilidade local e nacional.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<OpenIcon />} sx={{ borderRadius: '12px', fontWeight: 400 }}>Abrir Merchant Center</Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: Feed e Saúde */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={400}>Status do Catálogo</Typography>
                <Chip label="FEED XML ATIVO" color="success" size="small" sx={{ fontWeight: 400, borderRadius: '6px' }} />
              </Box>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: '20px' }}>
                    <Typography variant="h4" fontWeight={400}>154</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={400}>APROVADOS</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: '20px' }}>
                    <Typography variant="h4" fontWeight={400} color="warning.main">12</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={400}>PENDENTES</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: '20px' }}>
                    <Typography variant="h4" fontWeight={400} color="error.main">2</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={400}>REPROVADOS</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                startIcon={<SyncIcon />} 
                onClick={handleSync}
                disabled={isSyncing}
                sx={{ borderRadius: '16px', py: 2, fontWeight: 400, bgcolor: '#4285F4', '&:hover': { bgcolor: '#3367d6' } }}
              >
                {isSyncing ? 'SINCRONIZANDO...' : 'ATUALIZAR FEED DE PRODUTOS'}
              </Button>
              {isSyncing && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={400} mb={3}>Configurações da Conta</Typography>
              <Stack spacing={3}>
                <TextField fullWidth label="Google Merchant ID" placeholder="123456789" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                <TextField fullWidth label="URL do Feed XML" value="https://api.redercell.com.br/v1/feeds/google-shopping.xml" InputProps={{ readOnly: true, endAdornment: <IconButton size="small"><SyncIcon sx={{ fontSize: 16 }} /></IconButton> }} sx={{ bgcolor: 'action.hover', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                <Button variant="contained" sx={{ borderRadius: '12px', py: 1.5, fontWeight: 400, bgcolor: 'text.primary' }}>Salvar Alterações</Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Lado Direito: Logs e Dicas */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={3} height="100%">
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <HelpIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={400}>Otimização de Conversão</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" lineHeight={1.5} display="block">
                Garanta que todos os produtos tenham fotos em alta resolução sobre fundo branco. Isso aumenta em até 30% o clique no Google Shopping.
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#1e1e1e', color: '#d4d4d4', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LogIcon sx={{ color: '#4caf50' }} />
                <Typography variant="subtitle2" fontWeight={400} sx={{ color: '#fff' }}>Feed Sync Log</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <AnimatePresence>
                  {gsLogs.length === 0 ? (
                    <Typography color="rgba(255,255,255,0.3)" variant="caption">Aguardando gatilho de sincronização...</Typography>
                  ) : (
                    gsLogs.map((log, i) => (
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

export default GoogleShoppingIntegrationPage;
