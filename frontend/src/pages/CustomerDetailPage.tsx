import React, { useState } from 'react';
import { useParams, Link, useLoaderData, useNavigation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  Modal, 
  Tabs, 
  Tab, 
  Avatar, 
  Stack, 
  Chip, 
  Divider,
  alpha,
  useTheme,
  IconButton
} from '@mui/material';
import { 
  FaWhatsapp, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaCrown, 
  FaWallet, 
  FaShoppingCart, 
  FaTools, 
  FaHistory,
  FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import CommunicationTimeline from '../components/CommunicationTimeline';
import CommunicationForm from '../components/CommunicationForm';
import PurchaseSuggestions from '../components/PurchaseSuggestions';
import ChurnRiskIndicator from '../components/Customer/ChurnRiskIndicator';
import CollaborativeRecommendations from '../components/Customer/CollaborativeRecommendations';
import CustomerTimeline from '../components/CustomerTimeline';
import api from '../services/api';

interface CustomerDetailLoaderData {
  customer: any;
  communications: any[];
}

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customer, communications: initialCommunications } = useLoaderData() as CustomerDetailLoaderData;
  const navigation = useNavigation();
  const theme = useTheme();
  const [communications, setCommunications] = useState(initialCommunications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTimeline = async () => {
        setIsTimelineLoading(true);
        try {
            const res = await api.get(`/customer360/${id}/timeline`);
            const mapped = res.data.map((e: any) => ({ ...e, date: new Date(e.date) }));
            setTimelineEvents(mapped);
        } catch (e) { console.error(e); }
        finally { setIsTimelineLoading(false); }
    };
    if (id) fetchTimeline();
  }, [id]);

  const isLoading = navigation.state === 'loading';

  const refetchCommunications = async () => {
    if (!id || !token) return;
    try {
      const commsRes = await fetch(`/api/v1/customers/${id}/communications`, { headers: { Authorization: `Bearer ${token}` } });
      if (!commsRes.ok) throw new Error('Failed to refetch customer communications');
      const commsData = await commsRes.json();
      setCommunications(commsData);
    } catch (error) { console.error(error); }
  };

  if (isLoading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  if (!customer) return <Typography>Cliente não encontrado.</Typography>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* Header com Navegação */}
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <Button component={Link} to="/customers" startIcon={<FaArrowLeft />} sx={{ color: 'text.secondary', fontWeight: 400 }}>
          Voltar para Clientes
        </Button>
      </Stack>

      <Grid container spacing={3}>
        
        {/* Perfil Esquerdo */}
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Paper sx={{ p: 4, borderRadius: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', bgcolor: alpha(theme.palette.primary.main, 0.05) }} />
                
                <Avatar 
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, border: `4px solid ${theme.palette.background.paper}`, position: 'relative', zIndex: 1, bgcolor: theme.palette.primary.main, fontSize: '2rem' }}
                >
                    {customer.name[0]}
                </Avatar>
                
                <Typography variant="h5" fontWeight={400} gutterBottom>{customer.name}</Typography>
                <Chip label={customer.rfm_segment || 'Novo Cliente'} size="small" sx={{ mb: 3, fontWeight: 400 }} color="primary" variant="outlined" />

                <Stack spacing={2} sx={{ textAlign: 'left', mt: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton size="small" sx={{ bgcolor: alpha('#25D366', 0.1), color: '#25D366' }}><FaWhatsapp size={14}/></IconButton>
                        <Typography variant="body2">{customer.phone}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}><FaEnvelope size={14}/></IconButton>
                        <Typography variant="body2">{customer.email}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}><FaMapMarkerAlt size={14}/></IconButton>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{customer.address}</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', borderStyle: 'dashed' }}>
                            <FaCrown color={theme.palette.warning.main} style={{ marginBottom: 8 }} />
                            <Typography variant="h6" sx={{ fontWeight: 400 }}>{customer.loyalty_points || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Pontos</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', borderStyle: 'dashed' }}>
                            <FaWallet color={theme.palette.success.main} style={{ marginBottom: 8 }} />
                            <Typography variant="h6" sx={{ fontWeight: 400 }}>R$ {Number(customer.store_credit_balance || 0).toFixed(2)}</Typography>
                            <Typography variant="caption" color="text.secondary">Crédito</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Button fullWidth variant="contained" sx={{ mt: 4, borderRadius: '12px', py: 1.5, fontWeight: 400 }} component={Link} to={`/pos?customerId=${customer.id}`}>
                    Iniciar Nova Venda
                </Button>
            </Paper>
            
            <Box mt={3}>
                <ChurnRiskIndicator customerId={id as string} />
            </Box>
          </motion.div>
        </Grid>

        {/* Abas Direita */}
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Paper sx={{ p: 1, borderRadius: '24px', minHeight: '600px' }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 2, pt: 1 }}>
                    <Tab label="Histórico" icon={<FaHistory />} iconPosition="start" />
                    <Tab label="Consumo IA" icon={<FaShoppingCart />} iconPosition="start" />
                    <Tab label="Ordens" icon={<FaTools />} iconPosition="start" />
                </Tabs>
                <Box sx={{ p: 3 }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 0 && (
                            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight={400}>Linha do Tempo 360°</Typography>
                                    <Button variant="outlined" onClick={() => setIsModalOpen(true)} startIcon={<FaCalendarAlt />}>Registrar Evento</Button>
                                </Box>
                                {isTimelineLoading ? <CircularProgress /> : <CustomerTimeline events={timelineEvents} />}
                                <Box mt={4}>
                                    <Typography variant="subtitle2" gutterBottom>Comunicações</Typography>
                                    <CommunicationTimeline communications={communications} />
                                </Box>
                            </motion.div>
                        )}
                        {activeTab === 1 && (
                            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <CollaborativeRecommendations customerId={id as string} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <PurchaseSuggestions customerId={customer.id} />
                                    </Grid>
                                </Grid>
                            </motion.div>
                        )}
                        {activeTab === 2 && (
                            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Typography variant="h6" fontWeight={400} mb={2}>Ordens de Serviço e Vendas</Typography>
                                <Typography variant="body2" color="text.secondary">Lista consolidada em desenvolvimento...</Typography>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '24px' }}>
          <CommunicationForm customerId={customer.id} onSubmit={(d) => { setIsModalOpen(false); refetchCommunications(); }} onCancel={() => setIsModalOpen(false)} />
        </Box>
      </Modal>
    </Box>
  );
};

export default CustomerDetailPage;
