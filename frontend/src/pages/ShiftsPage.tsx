import { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
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
  Stack, 
  useTheme,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon, 
  Groups as TeamIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ChevronLeft,
  ChevronRight,
  Today,
  AccessTime,
  MoreHoriz
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

// --- Estilos Premium com Suporte a Modo Escuro ---

const CalendarWrapper = styled.div<{ theme: any }>`
  height: calc(100vh - 240px);
  min-height: 600px;
  
  .fc {
    font-family: 'Inter', system-ui, sans-serif !important;
    --fc-border-color: ${props => props.theme.palette.divider}; 
    --fc-today-bg-color: ${props => alpha(props.theme.palette.primary.main, 0.05)};
    --fc-now-indicator-color: ${props => props.theme.palette.error.main};
    --fc-page-bg-color: ${props => props.theme.palette.background.paper};
    --fc-neutral-bg-color: ${props => props.theme.palette.action.hover};
    --fc-list-event-hover-bg-color: ${props => props.theme.palette.action.hover};
  }

  .fc-header-toolbar { display: none !important; }

  .fc-theme-standard td, .fc-theme-standard th {
    border: none !important;
  }
  
  .fc-theme-standard .fc-scrollgrid { border: none !important; }

  .fc-col-header-cell { padding: 16px 0 !important; background: transparent; }

  .fc-col-header-cell-cushion {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 1px;
    color: ${props => props.theme.palette.text.secondary}; 
    text-decoration: none !important;
  }

  .fc-daygrid-day-top { justify-content: center !important; padding-top: 8px !important; }

  .fc-daygrid-day-number {
    font-size: 0.9rem;
    font-weight: 500;
    color: ${props => props.theme.palette.text.primary};
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-bottom: 4px;
    text-decoration: none !important;
    transition: all 0.2s;
  }

  .fc-day-today .fc-daygrid-day-number {
    background-color: ${props => props.theme.palette.primary.main};
    color: #fff !important;
    box-shadow: 0 4px 10px ${props => alpha(props.theme.palette.primary.main, 0.3)};
  }

  .fc-event {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    margin-bottom: 6px !important;
    padding: 0 4px !important;
  }

  .fc-list-day-cushion { background-color: ${props => props.theme.palette.action.hover} !important; }
`;

const GlassCard = styled(Paper)<{ theme?: any }>`
  background: ${props => alpha(props.theme.palette.background.paper, props.theme.palette.mode === 'dark' ? 0.6 : 0.9)};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => alpha(props.theme.palette.divider, 0.1)};
  box-shadow: ${props => props.theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
    : '0 8px 32px rgba(0, 0, 0, 0.04)'};
  border-radius: 24px;
  overflow: hidden;
`;

const EventCard = styled(motion.div)<{ bgcolor: string; theme?: any }>`
  background-color: ${props => alpha(props.bgcolor, props.theme.palette.mode === 'dark' ? 0.2 : 0.1)};
  border-left: 3px solid ${props => props.bgcolor};
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => alpha(props.bgcolor, props.theme.palette.mode === 'dark' ? 0.3 : 0.2)};
    transform: translateY(-1px);
  }
`;

// --- Interfaces ---

interface ShiftEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    userId: string;
    role: string;
    userName: string;
    avatarUrl?: string;
  };
}

// --- Componente Principal ---

