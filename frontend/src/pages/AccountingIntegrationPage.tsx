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
  Avatar,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import { 
  AccountBalance as AccountingIcon, 
  CheckCircle, 
  Sync as SyncIcon, 
  ReceiptLong as InvoiceIcon,
  Timeline as LogIcon,
  Settings as SettingsIcon,
  CloudDone as CloudIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  AutoFixHigh as AutoIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const AccountingIntegrationPage: React.FC = () => {
  const theme = useTheme();
  const [integrationStatus, setIntegrationStatus] = useState<any>({ status: 'active', software: 'OMIE ERP', lastSync: new Date() });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const { token } = useAuth();

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setSyncLogs(prev => [{ msg, type, time: moment().format('HH:mm:ss') }, ...prev.slice(0, 14)]);
  };

  const handleSync = async (type: string) => {
    setIsSyncing(true);
    setSyncProgress(0);
    addLog(`Iniciando reconciliação de ${type}...`);
    
    // Simulate steps
    const steps = [`Validando formato das NFs...`, `Transmitindo dados para ${integrationStatus.software}...`, `Aguardando confirmação de recebimento...` ];
    
    for (let i = 0; i < steps.length; i++) {
      addLog(steps[i]);
      setSyncProgress((i + 1) * 33);
      await new Promise(r => setTimeout(r, 800));
    }
    
    addLog(`${type} sincronizadas com sucesso. Comprovante #RC${Math.floor(Math.random()*10000)} gerado.`, 'success');
    setIsSyncing(false);
    setSyncProgress(0);
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <AccountingIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
              RECONCILIAÇÃO FISCAL
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Integração Contábil
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Sincronize vendas, despesas e impostos com seu escritório de contabilidade em tempo real.
          </Typography>
        </Box>
        <Chip icon={<CloudIcon />} label="CLOUD SYNC ACTIVE" color="primary" sx={{ fontWeight: 900, borderRadius: '8px', px: 1 }} />
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: Operacional */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} mb={4}>Ações de Sincronização</Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card elevation={0} sx={{ borderRadius: '20px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar sx={{ bgcolor: 'white', color: 'primary.main', border: '1px solid', borderColor: 'divider' }}>
                          <InvoiceIcon />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={800}>Vendas & Receitas</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={3}>124 NFs prontas para envio.</Typography>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={() => handleSync('vendas')}
                        disabled={isSyncing}
                        sx={{ borderRadius: '12px', fontWeight: 700 }}
                      >
                        Enviar p/ Contábil
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card elevation={0} sx={{ borderRadius: '20px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar sx={{ bgcolor: 'white', color: 'secondary.main', border: '1px solid', borderColor: 'divider' }}>
                          <AutoIcon />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={800}>Despesas & Pagos</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={3}>Fluxo de caixa consolidado.</Typography>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => handleSync('despesas')}
                        disabled={isSyncing}
                        sx={{ borderRadius: '12px', fontWeight: 700 }}
                      >
                        Sincronizar Gastos
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {isSyncing && (
                <Box mt={4}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" fontWeight={800}>PROCESSANDO TRANSMISSÃO...</Typography>
                    <Typography variant="caption" fontWeight={800}>{syncProgress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={syncProgress} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Configuração do Endpoint</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField fullWidth label="URL do Gateway Contábil" value="https://api.omie.com.br/v1/accounting" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="Versão API" value="v4.2" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2}>
                    <Button variant="text" startIcon={<SettingsIcon />} sx={{ fontWeight: 700 }}>Configurações Avançadas</Button>
                    <Button variant="text" startIcon={<ExportIcon />} sx={{ fontWeight: 700 }}>Download Mapas Fiscais</Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        {/* Lado Direito: Status e Logs */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3} height="100%">
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'primary.main', color: 'white', boxShadow: '0 10px 30px rgba(25, 118, 210, 0.2)' }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Sistema de Destino</Typography>
              <Box display="flex" alignItems="center" gap={2} mt={2}>
                <CheckCircle sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight={900}>{integrationStatus.software}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Conexão estabelecida via OAuth 2.0</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#1e1e1e', color: '#d4d4d4', flexGrow: 1, minHeight: 450, display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LogIcon sx={{ color: '#4caf50' }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#fff' }}>Accounting Data Stream</Typography>
                </Box>
                <IconButton size="small" onClick={() => setSyncLogs([])} sx={{ color: 'inherit', opacity: 0.5 }}><HistoryIcon fontSize="small" /></IconButton>
              </Box>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <AnimatePresence>
                  {syncLogs.length === 0 ? (
                    <Typography color="rgba(255,255,255,0.3)" variant="caption">Console em espera...</Typography>
                  ) : (
                    syncLogs.map((log, i) => (
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

export default AccountingIntegrationPage;