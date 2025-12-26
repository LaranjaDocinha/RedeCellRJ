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
  Modal, 
  IconButton,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Stack,
  useTheme,
  Container
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  CalendarMonth as CalendarIcon, 
  AccessTime as TimeIcon, 
  Add as AddIcon,
  Cancel as CancelIcon,
  CheckCircle as DoneIcon,
  History as HistoryIcon,
  Handyman as ToolIcon,
  ChevronRight as ArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment, { Moment } from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const OnlineSchedulingPage: React.FC = () => {
  const theme = useTheme();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServiceType, setNewServiceType] = useState('');
  const [newAppointmentDate, setNewAppointmentDate] = useState<Moment | null>(moment());
  const [newAppointmentTime, setNewAppointmentTime] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const { token } = useAuth();

  const availableServiceTypes = [
    { label: 'Reparo de Tela', color: theme.palette.primary.main },
    { label: 'Troca de Bateria', color: '#4caf50' },
    { label: 'Consulta Técnica', color: '#9c27b0' },
    { label: 'Orçamento Express', color: '#ed6c02' },
  ];
  
  const availableTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  const fetchAppointments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Mock data if API is not fully implemented
      const res = await fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleCreateAppointment = async () => {
    if (!token || !newServiceType || !newAppointmentDate || !newAppointmentTime) return;

    const fullDate = newAppointmentDate.clone().hour(parseInt(newAppointmentTime.split(':')[0])).minute(parseInt(newAppointmentTime.split(':')[1]));

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          service_type: newServiceType,
          appointment_date: fullDate.toISOString(),
          notes: newNotes,
        }),
      });
      setIsModalOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
              Agendamentos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie suas visitas técnicas e reserve horários na oficina.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setIsModalOpen(true)}
            sx={{ borderRadius: '12px', px: 3, py: 1.5, fontWeight: 700 }}
          >
            Novo Agendamento
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Próximos Agendamentos */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Próximas Visitas</Typography>
            <Stack spacing={2.5}>
              {appointments.filter(a => a.status !== 'cancelled').length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">Nenhum agendamento ativo.</Typography>
                </Paper>
              ) : (
                appointments.map((app) => (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', transition: '0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } }}>
                      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={2}>
                            <Box sx={{ textAlign: 'center', borderRight: { sm: '1px solid' }, borderColor: 'divider', pr: { sm: 2 } }}>
                              <Typography variant="h4" fontWeight={900}>{moment(app.appointment_date).format('DD')}</Typography>
                              <Typography variant="overline" fontWeight={700} color="text.secondary">{moment(app.appointment_date).format('MMM')}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={7} sx={{ pl: { sm: 3 }, mt: { xs: 2, sm: 0 } }}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <ToolIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                              <Typography variant="subtitle1" fontWeight={800}>{app.service_type}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon sx={{ fontSize: 14 }} /> {moment(app.appointment_date).format('HH:mm')}
                              </Typography>
                              <Chip 
                                label={app.status.toUpperCase()} 
                                size="small" 
                                color={app.status === 'confirmed' ? 'success' : 'warning'} 
                                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, borderRadius: '6px' }} 
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={3} sx={{ textAlign: 'right', mt: { xs: 2, sm: 0 } }}>
                            <Button size="small" color="error" startIcon={<CancelIcon />} sx={{ fontWeight: 700 }}>Cancelar</Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </Stack>
          </Grid>

          {/* Sidebar / Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>Status da Oficina</Typography>
              <Box mt={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={700}>Ocupação Hoje</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">Normal</Typography>
                </Box>
                <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4, bgcolor: 'divider' }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  4 de 10 slots reservados para hoje.
                </Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Agendamento Rápido</Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.4} display="block">
                Agende sua visita com antecedência para garantir atendimento prioritário sem filas. O tempo médio de espera para agendados é de 5 min.
              </Typography>
              
              <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: '12px', fontWeight: 700, textTransform: 'none' }} startIcon={<HistoryIcon />}>
                Ver Histórico de Visitas
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Modal de Criação */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box sx={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
            width: { xs: '90%', sm: 500 }, bgcolor: 'background.paper', borderRadius: '24px', boxShadow: 24, p: 4 
          }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Agendar Horário</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Escolha o serviço e a data preferida para atendimento.</Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Tipo de Serviço</InputLabel>
              <Select
                value={newServiceType}
                onChange={(e) => setNewServiceType(e.target.value as string)}
                label="Tipo de Serviço"
                sx={{ borderRadius: '12px' }}
              >
                {availableServiceTypes.map((s) => (
                  <MenuItem key={s.label} value={s.label}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                      <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={7}>
                <DatePicker
                  label="Data"
                  value={newAppointmentDate}
                  onChange={(date) => setNewAppointmentDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                  <InputLabel>Hora</InputLabel>
                  <Select
                    value={newAppointmentTime}
                    onChange={(e) => setNewAppointmentTime(e.target.value as string)}
                    label="Hora"
                    sx={{ borderRadius: '12px' }}
                  >
                    {availableTimes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Notas Adicionais"
              placeholder="Descreva brevemente o problema (ex: tela trincada)"
              multiline
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box display="flex" gap={2}>
              <Button fullWidth onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '12px', fontWeight: 700 }}>Cancelar</Button>
              <Button fullWidth variant="contained" onClick={handleCreateAppointment} sx={{ borderRadius: '12px', fontWeight: 700 }}>Confirmar Agendamento</Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </LocalizationProvider>
  );
};

export default OnlineSchedulingPage;