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
  Card,
  CardActionArea,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  BarChart as BIIcon, 
  CheckCircle, 
  VpnKey as KeyIcon, 
  Storage as DbIcon,
  Timeline as LogIcon,
  ContentCopy as CopyIcon,
  CloudUpload as ExportIcon,
  InfoOutlined as InfoIcon,
  Security as LockIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const BiIntegrationPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [biLogs, setBiLogs] = useState<any[]>([]);
  const [selectedBiTool, setSelectedBiTool] = useState('Power BI');
  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);

  const { token } = useAuth();

  const biTools = [
    { name: 'Power BI', color: '#f2c811', provider: 'Microsoft' },
    { name: 'Tableau', color: '#e97627', provider: 'Salesforce' },
    { name: 'Metabase', color: '#509ee3', provider: 'Open Source' },
  ];

  const availableDataSources = [
    { name: 'Vendas Consolidadas', type: 'View', updated: 'Diário' },
    { name: 'Estoque por Filial', type: 'Table', updated: 'Real-time' },
    { name: 'Fidelidade & CRM', type: 'View', updated: 'Horário' },
    { name: 'Performance Técnica', type: 'Table', updated: 'Real-time' },
  ];

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setBiLogs(prev => [{ msg, type, time: moment().format('HH:mm:ss') }, ...prev.slice(0, 14)]);
  };

  useEffect(() => {
    // Simulated initial fetch
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleGenerateCredentials = async () => {
    setLoading(true);
    addLog(`Gerando credenciais de acesso para ${selectedBiTool}...`);
    
    setTimeout(() => {
      setGeneratedCredentials({
        host: 'db.redercell.com.br',
        user: `bi_user_${Math.floor(Math.random()*1000)}`,
        pass: '••••••••••••••••',
        db: 'redercell_dw',
        port: '5432'
      });
      addLog(`Credenciais geradas com sucesso. Acesso autorizado via IP fixo.`, 'success');
      setLoading(false);
    }, 1200);
  };

  if (loading && !generatedCredentials) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: '#ff9800', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <BIIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#ff9800', letterSpacing: 2 }}>
              DATA WAREHOUSE & ANALYTICS
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Business Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Conecte suas ferramentas de análise favoritas diretamente ao nosso Data Lake seguro.
          </Typography>
        </Box>
        <Chip icon={<LockIcon />} label="END-TO-END ENCRYPTED" color="primary" sx={{ fontWeight: 900, borderRadius: '8px', px: 1 }} />
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: Config e Credenciais */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} mb={4}>Conectar Nova Ferramenta</Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {biTools.map(tool => (
                  <Grid size={{ xs: 12, sm: 4 }} key={tool.name}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        borderRadius: '20px', 
                        border: '2px solid',
                        borderColor: selectedBiTool === tool.name ? tool.color : 'divider',
                        bgcolor: selectedBiTool === tool.name ? `${tool.color}05` : 'background.paper',
                        transition: '0.3s'
                      }}
                    >
                      <CardActionArea onClick={() => setSelectedBiTool(tool.name)} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={800}>{tool.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{tool.provider}</Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                startIcon={<KeyIcon />}
                onClick={handleGenerateCredentials}
                sx={{ borderRadius: '16px', py: 2, fontWeight: 800, bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' } }}
              >
                GERAR CREDENCIAIS DE ACESSO
              </Button>

              <AnimatePresence>
                {generatedCredentials && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} mt={4}>
                    <Box sx={{ mt: 4, p: 3, borderRadius: '24px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" fontWeight={800} mb={3} display="flex" alignItems="center" gap={1}>
                        <LockIcon sx={{ fontSize: 18 }} /> Credenciais Seguras (PostgreSQL)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Host" value={generatedCredentials.host} size="small" InputProps={{ readOnly: true, endAdornment: <IconButton size="small"><CopyIcon sx={{ fontSize: 16 }} /></IconButton> }} sx={{ bgcolor: 'background.paper', borderRadius: '8px' }} /></Grid>
                        <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Porta" value={generatedCredentials.port} size="small" InputProps={{ readOnly: true }} sx={{ bgcolor: 'background.paper' }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Usuário" value={generatedCredentials.user} size="small" InputProps={{ readOnly: true }} sx={{ bgcolor: 'background.paper' }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Senha" type="password" value={generatedCredentials.pass} size="small" InputProps={{ readOnly: true }} sx={{ bgcolor: 'background.paper' }} /></Grid>
                      </Grid>
                      <Typography variant="caption" color="error.main" sx={{ mt: 2, display: 'block', fontWeight: 700 }}>
                        * Por segurança, estas credenciais expiram em 24h se não forem utilizadas.
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Fontes de Dados Disponíveis</Typography>
              <Grid container spacing={2}>
                {availableDataSources.map(ds => (
                  <Grid size={{ xs: 12, sm: 6 }} key={ds.name}>
                    <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'white', color: 'primary.main', border: '1px solid', borderColor: 'divider' }}><DbIcon sx={{ fontSize: 20 }} /></Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={800}>{ds.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{ds.type} • {ds.updated}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        {/* Lado Direito: Console e Meta */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3} height="100%">
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#ff9800', color: 'white' }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Volume de Dados</Typography>
              <Box display="flex" alignItems="center" gap={2} mt={2}>
                <ExportIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight={900}>4.2 GB</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Total sincronizado este mês</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#1e1e1e', color: '#d4d4d4', flexGrow: 1, minHeight: 450 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LogIcon sx={{ color: '#4caf50' }} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#fff' }}>BI Data Stream Console</Typography>
              </Box>
              <Box sx={{ height: 400, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <AnimatePresence>
                  {biLogs.length === 0 ? (
                    <Typography color="rgba(255,255,255,0.3)" variant="caption">Aguardando requisições externas...</Typography>
                  ) : (
                    biLogs.map((log, i) => (
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

export default BiIntegrationPage;