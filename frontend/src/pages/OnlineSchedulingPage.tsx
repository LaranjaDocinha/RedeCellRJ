import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText, TextField, FormControl, InputLabel, Select, MenuItem, Modal, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../contexts/AuthContext';
import moment, { Moment } from 'moment';
import { FaCalendarAlt, FaTimesCircle } from 'react-icons/fa';

const OnlineSchedulingPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServiceType, setNewServiceType] = useState('');
  const [newAppointmentDate, setNewAppointmentDate] = useState<Moment | null>(null);
  const [newAppointmentTime, setNewAppointmentTime] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [customerId, setCustomerId] = useState('1'); // Placeholder for customer ID

  const { token } = useAuth();

  const availableServiceTypes = ['Reparo de Tela', 'Troca de Bateria', 'Consulta Técnica', 'Orçamento'];
  const availableTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  const fetchAppointments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleCreateAppointment = async () => {
    if (!token || !newServiceType || !newAppointmentDate || !newAppointmentTime || !customerId) return;

    const fullAppointmentDate = newAppointmentDate.clone().hour(parseInt(newAppointmentTime.split(':')[0])).minute(parseInt(newAppointmentTime.split(':')[1]));

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customer_id: parseInt(customerId, 10),
          service_type: newServiceType,
          appointment_date: fullAppointmentDate.toISOString(),
          notes: newNotes,
        }),
      });
      setIsModalOpen(false);
      setNewServiceType('');
      setNewAppointmentDate(null);
      setNewAppointmentTime('');
      setNewNotes('');
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!token) return;
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await fetch(`/api/appointments/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: 'cancelled' }),
        });
        fetchAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>Agendamento Online</Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Meus Agendamentos</Typography>
            <Button variant="contained" onClick={() => setIsModalOpen(true)}>Agendar Novo Horário</Button>
          </Box>
          <List>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <ListItem key={appointment.id} secondaryAction={
                  <IconButton edge="end" aria-label="cancel" onClick={() => handleCancelAppointment(appointment.id)} disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}>
                    <FaTimesCircle />
                  </IconButton>
                }>
                  <ListItemText
                    primary={`Serviço: ${appointment.service_type} em ${moment(appointment.appointment_date).format('DD/MM/YYYY HH:mm')}`}
                    secondary={`Status: ${appointment.status} - Notas: ${appointment.notes || 'N/A'}`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem><ListItemText primary="Nenhum agendamento encontrado." /></ListItem>
            )}
          </List>
        </Paper>

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
            <Typography variant="h6" gutterBottom>Agendar Novo Horário</Typography>
            <TextField
              fullWidth
              label="ID do Cliente (Placeholder)"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Serviço</InputLabel>
              <Select
                value={newServiceType}
                onChange={(e) => setNewServiceType(e.target.value as string)}
                label="Tipo de Serviço"
              >
                {availableServiceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DatePicker
              label="Data do Agendamento"
              value={newAppointmentDate}
              onChange={(newValue) => setNewAppointmentDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Hora do Agendamento</InputLabel>
              <Select
                value={newAppointmentTime}
                onChange={(e) => setNewAppointmentTime(e.target.value as string)}
                label="Hora do Agendamento"
              >
                {availableTimes.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notas (Opcional)"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button onClick={() => setIsModalOpen(false)} sx={{ mr: 1 }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateAppointment}>Agendar</Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default OnlineSchedulingPage;