const ShiftsPage = () => {
  const theme = useTheme();
  const [events, setEvents] = useState<ShiftEvent[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ userId: '', startTime: '', endTime: '', role: '' });
  const calendarRef = useRef<FullCalendar>(null);
  const [currentDateLabel, setCurrentDateLabel] = useState('');
  
  const { token } = useAuth();

  const getRoleColor = (role: string) => {
    if (role.toLowerCase().includes('técnic')) return '#9c27b0';
    if (role.toLowerCase().includes('vend')) return '#00c853';
    if (role.toLowerCase().includes('gerente')) return '#2979ff';
    return '#ff9800';
  };

  const fetchShifts = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const mockShifts = [
      { id: '1', user_name: 'Carlos Eduardo', role: 'Gerente', start: `${today}T08:00:00`, end: `${today}T17:00:00`, user_id: '1' },
      { id: '2', user_name: 'Ana Paula', role: 'Vendedora', start: `${today}T09:00:00`, end: `${today}T18:00:00`, user_id: '2' },
      { id: '3', user_name: 'Juliana Dias', role: 'Técnica', start: `${today}T13:00:00`, end: `${today}T22:00:00`, user_id: '3' },
      { id: '4', user_name: 'Roberto Silva', role: 'Vendedor', start: `${today}T10:00:00`, end: `${today}T19:00:00`, user_id: '4' },
    ];
    
    const formattedEvents = mockShifts.map((shift: any) => ({
      id: shift.id,
      title: shift.user_name,
      start: shift.start,
      end: shift.end,
      extendedProps: { userId: shift.user_id, role: shift.role, userName: shift.user_name }
    }));
    setEvents(formattedEvents);
    setTimeout(() => updateTitle(), 100);
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const updateTitle = () => {
    const api = calendarRef.current?.getApi();
    if (api) setCurrentDateLabel(api.view.title);
  };

  const handlePrev = () => { calendarRef.current?.getApi().prev(); updateTitle(); };
  const handleNext = () => { calendarRef.current?.getApi().next(); updateTitle(); };
  const handleToday = () => { calendarRef.current?.getApi().today(); updateTitle(); };

  const renderEventContent = (eventInfo: any) => {
    const color = getRoleColor(eventInfo.event.extendedProps.role);
    const timeText = eventInfo.timeText;
    
    return (
      <EventCard bgcolor={color} theme={theme} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem', bgcolor: color, color: '#fff' }}>
          {eventInfo.event.extendedProps.userName.charAt(0)}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary, display: 'block', lineHeight: 1.1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '0.7rem' }}>
            {eventInfo.event.extendedProps.userName}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 10 }} /> {timeText}
          </Typography>
        </Box>
      </EventCard>
    );
  };

  const handleDateClick = (arg: any) => {
    setSelectedEventId(null);
    setFormData({ userId: '', startTime: arg.dateStr + 'T09:00', endTime: arg.dateStr + 'T18:00', role: '' });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    setSelectedEventId(event.id);
    setFormData({
      userId: event.extendedProps.userId,
      startTime: event.startStr.slice(0, 16),
      endTime: event.endStr ? event.endStr.slice(0, 16) : event.startStr.slice(0, 16),
      role: event.extendedProps.role,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const userMap: Record<string, string> = { '1': 'Carlos Eduardo', '2': 'Ana Paula', '3': 'Juliana Dias', '4': 'Roberto Silva' };
    const userName = userMap[formData.userId] || 'Colaborador';
    const newEvent: ShiftEvent = {
      id: selectedEventId || String(Math.random()),
      title: userName,
      start: formData.startTime,
      end: formData.endTime,
      extendedProps: { userId: formData.userId, role: formData.role, userName: userName }
    };
    if (selectedEventId) {
      setEvents(prev => prev.map(e => e.id === selectedEventId ? newEvent : e));
    } else {
      setEvents(prev => [...prev, newEvent]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedEventId) {
      setEvents(prev => prev.filter(e => e.id !== selectedEventId));
      setIsModalOpen(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, md: 4 }, color: 'text.primary' }}>
      
      {/* Topbar Flutuante */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', borderRadius: '12px', width: 48, height: 48, color: '#fff' }}>
            <TeamIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Escala de Equipe</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Gerencie turnos e produtividade</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <GlassCard theme={theme} sx={{ px: 2, py: 0.5, borderRadius: '50px', display: 'flex', alignItems: 'center' }}>
             <IconButton size="small" onClick={handlePrev}><ChevronLeft /></IconButton>
             <Typography variant="subtitle2" sx={{ mx: 2, fontWeight: 600, minWidth: 140, textAlign: 'center' }}>
               {currentDateLabel}
             </Typography>
             <IconButton size="small" onClick={handleNext}><ChevronRight /></IconButton>
             <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 20, alignSelf: 'center' }} />
             <Tooltip title="Voltar para Hoje">
                <IconButton size="small" onClick={handleToday} color="primary"><Today /></IconButton>
             </Tooltip>
          </GlassCard>

          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setSelectedEventId(null); setFormData({ userId: '', startTime: '', endTime: '', role: '' }); setIsModalOpen(true); }}
            sx={{ borderRadius: '50px', px: 4, textTransform: 'none', fontWeight: 600, color: '#fff' }}
          >
            Novo Turno
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <GlassCard theme={theme} sx={{ p: 0, height: '100%' }}>
            <Box p={3}>
              <CalendarWrapper theme={theme}>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  initialView="dayGridMonth"
                  locale={ptBrLocale}
                  headerToolbar={false}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={3}
                  weekends={true}
                  events={events}
                  eventContent={renderEventContent}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  height="100%"
                  slotMinTime="06:00:00"
                  slotMaxTime="23:00:00"
                  allDaySlot={false}
                  datesSet={updateTitle}
                />
              </CalendarWrapper>
            </Box>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack spacing={3}>
            <GlassCard theme={theme} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">NO TURNO AGORA</Typography>
                <MoreHoriz fontSize="small" color="action" />
              </Box>
              <AvatarGroup max={4} sx={{ justifyContent: 'flex-end', mb: 2 }}>
                <Avatar alt="Carlos" src="" />
                <Avatar alt="Ana" src="" />
                <Avatar alt="Juliana" src="" />
                <Avatar alt="Roberto" src="" />
              </AvatarGroup>
              <Typography variant="body2" color="text.secondary">
                <strong>4 pessoas</strong> trabalhando ativamente.
              </Typography>
            </GlassCard>

            <GlassCard theme={theme} sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>COBERTURA DIÁRIA</Typography>
              <Stack spacing={2}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={600}>Vendas</Typography>
                    <Typography variant="caption" color="success.main">100%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={100} color="success" sx={{ height: 6, borderRadius: 3 }} />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={600}>Técnica</Typography>
                    <Typography variant="caption" color="warning.main">75%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              </Stack>
            </GlassCard>

            <GlassCard theme={theme} sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>LEGENDA</Typography>
              <Stack spacing={1.5}>
                {[
                  { label: 'Gerência', color: '#2979ff' },
                  { label: 'Vendas', color: '#00c853' },
                  { label: 'Técnica', color: '#9c27b0' }
                ].map((item, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                    <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                  </Box>
                ))}
              </Stack>
            </GlassCard>
          </Stack>
        </Grid>
      </Grid>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
          width: 480, bgcolor: 'background.paper', borderRadius: '32px', p: 0, 
          boxShadow: theme.palette.mode === 'dark' ? '0 40px 80px rgba(0,0,0,0.6)' : '0 40px 80px rgba(0,0,0,0.2)', 
          outline: 'none', overflow: 'hidden'
        }}>
          <Box sx={{ bgcolor: 'primary.main', p: 4, color: '#fff' }}>
            <Typography variant="h5" fontWeight={700}>{selectedEventId ? 'Editar Turno' : 'Novo Agendamento'}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Defina os horários e responsabilidades.</Typography>
          </Box>
          <Stack spacing={3} p={4}>
            <FormControl fullWidth variant="filled">
              <InputLabel>Colaborador</InputLabel>
              <Select value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} disableUnderline sx={{ borderRadius: '16px' }}>
                <MenuItem value="1">Carlos Eduardo</MenuItem>
                <MenuItem value="2">Ana Paula</MenuItem>
                <MenuItem value="3">Juliana Dias</MenuItem>
                <MenuItem value="4">Roberto Silva</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth label="Início" type="datetime-local" variant="filled" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} InputLabelProps={{ shrink: true }} InputProps={{ disableUnderline: true }} sx={{ '& .MuiFilledInput-root': { borderRadius: '16px' } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth label="Fim" type="datetime-local" variant="filled" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} InputLabelProps={{ shrink: true }} InputProps={{ disableUnderline: true }} sx={{ '& .MuiFilledInput-root': { borderRadius: '16px' } }} />
              </Grid>
            </Grid>
            <TextField fullWidth label="Função / Cargo" variant="filled" value={formData.role} placeholder="Ex: Vendedor" onChange={(e) => setFormData({ ...formData, role: e.target.value })} InputProps={{ disableUnderline: true }} sx={{ '& .MuiFilledInput-root': { borderRadius: '16px' } }} />
            <Stack direction="row" spacing={2} pt={2}>
              <Button fullWidth onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '16px', py: 1.5, color: 'text.secondary' }}>Cancelar</Button>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ borderRadius: '16px', py: 1.5, boxShadow: 'none', color: '#fff' }}>Salvar</Button>
            </Stack>
            {selectedEventId && (
              <Box display="flex" justifyContent="center">
                <Button color="error" size="small" startIcon={<DeleteIcon />} onClick={handleDelete} sx={{ borderRadius: '12px', textTransform: 'none' }}>Excluir este agendamento</Button>
              </Box>
            )}
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default ShiftsPage;