import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const PartnerApiPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [newExpiresAt, setNewExpiresAt] = useState('');

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
    if (window.confirm('Tem certeza que deseja revogar esta chave API?')) {
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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>API para Parceiros</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Chaves API</Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>Gerar Nova Chave API</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome do Parceiro</TableCell>
                <TableCell>Chave API</TableCell>
                <TableCell>Permissões</TableCell>
                <TableCell>Ativa</TableCell>
                <TableCell>Criada Em</TableCell>
                <TableCell>Expira Em</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.id}</TableCell>
                  <TableCell>{key.partner_name}</TableCell>
                  <TableCell>{key.api_key.substring(0, 8)}...</TableCell>
                  <TableCell>{JSON.stringify(key.permissions)}</TableCell>
                  <TableCell>{key.is_active ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{moment(key.created_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>{key.expires_at ? moment(key.expires_at).format('DD/MM/YYYY HH:mm') : 'Nunca'}</TableCell>
                  <TableCell>
                    {key.is_active && (
                      <Button size="small" color="error" onClick={() => handleRevokeApiKey(key.id)}>Revogar</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>Gerar Nova Chave API</Typography>
          <TextField
            fullWidth
            label="Nome do Parceiro"
            value={newPartnerName}
            onChange={(e) => setNewPartnerName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Permissões</InputLabel>
            <Select
              multiple
              value={newPermissions}
              onChange={(e) => setNewPermissions(e.target.value as string[])}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {availablePermissions.map((permission) => (
                <MenuItem key={permission} value={permission}>
                  <Checkbox checked={newPermissions.indexOf(permission) > -1} />
                  <ListItemText primary={permission} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Expira Em (Opcional)"
            type="datetime-local"
            value={newExpiresAt}
            onChange={(e) => setNewExpiresAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={() => setIsModalOpen(false)} sx={{ mr: 1 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleCreateApiKey}>Gerar Chave</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default PartnerApiPage;
