import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';

// Interfaces
interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
}

interface User { // Assuming a simple User type for assignee dropdown
  id: number;
  name: string;
}

const LeadColumn: React.FC<{ title: string; leads: Lead[]; onEdit: (lead: Lead) => void }> = ({
  title,
  leads,
  onEdit,
}) => (
  <Paper elevation={3} sx={{ p: 2, height: '70vh', overflowY: 'auto' }}>
    <Typography variant="h6" gutterBottom>
      {title} ({leads.length})
    </Typography>
    <Box mt={2}>
      <AnimatePresence>
        {leads.map((lead) => (
          <motion.div
            key={lead.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => onEdit(lead)}>
              <Typography variant="subtitle2">{lead.name}</Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {lead.email}
              </Typography>
            </Paper>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  </Paper>
);

const LeadsPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const {
    data: leads,
    isLoading,
    error,
  } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

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

  const createLeadMutation = useMutation({
    mutationFn: (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) =>
      axios.post('/api/leads', newLead, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => {
      addToast('Lead criado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsModalOpen(false);
      setEditingLead(null);
    },
    onError: (err: any) => {
      addToast(`Erro ao criar lead: ${err.response?.data?.message || err.message}`, 'error');
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: (updatedLead: Partial<Lead> & { id: number }) =>
      axios.put(`/api/leads/${updatedLead.id}`, updatedLead, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      addToast('Lead atualizado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsModalOpen(false);
      setEditingLead(null);
    },
    onError: (err: any) => {
      addToast(`Erro ao atualizar lead: ${err.response?.data?.message || err.message}`, 'error');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const leadData: any = {};
    formData.forEach((value, key) => (leadData[key] = value));

    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, ...leadData });
    } else {
      createLeadMutation.mutate(leadData);
    }
  };

  const handleCreateNew = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Erro ao carregar leads.</Typography>;

  const leadsByStatus = (leads || []).reduce(
    (acc, lead) => {
      acc[lead.status].push(lead);
      return acc;
    },
    {
      new: [],
      contacted: [],
      qualified: [],
      converted: [],
      unqualified: [],
    } as Record<Lead['status'], Lead[]>,
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestão de Leads (CRM)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Novo Lead
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={2.4}>
          <LeadColumn title="Novo" leads={leadsByStatus.new} onEdit={handleEditLead} />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <LeadColumn title="Contactado" leads={leadsByStatus.contacted} onEdit={handleEditLead} />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <LeadColumn title="Qualificado" leads={leadsByStatus.qualified} onEdit={handleEditLead} />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <LeadColumn title="Convertido" leads={leadsByStatus.converted} onEdit={handleEditLead} />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <LeadColumn title="Desqualificado" leads={leadsByStatus.unqualified} onEdit={handleEditLead} />
        </Grid>
      </Grid>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>{editingLead ? 'Editar Lead' : 'Criar Novo Lead'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="dense"
              name="name"
              label="Nome do Lead"
              type="text"
              fullWidth
              defaultValue={editingLead?.name || ''}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              defaultValue={editingLead?.email || ''}
              required
            />
            <TextField
              margin="dense"
              name="phone"
              label="Telefone"
              type="tel"
              fullWidth
              defaultValue={editingLead?.phone || ''}
            />
            <TextField
              margin="dense"
              name="source"
              label="Fonte"
              type="text"
              fullWidth
              defaultValue={editingLead?.source || ''}
              required
            />
            <TextField
              margin="dense"
              name="status"
              label="Status"
              select
              fullWidth
              defaultValue={editingLead?.status || 'new'}
              required
            >
              <MenuItem value="new">Novo</MenuItem>
              <MenuItem value="contacted">Contactado</MenuItem>
              <MenuItem value="qualified">Qualificado</MenuItem>
              <MenuItem value="unqualified">Desqualificado</MenuItem>
              <MenuItem value="converted">Convertido</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              name="assignedTo"
              label="Responsável"
              select
              fullWidth
              defaultValue={editingLead?.assignedTo || ''}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {usersData?.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <DialogActions>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={createLeadMutation.isPending || updateLeadMutation.isPending}>
                {editingLead ? 'Salvar' : 'Criar'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LeadsPage;
