import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Typography, Button, Modal, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

interface ShiftEvent extends Event {
  id: number;
  resource: any;
}

const ShiftsPage: React.FC = () => {
  const [events, setEvents] = useState<ShiftEvent[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ShiftEvent | null>(null);
  const [formData, setFormData] = useState({ userId: '', startTime: '', endTime: '', role: '' });
  const { token } = useAuth();

  const fetchShifts = useCallback(async () => {
    if (!token) return;
    const url = new URL('/api/shifts', window.location.origin);
    // This is a basic implementation. A real one would get the date range from the calendar view.
    url.searchParams.append('start', moment().startOf('month').toISOString());
    url.searchParams.append('end', moment().endOf('month').toISOString());
    if (selectedBranch) {
      url.searchParams.append('branchId', selectedBranch);
    }

    try {
      const response = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      const formattedEvents = data.map((shift: any) => ({
        id: shift.id,
        title: `${shift.user_name} (${shift.role})`,
        start: new Date(shift.start_time),
        end: new Date(shift.end_time),
        resource: shift,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  }, [token, selectedBranch]);

  useEffect(() => {
    // Fetch branches and users for the form
    const fetchInitialData = async () => {
      if (!token) return;
      try {
        const [branchesRes, usersRes] = await Promise.all([
          fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const branchesData = await branchesRes.json();
        const usersData = await usersRes.json();
        setBranches(branchesData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
    fetchShifts();
  }, [fetchShifts, token]);

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

  const handleSave = async () => {
    if (!token) return;
    const method = selectedEvent ? 'PUT' : 'POST';
    const url = selectedEvent ? `/api/shifts/${selectedEvent.id}` : '/api/shifts';
    const body = {
      ...formData,
      branch_id: selectedBranch || branches[0]?.id, // Default to first branch if none selected
      start_time: formData.startTime,
      end_time: formData.endTime,
      user_id: formData.userId
    };

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      fetchShifts();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !token) return;
    try {
      await fetch(`/api/shifts/${selectedEvent.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchShifts();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Agendamento de Turnos</Typography>
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>Filial</InputLabel>
        <Select value={selectedBranch} label="Filial" onChange={(e) => setSelectedBranch(e.target.value)}>
          <MenuItem value=""><em>Todas</em></MenuItem>
          {branches.map(branch => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
        </Select>
      </FormControl>
      <Box sx={{ height: '70vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
      </Box>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6">{selectedEvent ? 'Editar' : 'Criar'} Turno</Typography>
          <FormControl fullWidth sx={{ my: 2 }}>
            <InputLabel>Funcionário</InputLabel>
            <Select value={formData.userId} label="Funcionário" onChange={(e) => setFormData({ ...formData, userId: e.target.value })}>
              {users.map(user => <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Início" type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} sx={{ my: 2 }} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Fim" type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} sx={{ my: 2 }} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Função" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} sx={{ my: 2 }} />
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" color="primary" onClick={handleSave}>{selectedEvent ? 'Salvar' : 'Criar'}</Button>
            {selectedEvent && <Button variant="contained" color="error" onClick={handleDelete}>Excluir</Button>}
            <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ShiftsPage;
