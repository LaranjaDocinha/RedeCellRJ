import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const WebhooksPage: React.FC = () => {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventType, setNewEventType] = useState('');
  const [newCallbackUrl, setNewCallbackUrl] = useState('');
  const [newSecret, setNewSecret] = useState('');

  const { token } = useAuth();

  const availableEventTypes = [
    'sale.finalized',
    'order.created',
    'product.updated',
    'customer.created',
    'repair.completed',
  ];

  const fetchWebhooks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setWebhooks(data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [token]);

  const handleCreateWebhook = async () => {
    if (!token) return;
    try {
      await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          event_type: newEventType,
          callback_url: newCallbackUrl,
          secret: newSecret || null,
        }),
      });
      setIsModalOpen(false);
      setNewEventType('');
      setNewCallbackUrl('');
      setNewSecret('');
      fetchWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const handleToggleWebhookStatus = async (id: number, currentStatus: boolean) => {
    if (!token) return;
    try {
      await fetch(`/api/webhooks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      fetchWebhooks();
    } catch (error) {
      console.error('Error toggling webhook status:', error);
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    if (!token) return;
    if (window.confirm('Tem certeza que deseja deletar este webhook?')) {
      try {
        await fetch(`/api/webhooks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchWebhooks();
      } catch (error) {
        console.error('Error deleting webhook:', error);
      }
    }
  };

  const handleSimulateTrigger = async (eventType: string) => {
    if (!token) return;
    try {
      await fetch('/api/webhooks/trigger-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_type: eventType, payload: { message: 'Simulated event data' } }),
      });
      alert(`Simulação de trigger para ${eventType} enviada!`);
    } catch (error) {
      console.error('Error simulating webhook trigger:', error);
      alert(`Erro ao simular trigger para ${eventType}.`);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Gerenciamento de Webhooks</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Webhooks Registrados</Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>Registrar Novo Webhook</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tipo de Evento</TableCell>
                <TableCell>URL de Callback</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell>Criado Em</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>{webhook.id}</TableCell>
                  <TableCell>{webhook.event_type}</TableCell>
                  <TableCell>{webhook.callback_url}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={<Switch checked={webhook.is_active} onChange={() => handleToggleWebhookStatus(webhook.id, webhook.is_active)} />}
                      label={webhook.is_active ? 'Sim' : 'Não'}
                    />
                  </TableCell>
                  <TableCell>{moment(webhook.created_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>
                    <Button size="small" color="primary" onClick={() => handleSimulateTrigger(webhook.event_type)} sx={{ mr: 1 }}>Simular Trigger</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteWebhook(webhook.id)}>Deletar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>Registrar Novo Webhook</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Evento</InputLabel>
            <Select
              value={newEventType}
              onChange={(e) => setNewEventType(e.target.value as string)}
              label="Tipo de Evento"
            >
              {availableEventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="URL de Callback"
            value={newCallbackUrl}
            onChange={(e) => setNewCallbackUrl(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Segredo (Opcional)"
            value={newSecret}
            onChange={(e) => setNewSecret(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Usado para verificar a autenticidade do webhook (HMAC-SHA256)"
          />
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={() => setIsModalOpen(false)} sx={{ mr: 1 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleCreateWebhook}>Registrar Webhook</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default WebhooksPage;
