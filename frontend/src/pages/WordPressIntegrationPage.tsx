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
  LinearProgress,
  Switch
} from '@mui/material';
import { 
  Language as WordPressIcon, 
  CheckCircle, 
  Sync as SyncIcon, 
  ShoppingBag as StoreIcon,
  Public as WebIcon,
  Timeline as LogIcon,
  Settings as SettingsIcon,
  CloudDone as CloudIcon,
  Security as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const WordPressIntegrationPage: React.FC = () => {
  const theme = useTheme();
  const [wpStatus, setWpStatus] = useState<any>({ status: 'online', platform: 'WooCommerce 8.2', lastCheck: new Date() });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [wpLogs, setWpLogs] = useState<any[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const { token } = useAuth();

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setWpLogs(prev => [{ msg, type, time: moment().format('HH:mm:ss') }, ...prev.slice(0, 14)]);
  };

  const handleSync = async (type: string) => {
    setIsSyncing(true);
    setSyncProgress(0);
    addLog(`Iniciando sincronização de ${type}...`);
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 20) {
      setSyncProgress(i);
      await new Promise(r => setTimeout(r, 400));
    }
    
    addLog(`${type} sincronizados com sucesso.`, 'success');
    setIsSyncing(false);
    setSyncProgress(0);
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: '#21759b', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <WordPressIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#21759b', letterSpacing: 2 }}>
              E-COMMERCE BRIDGE
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            WordPress Integration
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Conecte sua loja Redecell ao WooCommerce para sincronizar estoque e pedidos automaticamente.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Chip icon={<WebIcon />} label="SITE ONLINE" color="success" sx={{ fontWeight: 900, borderRadius: '8px', px: 1 }} />
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Coluna Esquerda: Status e Sync */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} mb={4}>Painel de Sincronização</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'white', color: 'primary.main', margin: '0 auto 16px', border: '1px solid', borderColor: 'divider' }}>
                      <StoreIcon />
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={800}>Produtos & Estoque</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>42 itens pendentes</Typography>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => handleSync('produtos')}
                      disabled={isSyncing}
                      sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                      Sincronizar Agora
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'white', color: 'secondary.main', margin: '0 auto 16px', border: '1px solid', borderColor: 'divider' }}>
                      <CloudIcon />
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={800}>Pedidos & Vendas</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>Monitoramento em tempo real</Typography>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={() => handleSync('pedidos')}
                      disabled={isSyncing}
                      sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                      Buscar Pedidos
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {isSyncing && (
                <Box mt={4}>
                  <Typography variant="caption" fontWeight={800} gutterBottom display="block">PROGRESSO DA SINCRONIA</Typography>
                  <LinearProgress variant="determinate" value={syncProgress} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Configurações de Acesso</Typography>
              <Stack spacing={3}>
                <TextField fullWidth label="URL do Site WordPress" placeholder="https://seu-ecommerce.com" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Consumer Key" type="password" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Consumer Secret" type="password" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                </Grid>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={700}>Sincronização Automática (Webhooks)</Typography>
                  <Switch defaultChecked />
                </Box>
                <Button variant="contained" sx={{ borderRadius: '12px', py: 1.5, fontWeight: 800 }}>Salvar Configurações</Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Coluna Direita: Status e Logs */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={3} height="100%">
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#21759b', color: 'white' }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Status da Conexão</Typography>
              <Box display="flex" alignItems="center" gap={2} mt={2}>
                <CheckCircle sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight={900}>CONECTADO</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>WooCommerce 8.2 • REST API v3</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#1e1e1e', color: '#d4d4d4', flexGrow: 1, minHeight: 400 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LogIcon sx={{ color: '#4caf50' }} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#fff' }}>Sync Activity Console</Typography>
              </Box>
              <Box sx={{ height: 400, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <AnimatePresence>
                  {wpLogs.length === 0 ? (
                    <Typography color="rgba(255,255,255,0.3)" variant="caption">Aguardando atividades...</Typography>
                  ) : (
                    wpLogs.map((log, i) => (
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

export default WordPressIntegrationPage;