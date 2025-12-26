import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import moment from 'moment';
import axios from 'axios';
import { Edit } from '@mui/icons-material';

interface Integration {
  id: number;
  platform: string;
  shop_id: string;
  is_active: boolean;
  last_synced_at: string;
}

const MarketplaceSyncPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'shopee',
    access_token: '',
    shop_id: '',
    is_active: true
  });
  
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const platforms = [
    { value: 'shopee', label: 'Shopee' },
    { value: 'mercadolivre', label: 'Mercado Livre' }
  ];

  const fetchIntegrations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/marketplace/integrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIntegrations(res.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [token]);

  const handleSubmit = async () => {
    try {
      await axios.post('/api/marketplace/integrations', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Integração salva com sucesso!', 'success');
      setFormData({ platform: 'shopee', access_token: '', shop_id: '', is_active: true }); // Reset
      fetchIntegrations();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Erro ao salvar integração', 'error');
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/marketplace/integrations/${id}/toggle`, { is_active: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchIntegrations();
    } catch (error) {
      showNotification('Erro ao alterar status', 'error');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Configuração de Marketplaces</Typography>

      <Grid container spacing={3}>
        {/* Lista de Integrações */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Integrações Ativas</Typography>
            <List>
              {integrations.map((integration) => (
                <ListItem key={integration.id} divider secondaryAction={
                  <Switch 
                    checked={integration.is_active} 
                    onChange={() => handleToggle(integration.id, integration.is_active)} 
                  />
                }>
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {integration.platform.toUpperCase()}
                        <Chip 
                          label={integration.is_active ? "Ativo" : "Inativo"} 
                          color={integration.is_active ? "success" : "default"} 
                          size="small" 
                        />
                      </Box>
                    } 
                    secondary={`Shop ID: ${integration.shop_id} | Último Sync: ${integration.last_synced_at ? moment(integration.last_synced_at).format('DD/MM HH:mm') : 'Nunca'}`} 
                  />
                </ListItem>
              ))}
              {integrations.length === 0 && <Typography variant="body2" color="textSecondary">Nenhuma integração configurada.</Typography>}
            </List>
          </Paper>
        </Grid>

        {/* Formulário de Adição */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Adicionar / Atualizar Integração</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Plataforma</InputLabel>
                <Select
                  value={formData.platform}
                  label="Plataforma"
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  {platforms.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField
                label="Shop ID"
                value={formData.shop_id}
                onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                fullWidth
              />

              <TextField
                label="Access Token"
                value={formData.access_token}
                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                fullWidth
                type="password"
                helperText="Token gerado no painel de desenvolvedor da plataforma"
              />

              <FormControlLabel
                control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
                label="Ativar Integração Imediatamente"
              />

              <Button variant="contained" onClick={handleSubmit}>
                Salvar Integração
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketplaceSyncPage;
