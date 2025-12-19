import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Switch } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Delete } from '@mui/icons-material';

interface Automation {
  id: number;
  name: string;
  trigger_type: string;
  is_active: boolean;
}

const AutomationListPage: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchAutomations = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/marketing-automations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch automations');
      const data = await response.json();
      setAutomations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this automation?')) {
      try {
        await fetch(`/api/marketing-automations/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAutomations();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    // This requires an update to the updateAutomation method to handle partial updates
    console.log('Toggling active state for', id, isActive);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Automações de Marketing</Typography>
        <Button component={Link} to="/marketing-automations/new" variant="contained">Criar Automação</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Gatilho</TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4}>Carregando...</TableCell></TableRow>
            ) : (
              automations.map(automation => (
                <TableRow key={automation.id}>
                  <TableCell>{automation.name}</TableCell>
                  <TableCell>{automation.trigger_type}</TableCell>
                  <TableCell>
                    <Switch
                      checked={automation.is_active}
                      onChange={(e) => handleToggleActive(automation.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton component={Link} to={`/marketing-automations/edit/${automation.id}`}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(automation.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AutomationListPage;
