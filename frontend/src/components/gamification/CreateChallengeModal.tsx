import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem } from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface CreateChallengeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ open, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    metric: 'sales_volume',
    targetValue: 0,
    rewardXp: 100,
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async () => {
    try {
      await axios.post('/api/gamification/challenges', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Desafio criado com sucesso!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showNotification('Erro ao criar desafio: ' + (error.response?.data?.message || 'Erro desconhecido'), 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Criar Novo Desafio</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
          <TextField label="Título" fullWidth value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <TextField label="Descrição" fullWidth multiline rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <TextField label="Métrica" select fullWidth value={formData.metric} onChange={e => setFormData({...formData, metric: e.target.value})}>
            <MenuItem value="sales_volume">Volume de Vendas</MenuItem>
            <MenuItem value="repairs_completed">Reparos Concluídos</MenuItem>
            <MenuItem value="customer_satisfaction">Satisfação do Cliente</MenuItem>
            <MenuItem value="new_customers">Novos Clientes Adquiridos</MenuItem>
            <MenuItem value="revenue">Receita Gerada</MenuItem>
          </TextField>
          <TextField label="Meta (Valor)" type="number" fullWidth value={formData.targetValue} onChange={e => setFormData({...formData, targetValue: Number(e.target.value)})} />
          <TextField label="Recompensa (XP)" type="number" fullWidth value={formData.rewardXp} onChange={e => setFormData({...formData, rewardXp: Number(e.target.value)})} />
          <TextField label="Início" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
          <TextField label="Fim" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Criar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChallengeModal;
