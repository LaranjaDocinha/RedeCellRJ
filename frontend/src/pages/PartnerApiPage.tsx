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
  Checkbox, 
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  VpnKey as KeyIcon, 
  Add as AddIcon, 
  ContentCopy as CopyIcon, 
  Delete as DeleteIcon, 
  Code as CodeIcon,
  Security as SecurityIcon,
  Terminal as TerminalIcon,
  IntegrationInstructions as DocIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion } from 'framer-motion';

const PartnerApiPage: React.FC = () => {
  const theme = useTheme();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const { token } = useAuth();

  const availablePermissions = [
    'sales:read', 'sales:write',
    'inventory:read', 'inventory:write',
    'customers:read', 'customers:write',
  ];

  const fetchApiKeys = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/partner-api/keys', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setApiKeys(data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [token]);

  const handleCreateApiKey = async () => {
    if (!token) return;
    try {
      await fetch('/api/partner-api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          partner_name: newPartnerName,
          permissions: newPermissions,
          expires_at: newExpiresAt || null,
        }),
      });
      setIsModalOpen(false);
      setNewPartnerName('');
      setNewPermissions([]);
      setNewExpiresAt('');
      fetchApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleRevokeApiKey = async (id: number) => {
    if (!token) return;
    if (window.confirm('Tem certeza que deseja revogar esta chave API? Esta ação é irreversível.')) {
      try {
        await fetch(`/api/partner-api/keys/${id}/revoke`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchApiKeys();
      } catch (error) {
        console.error('Error revoking API key:', error);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopySuccess(true);
  };

  const codeSnippet = `
// Exemplo de integração em Node.js
const axios = require('axios');

async function getSales() {
  const response = await axios.get('https://api.redercell.com.br/v1/sales', {
    headers: {
      'X-API-Key': 'SUA_CHAVE_AQUI',
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}
  `;

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto' }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Developer Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Crie chaves de acesso e gerencie integrações personalizadas com nossa API.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setIsModalOpen(true)}
          sx={{ borderRadius: '12px', px: 3, py: 1.5, fontWeight: 700 }}
        >
          Gerar Nova Chave
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Gestão de Chaves */}
        <Grid item xs={12} lg={8}>
          <Box display="flex" flexDirection="column" gap={3}>
            {apiKeys.length === 0 ? (
              <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '24px', border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                <KeyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Você ainda não gerou nenhuma chave API.</Typography>
                <Button sx={{ mt: 2 }} onClick={() => setIsModalOpen(true)}>Gerar minha primeira chave</Button>
              </Paper>
            ) : (
              apiKeys.map((key) => (
                <motion.div key={key.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Paper sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: key.is_active ? 'success.light' : 'action.disabled', color: 'white', borderRadius: '12px' }}>
                          <SecurityIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={800}>{key.partner_name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
                            ID: {key.id} • CRIADA EM {moment(key.created_at).format('DD/MM/YYYY')}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={key.is_active ? "ATIVA" : "REVOGADA"} 
                        color={key.is_active ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 900, borderRadius: '6px' }}
                      />
                    </Box>

                    <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: '12px', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {key.api_key.substring(0, 12)}••••••••••••••••••••••••
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(key.api_key)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                      {key.permissions.map((p: string) => (
                        <Chip key={p} label={p} size="small" variant="outlined" sx={{ borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }} />
                      ))}
                    </Stack>

                    <Divider sx={{ my: 2, opacity: 0.5 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color={key.expires_at ? 'warning.main' : 'text.disabled'} sx={{ fontWeight: 700 }}>
                        {key.expires_at ? `Expira em: ${moment(key.expires_at).format('LL')}` : 'Sem expiração programada'}
                      </Typography>
                      {key.is_active && (
                        <Button 
                          color="error" 
                          size="small" 
                          startIcon={<DeleteIcon />} 
                          onClick={() => handleRevokeApiKey(key.id)}
                          sx={{ fontWeight: 700 }}
                        >
                          Revogar Acesso
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </motion.div>
              ))
            )}
          </Box>
        </Grid>

        {/* Info & Snippets */}
        <Grid item xs={12} lg={4}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'primary.main', color: 'white' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <DocIcon />
                <Typography variant="h6" fontWeight={800}>Guia Rápido</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                Nossa API utiliza autenticação via Token na Header. Use o campo <code>X-API-Key</code> em todas as requisições para os endpoints autorizados.
              </Typography>
              <Button sx={{ mt: 2, color: 'white', borderColor: 'rgba(255,255,255,0.5)', textTransform: 'none' }} variant="outlined" fullWidth>
                Ver Documentação Completa
              </Button>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#1e1e1e', color: '#d4d4d4' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TerminalIcon sx={{ color: '#4caf50' }} />
                  <Typography variant="subtitle2" fontWeight={800}>Code Snippet (Node.js)</Typography>
                </Box>
                <IconButton size="small" onClick={() => copyToClipboard(codeSnippet)} sx={{ color: 'inherit' }}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', overflow: 'auto' }}>
                {codeSnippet}
              </pre>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>Endpoints Disponíveis</Typography>
              <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
                {['/sales', '/products', '/customers', '/inventory'].map(ep => (
                  <Box key={ep} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{ep}</Typography>
                    <Chip label="GET" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, bgcolor: 'success.light', color: 'white' }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Modal de Criação */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
          width: 500, bgcolor: 'background.paper', borderRadius: '24px', boxShadow: 24, p: 4 
        }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Gerar Chave API</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Nomeie o parceiro e defina quais permissões esta chave terá.</Typography>
          
          <TextField
            fullWidth
            label="Nome do Parceiro / Aplicação"
            placeholder="Ex: Loja Virtual, ERP Externo..."
            value={newPartnerName}
            onChange={(e) => setNewPartnerName(e.target.value)}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Permissões da Chave</InputLabel>
            <Select
              multiple
              value={newPermissions}
              onChange={(e) => setNewPermissions(e.target.value as string[])}
              label="Permissões da Chave"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" sx={{ borderRadius: '6px' }} />
                  ))}
                </Box>
              )}
              sx={{ borderRadius: '12px' }}
            >
              {availablePermissions.map((perm) => (
                <MenuItem key={perm} value={perm}>
                  <Checkbox checked={newPermissions.indexOf(perm) > -1} />
                  <ListItemText primary={perm} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Data de Expiração (Opcional)"
            type="datetime-local"
            value={newExpiresAt}
            onChange={(e) => setNewExpiresAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          <Box display="flex" gap={2}>
            <Button fullWidth onClick={() => setIsModalOpen(false)} sx={{ borderRadius: '12px', fontWeight: 700 }}>Cancelar</Button>
            <Button fullWidth variant="contained" onClick={handleCreateApiKey} sx={{ borderRadius: '12px', fontWeight: 700 }}>Gerar Chave Agora</Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={() => setShowCopySuccess(false)}
        message="Copiado para a área de transferência!"
      />
    </Box>
  );
};

export default PartnerApiPage;