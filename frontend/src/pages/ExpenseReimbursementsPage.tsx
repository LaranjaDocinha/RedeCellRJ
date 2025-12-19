import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Modal, Tabs, Tab, List, ListItem, ListItemText, Paper, TextField, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const ExpenseReimbursementsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, token } = useAuth();

  const isManager = useMemo(() => user?.permissions.some((p: any) => p.action === 'manage' && p.subject === 'Reimbursements'), [user]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!token) return;
      setLoading(true);
      let url = '/api/expense-reimbursements';
      if (isManager && activeTab === 0) {
        url += '?status=pending'; // Managers see pending requests by default
      } else {
        url = '/api/expense-reimbursements/me'; // Employees see their own
      }

      try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token, user, activeTab, isManager]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!token) return;
    // In a real app, you would handle file uploads to a service like S3 and get a URL.
    // For this example, we'll just pass a placeholder.
    const body = { ...formData, receipt_url: 'https://example.com/receipt.jpg', branch_id: user.branch_id };

    try {
        await fetch('/api/expense-reimbursements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        setIsModalOpen(false);
        window.location.reload(); // Simple refresh
    } catch (error) {
        console.error('Error creating request:', error);
    }
  }

  const handleReview = async (id: number, newStatus: 'approved' | 'rejected') => {
      if(!token) return;
      try {
          await fetch(`/api/expense-reimbursements/${id}/${newStatus}` , {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` }
          });
          window.location.reload();
      } catch (error) {
          console.error(`Error ${newStatus}ing request:`, error);
      }
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>Reembolso de Despesas</Typography>
        <Button variant="contained" onClick={handleOpenModal}>Nova Solicitação</Button>
      </Box>
      <Paper>
        {isManager && (
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
                <Tab label="Pendentes" />
                <Tab label="Minhas Solicitações" />
            </Tabs>
        )}
        <List>
          {loading ? <Typography>Carregando...</Typography> : requests.map(req => (
            <ListItem key={req.id}>
              <ListItemText 
                primary={`${req.description} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(req.amount)}`}
                secondary={`Solicitado por: ${req.user_name || user.name} em ${moment(req.created_at).format('DD/MM/YYYY')} - Status: ${req.status}`}
              />
              {isManager && req.status === 'pending' && (
                  <Box>
                      <Button color="success" onClick={() => handleReview(req.id, 'approved')}>Aprovar</Button>
                      <Button color="error" onClick={() => handleReview(req.id, 'rejected')}>Rejeitar</Button>
                  </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      {isModalOpen && <RequestModal onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
    </Box>
  );
};

const RequestModal = ({ onSave, onClose }: any) => {
    const [formData, setFormData] = useState({ amount: '', description: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    return (
        <Modal open onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                <Typography variant="h6">Nova Solicitação de Reembolso</Typography>
                <TextField fullWidth name="amount" label="Valor (R$)" type="number" value={formData.amount} onChange={handleChange} sx={{ my: 2 }} />
                <TextField fullWidth name="description" label="Descrição" multiline rows={3} value={formData.description} onChange={handleChange} sx={{ my: 2 }} />
                <Button variant="contained" component="label" fullWidth sx={{ my: 2 }}>
                    Anexar Recibo
                    <input type="file" hidden />
                </Button>
                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button onClick={onClose} sx={{ mr: 1 }}>Cancelar</Button>
                    <Button variant="contained" onClick={() => onSave(formData)}>Enviar</Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default ExpenseReimbursementsPage;
