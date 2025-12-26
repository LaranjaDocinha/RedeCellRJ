import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs, 
  Tab, 
  Paper, 
  Grid, 
  Avatar, 
  Chip, 
  Divider, 
  IconButton, 
  Stack, 
  useTheme,
  CircularProgress,
  CardContent
} from '@mui/material';
import { 
  Add as AddIcon, 
  CheckCircle as ApproveIcon, 
  Cancel as RejectIcon,
  Person as UserIcon,
  Store as BranchIcon,
  CalendarMonth as DateIcon,
  FilePresent as AttachmentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion } from 'framer-motion';
import { ExpenseForm } from '../components/ExpenseForm'; // Novo componente

const ExpenseReimbursementsPage: React.FC = () => {
  const theme = useTheme();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user, token } = useAuth();

  const isManager = useMemo(() => user?.permissions.some((p: any) => p.action === 'manage' && p.subject === 'Reimbursements'), [user]);

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (requests.length === 0) { 
          const mockData = [
            { id: 1, description: 'Combustível para entrega Barra', amount: 85.50, status: 'pending', user_name: 'Juliana Dias', created_at: new Date(), branch: 'Matriz' },
            { id: 2, description: 'Material de escritório (Papel A4)', amount: 120.00, status: 'approved', user_name: 'Marcos Paulo', created_at: moment().subtract(2, 'days'), branch: 'Barra' },
            { id: 3, description: 'Almoço com Fornecedor Peças', amount: 250.00, status: 'rejected', user_name: 'Ana Paula', created_at: moment().subtract(1, 'week'), branch: 'Matriz' },
          ];
          setRequests(mockData);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: any) => {
    const newItem = {
      id: requests.length + 1,
      description: data.description + (data.category ? ` (${data.category})` : ''),
      amount: parseFloat(data.amount),
      status: 'pending',
      user_name: user?.name || 'Usuário Atual',
      created_at: new Date(),
      branch: 'Matriz'
    };
    setRequests([newItem, ...requests]);
    setIsModalOpen(false);
    alert('Solicitação enviada com sucesso!');
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleReview = async (id: number, newStatus: 'approved' | 'rejected') => {
    alert(`Solicitação #${id} ${newStatus === 'approved' ? 'aprovada' : 'rejeitada'}.`);
    fetchRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  if (loading && requests.length === 0) return (
    <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
  );

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">
          Reembolsos de Despesas
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setIsModalOpen(true)}
          sx={{ borderRadius: '12px', px: 3, boxShadow: '0 10px 20px rgba(25, 118, 210, 0.2)' }}
        >
          Nova Solicitação
        </Button>
      </Box>

      {isManager && (
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)} 
          sx={{ mb: 4, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab label={`Pendentes (${requests.filter(r => r.status === 'pending').length})`} />
          <Tab label="Todo o Histórico" />
        </Tabs>
      )}

      <Grid container spacing={3}>
        {requests.filter(r => activeTab === 0 ? r.status === 'pending' : true).map((req, idx) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={req.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Paper sx={{ 
                p: 0, borderRadius: '24px', border: '1px solid', borderColor: 'divider', 
                overflow: 'hidden', position: 'relative', bgcolor: 'background.paper',
                '&:hover': { borderColor: 'primary.main', boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }
              }}>
                {/* Header do Recibo */}
                <Box sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>ID: #RE-{req.id}</Typography>
                  <Chip 
                    label={req.status.toUpperCase()} 
                    size="small" 
                    color={getStatusColor(req.status) as any} 
                    sx={{ fontSize: '0.6rem', borderRadius: '6px' }} 
                  />
                </Box>
                
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ height: 50, overflow: 'hidden' }}>
                    {req.description}
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ mb: 3 }}>
                    R$ {req.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>

                  <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                  <Stack spacing={1.5}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'divider', color: 'text.secondary' }}><UserIcon sx={{ fontSize: 14 }} /></Avatar>
                      <Typography variant="body2" color="text.secondary">Solicitado por: {req.user_name}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'divider', color: 'text.secondary' }}><BranchIcon sx={{ fontSize: 14 }} /></Avatar>
                      <Typography variant="body2" color="text.secondary">Filial: {req.branch || 'Matriz'}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'divider', color: 'text.secondary' }}><DateIcon sx={{ fontSize: 14 }} /></Avatar>
                      <Typography variant="body2" color="text.secondary">{moment(req.created_at).format('LLL')}</Typography>
                    </Box>
                  </Stack>

                  <Box mt={4} display="flex" gap={1.5}>
                    <Button fullWidth variant="outlined" startIcon={<AttachmentIcon />} sx={{ borderRadius: '10px', textTransform: 'none' }}>Ver Recibo</Button>
                    {isManager && req.status === 'pending' && (
                      <Stack direction="row" spacing={1} flexShrink={0}>
                        <IconButton color="success" onClick={() => handleReview(req.id, 'approved')} sx={{ border: '1px solid', borderColor: 'success.light' }}><ApproveIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleReview(req.id, 'rejected')} sx={{ border: '1px solid', borderColor: 'error.light' }}><RejectIcon /></IconButton>
                      </Stack>
                    )}
                  </Box>
                </CardContent>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Novo Modal com o ExpenseForm */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        <DialogTitle>Nova Solicitação de Reembolso</DialogTitle>
        <DialogContent>
          <Box mt={1}>
             <ExpenseForm 
                onSubmit={handleSubmit} 
                onCancel={() => setIsModalOpen(false)} 
             />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ExpenseReimbursementsPage;
