import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal, TextField, FormControlLabel, Switch } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const FranchisesPage: React.FC = () => {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFranchiseName, setNewFranchiseName] = useState('');
  const [newFranchiseAddress, setNewFranchiseAddress] = useState('');
  const [newFranchiseContactPerson, setNewFranchiseContactPerson] = useState('');
  const [newFranchiseContactEmail, setNewFranchiseContactEmail] = useState('');

  const { token } = useAuth();

  const fetchFranchises = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/franchises', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFranchises(data);
    } catch (error) {
      console.error('Error fetching franchises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchises();
  }, [token]);

  const handleCreateFranchise = async () => {
    if (!token) return;
    try {
      await fetch('/api/franchises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newFranchiseName,
          address: newFranchiseAddress,
          contact_person: newFranchiseContactPerson,
          contact_email: newFranchiseContactEmail,
        }),
      });
      setIsModalOpen(false);
      setNewFranchiseName('');
      setNewFranchiseAddress('');
      setNewFranchiseContactPerson('');
      setNewFranchiseContactEmail('');
      fetchFranchises();
    } catch (error) {
      console.error('Error creating franchise:', error);
    }
  };

  const handleToggleFranchiseStatus = async (id: number, currentStatus: boolean) => {
    if (!token) return;
    try {
      await fetch(`/api/franchises/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      fetchFranchises();
    } catch (error) {
      console.error('Error toggling franchise status:', error);
    }
  };

  const handleDeleteFranchise = async (id: number) => {
    if (!token) return;
    if (window.confirm('Tem certeza que deseja deletar esta franquia?')) {
      try {
        await fetch(`/api/franchises/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchFranchises();
      } catch (error) {
        console.error('Error deleting franchise:', error);
      }
    }
  };

  const handleViewConsolidatedReports = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/franchises/reports/consolidated', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      alert(`Relatórios Consolidados (Simulado): ${data.message}`);
    } catch (error) {
      console.error('Error fetching consolidated reports:', error);
      alert('Erro ao buscar relatórios consolidados.');
    }
  };

  const handleViewFranchiseSettings = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/franchises/${id}/settings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      alert(`Configurações da Franquia ${id} (Simulado): ${JSON.stringify(data.settings)}`);
    } catch (error) {
      console.error('Error fetching franchise settings:', error);
      alert(`Erro ao buscar configurações da franquia ${id}.`);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Gerenciamento de Franquias</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Franquias Registradas</Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>Registrar Nova Franquia</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell>Email de Contato</TableCell>
                <TableCell>Ativa</TableCell>
                <TableCell>Criada Em</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {franchises.map((franchise) => (
                <TableRow key={franchise.id}>
                  <TableCell>{franchise.id}</TableCell>
                  <TableCell>{franchise.name}</TableCell>
                  <TableCell>{franchise.address}</TableCell>
                  <TableCell>{franchise.contact_person}</TableCell>
                  <TableCell>{franchise.contact_email}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={<Switch checked={franchise.is_active} onChange={() => handleToggleFranchiseStatus(franchise.id, franchise.is_active)} />}
                      label={franchise.is_active ? 'Sim' : 'Não'}
                    />
                  </TableCell>
                  <TableCell>{moment(franchise.created_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>
                    <Button size="small" color="info" onClick={() => handleViewFranchiseSettings(franchise.id)} sx={{ mr: 1 }}>Ver Config.</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteFranchise(franchise.id)}>Deletar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h5">Relatórios Consolidados (Simulado)</Typography>
        <Button variant="contained" onClick={handleViewConsolidatedReports} sx={{ mt: 2 }}>Ver Relatórios Consolidados</Button>
      </Paper>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>Registrar Nova Franquia</Typography>
          <TextField
            fullWidth
            label="Nome da Franquia"
            value={newFranchiseName}
            onChange={(e) => setNewFranchiseName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Endereço"
            value={newFranchiseAddress}
            onChange={(e) => setNewFranchiseAddress(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Pessoa de Contato"
            value={newFranchiseContactPerson}
            onChange={(e) => setNewFranchiseContactPerson(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email de Contato"
            value={newFranchiseContactEmail}
            onChange={(e) => setNewFranchiseContactEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={() => setIsModalOpen(false)} sx={{ mr: 1 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleCreateFranchise}>Registrar Franquia</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FranchisesPage;
