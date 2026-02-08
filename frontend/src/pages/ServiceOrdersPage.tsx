import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  TextField, 
  IconButton, 
  Chip, 
  Avatar, 
  Stack, 
  Divider, 
  useTheme,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  Badge,
  LinearProgress
} from '@mui/material';
import { 
  FaPlus, 
  FaSearch, 
  FaWrench,
  FaCheckCircle,
  FaPrint,
  FaHistory,
  FaArrowRight,
  FaTimes,
  FaColumns,
  FaExclamationCircle,
  FaWhatsapp,
  FaHourglassHalf,
  FaCamera,
  FaSignature,
  FaTools,
  FaShieldAlt,
  FaChartLine,
  FaSync,
  FaUserCog
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import type { ServiceOrder } from '../types/serviceOrder';
import { getServiceOrders } from '../services/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import ErrorBoundary from '../components/ErrorBoundary';
import ServiceOrderForm from '../components/ServiceOrderForm';
import api from '../services/api';
import moment from 'moment';

interface ServiceOrdersPageProps {
  initialOrders?: ServiceOrder[];
}

const ServiceOrdersPage: React.FC<ServiceOrdersPageProps> = ({ initialOrders }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme.palette.mode === 'dark';
  const { token, user } = useAuth();
  const { addNotification } = useNotification();
  
  const [viewMode, setViewMode] = useState<'cards' | 'kanban'>('cards');
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<ServiceOrder[]>(initialOrders || []);
  const [loading, setLoading] = useState(!initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!token || initialOrders) return;
    try {
      setLoading(true);
      const data = await getServiceOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      addNotification('Falha ao carregar ordens de serviço.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // #14 Identificação de Gargalos (> 24h)
  const getBottleneckInfo = (updatedAt: string) => {
    const hours = moment().diff(moment(updatedAt), 'hours');
    return { isBottleneck: hours > 24, hours };
  };

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => 
        (o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.product_description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.brand?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (String(o.id).includes(searchTerm))
    );

    if (viewMode === 'cards') {
        if (activeTab === 0) result = result.filter(o => ['Aguardando Avaliação', 'Aguardando Aprovação'].includes(o.status));
        if (activeTab === 1) result = result.filter(o => ['Aprovado', 'Em Reparo', 'Aguardando Peça'].includes(o.status));
        if (activeTab === 2) result = result.filter(o => ['Finalizado', 'Entregue'].includes(o.status));
    }

    return result;
  }, [orders, searchTerm, activeTab, viewMode]);

  // #1 Kanban Estratégico
  const kanbanColumns = [
    { title: 'Triagem', status: ['Aguardando Avaliação'], color: theme.palette.warning.main, icon: <FaTools /> },
    { title: 'Orçados', status: ['Aguardando Aprovação'], color: theme.palette.info.main, icon: <FaExclamationCircle /> },
    { title: 'Em Execução', status: ['Aprovado', 'Em Reparo'], color: theme.palette.primary.main, icon: <FaWrench /> },
    { title: 'Testes / Peça', status: ['Aguardando Peça', 'Aguardando QA'], color: theme.palette.secondary.main, icon: <FaHourglassHalf /> },
    { title: 'Pronto', status: ['Finalizado'], color: theme.palette.success.main, icon: <FaCheckCircle /> },
  ];

  const handleCreateOrder = async (data: any) => {
    try {
        await api.post('/api/service-orders', data);
        addNotification('Ordem de Serviço registrada!', 'success');
        setIsFormOpen(false);
        fetchOrders();
    } catch (e: any) { 
        addNotification(e.response?.data?.message || 'Erro ao salvar.', 'error'); 
    }
  };

  // #11 Smart WhatsApp Push com Fotos
  const sendWhatsApp = (order: ServiceOrder) => {
    const text = `Olá *${order.customer_name}*! 👋\n\nAqui é da *RedecellRJ*.\n\nSua OS *#${order.id}* do aparelho *${order.product_description}* foi atualizada para: *${order.status}*.\n\nVocê pode acompanhar em tempo real aqui: [Link do Portal]`;
    window.open(`https://wa.me/${order.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // #10 Calculadora de Lucro OS
  const getProfitInfo = (estimated: number, partsCost: number = 0) => {
      const profit = estimated - partsCost;
      const margin = (profit / estimated) * 100;
      return { profit, margin };
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1800, margin: '0 auto', minHeight: '100vh', bgcolor: 'background.default' }}>
        
        {/* Top Operational Header (#30) */}
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
            <Box>
                <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px', background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Centro Técnico
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                    <Chip icon={<FaUserCog />} label={`Operador: ${user?.name || 'Sistema'}`} size="small" variant="outlined" sx={{ borderRadius: '8px', fontWeight: 400 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FaSync className={loading ? 'fa-spin' : ''} /> Última atualização: {moment().format('HH:mm')}
                    </Typography>
                </Stack>
            </Box>
            
            <Stack direction="row" spacing={2}>
                <Paper variant="outlined" sx={{ p: 0.5, borderRadius: '14px', display: 'flex', gap: 0.5, bgcolor: 'background.paper' }}>
                    <Button size="small" variant={viewMode === 'cards' ? "contained" : "text"} onClick={() => setViewMode('cards')} startIcon={<FaColumns style={{ transform: 'rotate(90deg)' }} />} sx={{ borderRadius: '10px' }}>Visão Cards</Button>
                    <Button size="small" variant={viewMode === 'kanban' ? "contained" : "text"} onClick={() => setViewMode('kanban')} startIcon={<FaColumns />} sx={{ borderRadius: '10px' }}>Fluxo Kanban</Button>
                </Paper>
                <Button variant="contained" label="Receber Aparelho" startIcon={<FaPlus />} onClick={() => setIsFormOpen(true)} sx={{ px: 4, py: 1.5, borderRadius: '14px', boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`, fontWeight: 400 }} />
            </Stack>
        </Box>

        {/* Dash de Métricas Rápidas (#15) */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
                { label: 'EM REPARO', val: orders.filter(o => o.status === 'Em Reparo').length, color: theme.palette.primary.main, icon: <FaWrench /> },
                { label: 'AGUARDANDO PEÇA', val: orders.filter(o => o.status === 'Aguardando Peça').length, color: theme.palette.secondary.main, icon: <FaHourglassHalf /> },
                { label: 'PRONTO / TESTADO', val: orders.filter(o => o.status === 'Finalizado').length, color: theme.palette.success.main, icon: <FaCheckCircle /> },
                { label: 'EFICIÊNCIA MÉDIA', val: '1.4h', color: theme.palette.info.main, icon: <FaChartLine /> }
            ].map((s, i) => (
                <Grid item xs={6} md={3} key={i}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', border: '1px solid ' + theme.palette.divider, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(s.color, 0.03) }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 400, opacity: 0.6 }}>{s.label}</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 400 }}>{s.val}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(s.color, 0.1), color: s.color }}>{s.icon}</Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>

        {/* Toolbar de Pesquisa Avançada (#2, #3) */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <TextField 
                fullWidth placeholder="Buscar por Cliente, IMEI, Modelo ou #ID da Ordem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ 
                    startAdornment: <InputAdornment position="start"><FaSearch color="primary" /></InputAdornment>, 
                    sx: { borderRadius: '16px', height: 52, bgcolor: 'background.paper', fontSize: '1.1rem' } 
                }}
            />
            {viewMode === 'cards' && (
                <Paper variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ minHeight: 52 }}>
                        <Tab label={`Triagem (${orders.filter(o => o.status.includes('Avaliação')).length})`} sx={{ fontWeight: 400, px: 3 }} />
                        <Tab label="Oficina" sx={{ fontWeight: 400, px: 3 }} />
                        <Tab label="Prontos" sx={{ fontWeight: 400, px: 3 }} />
                    </Tabs>
                </Paper>
            )}
        </Box>

        {/* Conteúdo Principal */}
        <Box sx={{ minHeight: '600px' }}>
            {loading ? (
                <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
            ) : viewMode === 'kanban' ? (
                /* #1 Kanban Drag & Drop (Mock Visual) */
                <Box sx={{ overflowX: 'auto', pb: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ minWidth: 1400 }}>
                        {kanbanColumns.map((col, idx) => (
                            <Box key={idx} sx={{ width: 320, flexShrink: 0 }}>
                                <Paper elevation={0} sx={{ bgcolor: isDarkMode ? alpha('#fff', 0.03) : '#f1f3f5', borderRadius: '24px', p: 2, minHeight: '700px', border: '1px solid ' + theme.palette.divider }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} px={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 400, color: col.color, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {col.icon} {col.title.toUpperCase()}
                                        </Typography>
                                        <Chip label={orders.filter(o => col.status.includes(o.status)).length} size="small" sx={{ bgcolor: col.color, color: '#fff', fontWeight: 400 }} />
                                    </Stack>
                                    
                                    <Stack spacing={2}>
                                        {orders.filter(o => col.status.includes(o.status)).map(order => {
                                            const { isBottleneck, hours } = getBottleneckInfo(order.updated_at);
                                            return (
                                                <motion.div key={order.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                    <Card sx={{ 
                                                        borderRadius: '16px', 
                                                        border: `1px solid ${isBottleneck ? theme.palette.error.main : theme.palette.divider}`, 
                                                        boxShadow: isBottleneck ? `0 0 15px ${alpha(theme.palette.error.main, 0.2)}` : 'none',
                                                        cursor: 'pointer',
                                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
                                                    }} onClick={() => navigate(`/orders/${order.id}`)}>
                                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                            <Box display="flex" justifyContent="space-between" mb={1.5}>
                                                                <Typography variant="caption" sx={{ fontWeight: 400, opacity: 0.5 }}>OS #{order.id}</Typography>
                                                                {isBottleneck && <Tooltip title={`Parado há ${hours}h`}><Chip size="small" label={`${hours}h`} color="error" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 400 }} /></Tooltip>}
                                                            </Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 400, mb: 0.5 }} data-testid="order-customer-name">{order.customer_name}</Typography>
                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5, height: 32, overflow: 'hidden' }}>{order.product_description}</Typography>
                                                            
                                                            <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />
                                                            
                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                <Typography variant="h6" color="primary" sx={{ fontWeight: 400, fontSize: '0.9rem' }}>R$ {Number(order.estimated_cost).toFixed(0)}</Typography>
                                                                <Stack direction="row" spacing={0.5}>
                                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); sendWhatsApp(order); }}><FaWhatsapp color="#25D366" size={14} /></IconButton>
                                                                    <IconButton size="small"><FaHistory size={12} /></IconButton>
                                                                </Stack>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </Stack>
                                </Paper>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            ) : (
                /* #21 Modo Cards Premium */
                <Grid container spacing={3}>
                    <AnimatePresence>
                        {filteredOrders.map((order) => {
                            const { isBottleneck } = getBottleneckInfo(order.updated_at);
                            return (
                                <Grid item xs={12} md={6} lg={4} key={order.id}>
                                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                        <Card variant="outlined" sx={{ 
                                            borderRadius: '24px', 
                                            overflow: 'hidden', 
                                            bgcolor: 'background.paper',
                                            position: 'relative',
                                            transition: 'all 0.3s',
                                            '&:hover': { borderColor: theme.palette.primary.main, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }
                                        }}>
                                            {/* #12 Alerta de Garantia */}
                                            {order.id % 5 === 0 && (
                                              <Box sx={{ 
                                                position: 'absolute', 
                                                top: 12, 
                                                left: -30, 
                                                bgcolor: 'secondary.main', 
                                                color: 'white', 
                                                px: 5, 
                                                py: 0.5, 
                                                transform: 'rotate(-45deg)', 
                                                zIndex: 1, 
                                                fontSize: '0.6rem', 
                                                fontWeight: 400 
                                              }}>
                                                GARANTIA
                                              </Box>
                                            )}
                                            
                                            <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 400, fontSize: '0.8rem' }}>#{order.id}</Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 400 }} data-testid="order-customer-name">{order.customer_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{order.customer_phone}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Chip label={order.status} size="small" color={isBottleneck ? "error" : "primary"} sx={{ fontWeight: 400, borderRadius: '8px' }} />
                                            </Box>

                                            <CardContent sx={{ p: 3 }}>
                                                <Typography variant="body1" sx={{ mb: 1, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <FaTools size={14} color={theme.palette.text.disabled} /> {order.product_description}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>{order.issue_description}</Typography>
                                                
                                                {/* #23 Badges de Complexidade */}
                                                <Stack direction="row" spacing={1} mb={3}>
                                                    <Chip label="Complexidade: Média" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 400 }} />
                                                    <Chip label="Peça em Estoque" size="small" color="success" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 400 }} />
                                                </Stack>

                                                <Box sx={{ mb: 2 }}>
                                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                        <Typography variant="caption" fontWeight={400}>Progresso do Reparo</Typography>
                                                        <Typography variant="caption" fontWeight={400}>65%</Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={65} sx={{ height: 6, borderRadius: 3 }} />
                                                </Box>

                                                <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />
                                                
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={400}>ORÇAMENTO PREVISTO</Typography>
                                                        <Typography variant="h5" color="primary" sx={{ fontWeight: 400 }}>R$ {Number(order.estimated_cost).toFixed(2)}</Typography>
                                                    </Box>
                                                    <Stack direction="row" spacing={1}>
                                                        <Tooltip title="Enviar Fotos WhatsApp (#19)"><IconButton size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaCamera size={14} /></IconButton></Tooltip>
                                                        <Tooltip title="Termo de Entrada (#5)"><IconButton size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaPrint size={14} /></IconButton></Tooltip>
                                                        <Button variant="contained" label="Abrir" size="small" onClick={() => navigate(`/orders/${order.id}`)} sx={{ borderRadius: '10px', height: 32 }} />
                                                    </Stack>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </AnimatePresence>
                </Grid>
            )}
        </Box>

        {/* Modal de Recepção Técnica (#3, #16) */}
        <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '28px', p: 1 } }}>
            <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 400 }}>Check-in de Aparelho</Typography>
                    <Typography variant="caption" color="text.secondary">Geração de Orçamento e Diagnóstico Preliminar</Typography>
                </Box>
                <IconButton onClick={() => setIsFormOpen(false)} sx={{ bgcolor: 'action.hover' }}><FaTimes size={16} /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 0 }}>
                <ServiceOrderForm token={token || ''} onSubmit={handleCreateOrder} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default ServiceOrdersPage;

