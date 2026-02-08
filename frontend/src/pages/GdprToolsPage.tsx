import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Divider, 
  Stack, 
  useTheme,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Security as SecurityIcon, 
  FileDownload as ExportIcon, 
  VisibilityOff as AnonymizeIcon, 
  DeleteForever as DeleteIcon, 
  InfoOutlined as InfoIcon,
  VerifiedUser as ShieldIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  Gavel as LegalIcon,
  AccountCircle as UserIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const GdprToolsPage: React.FC = () => {
  const theme = useTheme();
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestHistory, setRequestHistory] = useState<any[]>([
    { id: 1, type: 'EXPORT', status: 'COMPLETED', date: moment().subtract(2, 'days').format('LLL'), customer: 'maria@gmail.com' },
    { id: 2, type: 'ANONYMIZE', status: 'PENDING', date: moment().format('LLL'), customer: 'joao.silva@outlook.com' }
  ]);

  const { token } = useAuth();

  const handleAction = async (action: 'EXPORT' | 'ANONYMIZE' | 'DELETE') => {
    if (!token || !customerId) return;
    
    let confirmMsg = '';
    if (action === 'ANONYMIZE') confirmMsg = 'Esta ação irá ocultar permanentemente os dados pessoais. Continuar?';
    if (action === 'DELETE') confirmMsg = 'AVISO CRÍTICO: Esta ação removerá TODOS os dados do cliente para sempre. Confirmar?';
    
    if (confirmMsg && !window.confirm(confirmMsg)) return;

    setLoading(true);
    // Simulated API
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    alert(`Solicitação de ${action} processada com sucesso.`);
    setCustomerId('');
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <SecurityIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 400, color: 'primary.main', letterSpacing: 2 }}>
              CONFORMIDADE E PRIVACIDADE
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Privacy Command Center
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Gerencie os direitos dos titulares de dados conforme as diretrizes da LGPD e GDPR.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<LegalIcon />} sx={{ borderRadius: '12px', fontWeight: 400 }}>Políticas de Dados</Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: Ferramentas de Ação */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" fontWeight={400} mb={4}>Solicitação de Titular</Typography>
            
            <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: '24px', mb: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={400} gutterBottom>Identificar Cliente</Typography>
              <TextField
                fullWidth
                placeholder="Digite o E-mail ou UUID do cliente..."
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                sx={{ mt: 1, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><UserIcon color="primary" /></InputAdornment>,
                }}
              />
            </Box>

            <Typography variant="subtitle2" fontWeight={400} mb={2} sx={{ opacity: 0.6 }}>AÇÕES DISPONÍVEIS</Typography>
            
            <Stack spacing={2}>
              <Card variant="outlined" sx={{ borderRadius: '20px', transition: '0.2s', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.02)' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: '24px !important' }}>
                  <Avatar sx={{ bgcolor: 'primary.light', borderRadius: '12px' }}><ExportIcon /></Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={400}>Direito de Portabilidade (Exportar)</Typography>
                    <Typography variant="caption" color="text.secondary">Gera um pacote JSON/CSV com todos os dados vinculados a este titular.</Typography>
                  </Box>
                  <Button variant="contained" onClick={() => handleAction('EXPORT')} disabled={loading || !customerId} sx={{ borderRadius: '10px', fontWeight: 400 }}>Exportar</Button>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: '20px', transition: '0.2s', '&:hover': { borderColor: 'warning.main', bgcolor: 'rgba(237, 108, 2, 0.02)' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: '24px !important' }}>
                  <Avatar sx={{ bgcolor: 'warning.light', borderRadius: '12px' }}><AnonymizeIcon /></Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={400}>Direito à Anonimização</Typography>
                    <Typography variant="caption" color="text.secondary">Substitui dados identificáveis por hashes, preservando apenas dados estatísticos.</Typography>
                  </Box>
                  <Button variant="outlined" color="warning" onClick={() => handleAction('ANONYMIZE')} disabled={loading || !customerId} sx={{ borderRadius: '10px', fontWeight: 400 }}>Anonimizar</Button>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: '20px', transition: '0.2s', '&:hover': { borderColor: 'error.main', bgcolor: 'rgba(211, 47, 47, 0.02)' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: '24px !important' }}>
                  <Avatar sx={{ bgcolor: 'error.light', borderRadius: '12px' }}><DeleteIcon /></Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={400}>Direito ao Esquecimento (Excluir)</Typography>
                    <Typography variant="caption" color="text.secondary">Remove permanentemente o registro e histórico deste titular de todos os módulos.</Typography>
                  </Box>
                  <Button variant="outlined" color="error" onClick={() => handleAction('DELETE')} disabled={loading || !customerId} sx={{ borderRadius: '10px', fontWeight: 400 }}>Excluir Tudo</Button>
                </CardContent>
              </Card>
            </Stack>
          </Paper>
        </Grid>

        {/* Lado Direito: Histórico e Stats */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={3} height="100%">
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}><ShieldIcon sx={{ fontSize: 150 }} /></Box>
              <Typography variant="subtitle2" fontWeight={400} gutterBottom>Status de Compliance</Typography>
              <Box mt={3}>
                <Typography variant="h4" fontWeight={400}>PROTEGIDO</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>Banco de dados criptografado em repouso (AES-256)</Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid', borderColor: 'divider', flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <HistoryIcon color="action" />
                <Typography variant="h6" fontWeight={400}>Logs de Privacidade</Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {requestHistory.map((req) => (
                  <React.Fragment key={req.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText 
                        primary={<Typography variant="body2" fontWeight={400}>{req.type} - {req.customer}</Typography>}
                        secondary={req.date}
                      />
                      <Chip label={req.status} size="small" color={req.status === 'COMPLETED' ? 'success' : 'warning'} sx={{ fontWeight: 400, fontSize: '0.6rem', borderRadius: '6px' }} />
                    </ListItem>
                    <Divider sx={{ opacity: 0.5 }} />
                  </React.Fragment>
                ))}
              </List>
              <Button fullWidth variant="text" sx={{ mt: 2, fontWeight: 400, textTransform: 'none' }}>Ver Auditoria Completa</Button>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" gap={2}>
                <InfoIcon color="primary" />
                <Typography variant="caption" color="text.secondary" lineHeight={1.5}>
                  Lembre-se: solicitações de exclusão de dados devem ser atendidas em até 15 dias conforme a legislação brasileira.
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GdprToolsPage;
