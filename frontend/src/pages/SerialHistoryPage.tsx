import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Grid, 
  Avatar, 
  Chip, 
  Divider, 
  Stack, 
  useTheme,
  InputAdornment,
  Card,
  CardContent,
  Container,
  IconButton
} from '@mui/material';
import { 
  QrCodeScanner as BarcodeIcon, 
  Search as SearchIcon, 
  History as HistoryIcon,
  Smartphone as DeviceIcon,
  Timeline as TimelineIcon,
  VerifiedUser as ShieldIcon,
  LocationOn as BranchIcon,
  Person as UserIcon,
  SwapHoriz as SwapIcon,
  CheckCircle as DoneIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const SerialHistoryPage: React.FC = () => {
  const theme = useTheme();
  const [serial, setSerial] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { token } = useAuth();

  const handleSearch = async () => {
    if (!serial) return;
    setLoading(true);
    try {
      // Simulated timeline data for rich UI
      await new Promise(r => setTimeout(r, 1000));
      setHistory([
        { id: 4, action: 'Venda Finalizada', old_status: 'Disponível', new_status: 'Vendido', date: new Date(), user: 'Carlos Silva', branch: 'Matriz' },
        { id: 3, action: 'Teste de Qualidade Pós-Reparo', old_status: 'Em Manutenção', new_status: 'Disponível', date: moment().subtract(2, 'days'), user: 'Juliana Dias', branch: 'Oficina Central' },
        { id: 2, action: 'Entrada para Reparo (OS #442)', old_status: 'Disponível', new_status: 'Em Manutenção', date: moment().subtract(5, 'days'), user: 'Ana Paula', branch: 'Barra' },
        { id: 1, action: 'Entrada de Estoque (Compra)', old_status: 'N/A', new_status: 'Disponível', date: moment().subtract(1, 'month'), user: 'SISTEMA', branch: 'Matriz' },
      ]);
    } catch (error: any) {
      showNotification('Serial não encontrado.', 'error');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <BarcodeIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
              RASTREABILIDADE TOTAL
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            IMEI 360 Tracker
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Consulte o ciclo de vida completo de qualquer aparelho através do IMEI ou Serial.
          </Typography>
        </Box>
      </Box>

      {/* Busca Principal */}
      <Paper elevation={0} sx={{ p: 1, mb: 6, borderRadius: '24px', border: '2px solid', borderColor: loading ? 'primary.main' : 'divider', transition: '0.3s' }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Cole o IMEI ou Serial do aparelho aqui..."
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ 
              '& .MuiOutlinedInput-root': { border: 'none', fontSize: '1.2rem', fontWeight: 600 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" sx={{ fontSize: 32 }} /></InputAdornment>,
            }}
          />
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSearch}
            disabled={loading || !serial}
            sx={{ height: 60, px: 6, borderRadius: '18px', fontWeight: 900 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'RASTREAR'}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {history.length > 0 ? (
          <>
            {/* Status Atual do Aparelho */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar sx={{ width: 100, height: 100, margin: '0 auto 24px', bgcolor: 'primary.50', color: 'primary.main', border: '1px solid', borderColor: 'primary.light' }}>
                      <DeviceIcon sx={{ fontSize: 50 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={900}>iPhone 15 Pro</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>IMEI: {serial}</Typography>
                    <Chip label="STATUS: VENDIDO" color="success" sx={{ mt: 2, fontWeight: 900, borderRadius: '8px' }} />
                  </CardContent>
                </Card>

                <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                  <Typography variant="subtitle2" fontWeight={800} mb={2}>Informações de Garantia</Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">COBERTURA</Typography>
                      <Typography variant="caption" fontWeight={800} color="success.main">ATIVA</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">EXPIRA EM</Typography>
                      <Typography variant="caption" fontWeight={800}>15/12/2026</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            {/* Timeline do Ciclo de Vida */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={800} mb={4}>Linha do Tempo de Eventos</Typography>
                <Box>
                  {history.map((event, idx) => (
                    <Box key={event.id} sx={{ display: 'flex', gap: 3, pb: idx === history.length - 1 ? 0 : 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: idx === 0 ? 'primary.main' : 'divider', color: idx === 0 ? 'white' : 'text.disabled' }}>
                          {idx === 0 ? <DoneIcon sx={{ fontSize: 20 }} /> : <HistoryIcon sx={{ fontSize: 20 }} />}
                        </Avatar>
                        {idx !== history.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 1 }} />}
                      </Box>
                      <Box flexGrow={1} pt={0.5}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle1" fontWeight={800}>{event.action}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">{moment(event.date).format('LLL')}</Typography>
                          </Box>
                          <Chip label={event.new_status} size="small" variant="outlined" sx={{ fontWeight: 800, borderRadius: '6px' }} />
                        </Box>
                        
                        <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: '12px', bgcolor: 'action.hover', borderStyle: 'dashed' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6} display="flex" alignItems="center" gap={1}>
                              <UserIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                              <Typography variant="caption"><strong>Operador:</strong> {event.user}</Typography>
                            </Grid>
                            <Grid item xs={6} display="flex" alignItems="center" gap={1}>
                              <BranchIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                              <Typography variant="caption"><strong>Local:</strong> {event.branch}</Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={10}>
              <Paper sx={{ p: 10, borderRadius: '40px', border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                <TimelineIcon sx={{ fontSize: 80, color: 'divider', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" fontWeight={700}>Aguardando IMEI para rastreamento</Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Digite ou escaneie o código do aparelho acima.</Typography>
              </Paper>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SerialHistoryPage;