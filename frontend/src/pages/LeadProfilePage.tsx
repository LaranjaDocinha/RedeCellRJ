import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  Timeline as TimelineIcon,
  AttachMoney as AttachMoneyIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import LeadTasks from '../components/TaskManagement/LeadTasks';

// Mock Interfaces for now, should match backend
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  assignedTo?: number;
  score: number;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: 'email' | 'call' | 'note' | 'status_change';
  description: string;
  timestamp: string;
  user?: string;
}

const LeadProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const theme = useTheme();

  // Fetch lead data
  const { data: lead, isLoading, error } = useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await axios.get(`/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { ...response.data, id: String(response.data.id) }; // Ensure ID is string
    },
    enabled: !!token && !!id,
  });

  // Mock Activities for now
  const activities: Activity[] = [
    { id: '1', type: 'status_change', description: 'Status alterado para Contactado', timestamp: '2025-12-20T10:00:00Z', user: 'Agente de Vendas' },
    { id: '2', type: 'email', description: 'E-mail enviado: Boas-vindas', timestamp: '2025-12-20T10:30:00Z', user: 'Agente de Vendas' },
    { id: '3', type: 'call', description: 'Chamada realizada: Primeiro contato', timestamp: '2025-12-20T11:00:00Z', user: 'Agente de Vendas' },
    { id: '4', type: 'note', description: 'Lead interessado em solução X, agendar demo.', timestamp: '2025-12-20T12:00:00Z', user: 'Agente de Vendas' },
  ];

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'qualified': return 'success';
      case 'converted': return 'primary';
      case 'unqualified': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'Novo';
      case 'contacted': return 'Contactado';
      case 'qualified': return 'Qualificado';
      case 'converted': return 'Convertido';
      case 'unqualified': return 'Desqualificado';
      default: return 'Desconhecido';
    }
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );

  if (error || !lead) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Typography color="error">Lead não encontrado ou erro ao carregar.</Typography>
      <Button onClick={() => navigate('/leads')} startIcon={<ArrowBackIcon />}>Voltar para Leads</Button>
    </Box>
  );

  return (
    <Box p={4} sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Button 
        onClick={() => navigate('/leads')} 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Voltar para a Gestão de Leads
      </Button>

      <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: 3, mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 80, height: 80, fontSize: '2rem' }}>
              {lead.name ? lead.name[0] : <PersonIcon />}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {lead.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip icon={<EmailIcon />} label={lead.email} color="info" variant="outlined" />
              {lead.phone && <Chip icon={<PhoneIcon />} label={lead.phone} color="info" variant="outlined" />}
              <Chip icon={<BusinessIcon />} label={lead.source} color="secondary" variant="outlined" />
              <Chip label={getStatusLabel(lead.status)} color={getStatusColor(lead.status)} />
              <Chip label={`Score: ${lead.score}`} color="primary" />
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Informações Detalhadas
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Responsável" secondary={lead.assignedTo ? `User ID: ${lead.assignedTo}` : 'Não Atribuído'} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AccessTimeIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Criado em" secondary={new Date(lead.createdAt).toLocaleString()} />
              </ListItem>
              <ListItem>
                <ListItemIcon><AccessTimeIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Última Atualização" secondary={new Date(lead.updatedAt).toLocaleString()} />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <LeadTasks leadId={lead.id} />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Timeline de Atividades
            </Typography>
            <List>
              {activities.map(activity => (
                <ListItem key={activity.id} sx={{ alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                    {activity.type === 'email' && <EmailIcon color="primary" />}
                    {activity.type === 'call' && <PhoneIcon color="success" />}
                    {activity.type === 'note' && <ChatIcon color="info" />}
                    {activity.type === 'status_change' && <TimelineIcon color="action" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {activity.user}
                        </Typography>
                        {" — " + new Date(activity.timestamp).toLocaleString()}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button fullWidth variant="outlined" sx={{ mt: 2 }}>Ver Todas as Atividades</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Negócios Associados
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon color="action" /></ListItemIcon>
                <ListItemText primary="Proposta Enviada #1234" secondary="Valor: R$ 5.000,00 - Status: Pendente" />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon color="success" /></ListItemIcon>
                <ListItemText primary="Negócio Fechado #5678" secondary="Valor: R$ 10.000,00 - Status: Concluído" />
              </ListItem>
            </List>
            <Button fullWidth variant="outlined" sx={{ mt: 2 }}>Ver Todos os Negócios</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadProfilePage;
