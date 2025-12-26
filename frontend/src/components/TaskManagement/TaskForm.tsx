import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  DialogContent,
  DialogActions,
  Box,
  MenuItem,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

interface TaskFormData {
  id?: string;
  description: string;
  dueDate: Date | null;
  assignedTo?: string; // User ID or name
  status?: 'pending' | 'completed';
}

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: Omit<TaskFormData, 'id'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface User {
    id: number;
    name: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(initialData?.dueDate || null);
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
  const { token } = useAuth();

  const { data: usersData } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.map((u: any) => ({ id: u.id, name: u.name || u.email }));
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setDueDate(initialData.dueDate);
      setAssignedTo(initialData.assignedTo || '');
    }
  }, [initialData]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (description && dueDate) {
      onSubmit({
        description,
        dueDate,
        assignedTo: assignedTo || undefined,
        status: initialData?.status || 'pending',
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        margin="dense"
        label="Descrição da Tarefa"
        type="text"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Data de Vencimento"
          value={dueDate}
          onChange={(newValue) => setDueDate(newValue)}
          slotProps={{ textField: { fullWidth: true, margin: 'dense', required: true } }}
          sx={{ mb: 2 }}
        />
      </LocalizationProvider>
      <TextField
        margin="dense"
        name="assignedTo"
        label="Atribuído a"
        select
        fullWidth
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="">Ninguém</MenuItem>
        {usersData?.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.name}
          </MenuItem>
        ))}
      </TextField>
      <DialogActions>
        <Button onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Tarefa' : 'Criar Tarefa')}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default TaskForm;
