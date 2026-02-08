import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  Modal, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Switch, 
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  Webhook as WebhookIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  PlayArrow as PlayIcon,
  CheckCircle,
  Error as ErrorIcon,
  Key as KeyIcon,
  Link as LinkIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const WebhooksPage: React.FC = () => {
  const theme = useTheme();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventType, setNewEventType] = useState('');
  const [newCallbackUrl, setNewCallbackUrl] = useState('');
  const [newSecret, setNewSecret] = useState('');

  const { token } = useAuth();

  const availableEventTypes = [
    { type: 'sale.finalized', desc: 'Disparado quando uma venda é concluída.' },
    { type: 'order.created', desc: 'Disparado quando um novo pedido é gerado.' },
    { type: 'product.updated', desc: 'Disparado quando informações de um produto mudam.' },
    { type: 'customer.created', desc: 'Disparado ao cadastrar um novo cliente.' },
    { type: 'repair.completed', desc: 'Disparado quando uma OS é finalizada.' },
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
        body: JSON.stringify({ event_type: eventType, payload: { message: 'Simulated event data', id: Math.floor(Math.random() * 1000) } }),
      });
      alert(`Teste de payload enviado para: ${eventType}`);
    } catch (error) {
      console.error('Error simulating webhook trigger:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto' }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Webhooks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Integre a Redecell com outros sistemas em tempo real via eventos HTTP.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setIsModalOpen(true)}
          sx={{ borderRadius: '12px', px: 3, py: 1.5, fontWeight: 400 }}
        >
          Novo Webhook
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Lista de Webhooks */}
        <Grid item xs={12} md={8}>
          <Box display="flex" flexDirection="column" gap={3}>
            {webhooks.length === 0 ? (
              <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '24px', border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                <WebhookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Nenhum webhook registrado ainda.</Typography>
                <Button sx={{ mt: 2 }} onClick={() => setIsModalOpen(true)}>Clique aqui para começar</Button>
              </Paper>
            ) : (
              webhooks.map((webhook) => (
                <motion.div key={webhook.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Paper sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', position: 'relative' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '12px', color: 'primary.main' }}>
                          <WebhookIcon />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={400}>{webhook.event_type}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LinkIcon sx={{ fontSize: 14 }} /> {webhook.callback_url}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Switch 
                          checked={webhook.is_active} 
                          onChange={() => handleToggleWebhookStatus(webhook.id, webhook.is_active)}
                          color="success"
                        />
                        <IconButton color="error" size="small" onClick={() => handleDeleteWebhook(webhook.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2, opacity: 0.5 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" gap={2}>
                        <Chip size="small" label={`ID: ${webhook.id}`} variant="outlined" sx={{ borderRadius: '6px' }} />
                        {webhook.secret && (
                          <Tooltip title="Webhook Protegido com Segredo">
                            <Chip size="small" icon={<KeyIcon sx={{ fontSize: '14px !important' }} />} label="SECURED" color="primary" variant="outlined" sx={{ borderRadius: '6px' }} />
                          </Tooltip>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
                          Criado em {moment(webhook.created_at).format('LLL')}
                        </Typography>
                      </Box>
                      <Button 
                        size="small" 
                        startIcon={<PlayIcon />} 
                        onClick={() => handleSimulateTrigger(webhook.event_type)}
                        sx={{ fontWeight: 400 }}
                      >
                        Testar Payload
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              ))
            )}
          </Box>
        </Grid>

        {/* Sidebar Info & Events */}
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" fontWeight={400} gutterBottom>Status de Entrega</Typography>
              <Box display="flex" alignItems="center" gap={2} mt={3}>
                <CheckCircle sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={400}>98.4%</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Taxa de Sucesso (24h)</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px' }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <TimelineIcon color="action" />
                <Typography variant="h6" fontWeight={400}>Logs Recentes</Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {[1, 2, 3].map((i) => (
                  <ListItem key={i} sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {i === 3 ? <ErrorIcon color="error" /> : <CheckCircle color="success" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography variant="body2" fontWeight={400}>POST /sale.finalized</Typography>}
                      secondary={i === 3 ? "Erro 500: Timeout do host" : "Sucesso 200 - 45ms"}
                    />
                    <Typography variant="caption" color="text.secondary">Há {i*2}m</Typography>
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: '12px', textTransform: 'none', fontWeight: 400 }}>
                Ver Todos os Logs
              </Button>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <InfoIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={400}>Documentação</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" lineHeight={1.4} display="block">
                Webhooks permitem que seu sistema receba notificações automáticas. 
                Sempre enviamos um payload JSON via POST com o header <code>X-Redecell-Signature</code> se um segredo for definido.
              </Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Modal de Criação */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
          width: 550, bgcolor: 'background.paper', borderRadius: '24px', boxShadow: 24, p: 4 
        }}>
          <Typography variant="h5" sx={{ fontWeight: 400, mb: 1 }}>Registrar Webhook</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Escolha o evento e forneça a URL para onde enviaremos os dados.</Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Evento de Gatilho</InputLabel>
            <Select
              value={newEventType}
              onChange={(e) => setNewEventType(e.target.value as string)}
              label="Evento de Gatilho"
              sx={{ borderRadius: '12px' }}
            >
              {availableEventTypes.map((ev) => (
                <MenuItem key={ev.type} value={ev.type}>
                  <Box>
                    <Typography variant="body2" fontWeight={400}>{ev.type}</Typography>
                    <Typography variant="caption" color="text.secondary">{ev.desc}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="URL de Destino (Endpoint)"
            placeholder="https://sua-api.com/webhooks"
            value={newCallbackUrl}
            onChange={(e) => setNewCallbackUrl(e.target.value)}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          <TextField
            fullWidth
            label="Webhook Secret (Opcional)"
            type="password"
            value={newSecret}
            onChange={(e) => setNewSecret(e.target.value)}
            sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            helperText="Uma chave aleatória usada para assinar cada requisição por segurança."
          />

          <Box mt={4} display="flex" gap={2}>
            <Button fullWidth onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '12px', fontWeight: 400 }}>Cancelar</Button>
            <Button fullWidth variant="contained" onClick={handleCreateWebhook} sx={{ borderRadius: '12px', fontWeight: 400 }}>Salvar Configuração</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default WebhooksPage;
