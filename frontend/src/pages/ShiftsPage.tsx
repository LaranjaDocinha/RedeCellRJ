import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  Box, 
  Typography, 
  Button, 
  Modal, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  Paper, 
  Avatar, 
  Chip, 
  Stack, 
  IconButton,
  Divider,
  useTheme,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  FilterList as FilterIcon, 
  Person as UserIcon, 
  AccessTime as TimeIcon,
  Store as BranchIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ChevronLeft,
  ChevronRight,
  Groups as TeamIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface ShiftEvent extends Event {
  id: number;
  resource: any;
}

const ShiftsPage: React.FC = () => {
  const theme = useTheme();
  const [events, setEvents] = useState<ShiftEvent[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ShiftEvent | null>(null);
  const [formData, setFormData] = useState({ userId: '', startTime: '', endTime: '', role: '' });
  
  const { token } = useAuth();

  const fetchShifts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Mock data for rich UI demo
      const mockShifts = [
        { id: 1, user_name: 'Carlos Eduardo', role: 'Gerente', start_time: moment().startOf('day').add(8, 'hours').toISOString(), end_time: moment().startOf('day').add(17, 'hours').toISOString(), user_id: '1' },
        { id: 2, user_name: 'Ana Paula', role: 'Vendedora', start_time: moment().startOf('day').add(9, 'hours').toISOString(), end_time: moment().startOf('day').add(18, 'hours').toISOString(), user_id: '2' },
        { id: 3, user_name: 'Juliana Dias', role: 'Técnica', start_time: moment().startOf('day').add(13, 'hours').toISOString(), end_time: moment().startOf('day').add(22, 'hours').toISOString(), user_id: '3' },
      ];
      
      const formattedEvents = mockShifts.map((shift: any) => ({
        id: shift.id,
        title: `${shift.user_name} (${shift.role})`,
        start: new Date(shift.start_time),
        end: new Date(shift.end_time),
        resource: shift,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setFormData({ userId: '', startTime: moment(slotInfo.start).format('YYYY-MM-DDTHH:mm'), endTime: moment(slotInfo.end).format('YYYY-MM-DDTHH:mm'), role: '' });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: ShiftEvent) => {
    setSelectedEvent(event);
    setFormData({
      userId: event.resource.user_id,
      startTime: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      endTime: moment(event.end).format('YYYY-MM-DDTHH:mm'),
      role: event.resource.role,
    });
    setIsModalOpen(true);
  };

  const eventStyleGetter = (event: ShiftEvent) => {
    const isTechnician = event.resource.role.toLowerCase().includes('técnic');
    const isSeller = event.resource.role.toLowerCase().includes('vend');
    
    let backgroundColor = theme.palette.primary.main;
    if (isTechnician) backgroundColor = '#9c27b0';
    if (isSeller) backgroundColor = '#4caf50';

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '4px 8px'
      }
    };
  };

  return (
    <Box p={4} sx={{ maxWidth: 1600, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <TeamIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
              RECURSOS HUMANOS
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Escala de Turnos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Gerencie horários, folgas e disponibilidades da sua equipe por filial.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Filial</InputLabel>
            <Select value={selectedBranch} label="Filial" onChange={(e) => setSelectedBranch(e.target.value)} sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}>
              <MenuItem value="1">Filial Matriz</MenuItem>
              <MenuItem value="2">Filial Barra</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)} sx={{ borderRadius: '12px', px: 3, fontWeight: 800 }}>Novo Turno</Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: Calendário */}
        <Grid item xs={12} lg={9}>
          <Paper sx={{ p: 3, borderRadius: '32px', border: '1px solid', borderColor: 'divider', height: '75vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              messages={{
                next: "Próximo",
                previous: "Anterior",
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia"
              }}
            />
          </Paper>
        </Grid>

        {/* Lado Direito: Info e Legenda */}
        <Grid item xs={12} lg={3}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Legenda de Cores</Typography>
              <Stack spacing={1.5} mt={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: 'primary.main' }} />
                  <Typography variant="caption" fontWeight={700}>GERÊNCIA / ADM</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: '#4caf50' }} />
                  <Typography variant="caption" fontWeight={700}>VENDAS / PDV</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: '#9c27b0' }} />
                  <Typography variant="caption" fontWeight={700}>TÉCNICA / OFICINA</Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>Insights da Escala</Typography>
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Cobertura de hoje:</Typography>
                <Typography variant="h5" fontWeight={900}>8 Colaboradores</Typography>
                <Typography variant="caption" color="success.main" fontWeight={700}>Capacidade Ideal atingida</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary" display="block">
                Dica: Mantenha pelo menos um técnico de plantão durante o horário de almoço (12h - 14h).
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Modal de Turno */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', borderRadius: '24px', p: 4, boxShadow: 24 }}>
          <Typography variant="h5" fontWeight={900} mb={3}>{selectedEvent ? 'Editar' : 'Programar'} Turno</Typography>
          
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Colaborador</InputLabel>
              <Select value={formData.userId} label="Colaborador" onChange={(e) => setFormData({ ...formData, userId: e.target.value })} sx={{ borderRadius: '12px' }}>
                <MenuItem value="1">Carlos Eduardo</MenuItem>
                <MenuItem value="2">Ana Paula</MenuItem>
                <MenuItem value="3">Juliana Dias</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Início" type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Fim" type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>
            </Grid>

            <TextField fullWidth label="Função / Cargo" value={formData.role} placeholder="Ex: Vendedor, Caixa, Técnico" onChange={(e) => setFormData({ ...formData, role: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />

            <Box mt={2} display="flex" gap={2}>
              <Button fullWidth onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '12px', fontWeight: 700 }}>Cancelar</Button>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ borderRadius: '12px', fontWeight: 800 }}>Salvar Turno</Button>
            </Box>
            
            {selectedEvent && (
              <Button fullWidth color="error" startIcon={<DeleteIcon />} onClick={() => {}} sx={{ fontWeight: 700 }}>Excluir este horário</Button>
            )}
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default ShiftsPage;