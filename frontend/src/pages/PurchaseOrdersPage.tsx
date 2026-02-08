import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  Stack, 
  Chip, 
  IconButton, 
  Tooltip,
  Divider,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { 
  FaPlus, FaTruck, FaCheckCircle, FaTimesCircle, FaFileInvoiceDollar, 
  FaSearch, FaFilter, FaHistory, FaArrowRight, FaBoxOpen
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';
import moment from 'moment';

const PurchaseOrdersPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { addNotification } = useNotification();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/purchase-orders', { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) {
      addNotification('Erro ao carregar ordens de compra.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleReceiveOrder = async (id: number) => {
    if (!window.confirm('Confirmar o recebimento total desta ordem? O estoque será atualizado e a conta será lançada no financeiro.')) return;
    
    try {
      await axios.post(`/api/v1/purchase-orders/${id}/receive`, {}, { headers: { Authorization: `Bearer ${token}` } });
      addNotification('Ordem recebida! Estoque e Financeiro atualizados.', 'success');
      fetchOrders();
    } catch (err) {
      addNotification('Falha ao processar recebimento.', 'error');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
        case 'pending': return <Chip label="Pendente" color="warning" size="small" variant="outlined" sx={{ fontWeight: 400 }} />;
        case 'ordered': return <Chip label="Enviado" color="info" size="small" variant="outlined" sx={{ fontWeight: 400 }} />;
        case 'received': return <Chip label="Recebido" color="success" size="small" sx={{ fontWeight: 400 }} />;
        case 'cancelled': return <Chip label="Cancelado" color="error" size="small" sx={{ fontWeight: 400 }} />;
        default: return <Chip label={status} size="small" />;
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
            <Typography variant="h4" fontWeight={400} sx={{ letterSpacing: '-1.5px' }}>
                Gestão de Compras
            </Typography>
            <Typography variant="body2" color="text.secondary">Controle de suprimentos e entrada de mercadorias</Typography>
        </Box>
        <Button variant="contained" startIcon={<FaPlus />} sx={{ borderRadius: '12px', px: 3 }}>
            Nova Ordem de Compra
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {orders.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order.id}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Paper sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, '&:hover': { borderColor: 'primary.main', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={400} display="block" sx={{ textTransform: 'uppercase' }}>{order.supplier_name}</Typography>
                                <Typography variant="h6" fontWeight={400}>Pedido #{order.id}</Typography>
                            </Box>
                            {getStatusChip(order.status)}
                        </Box>

                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                        <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Total do Pedido:</Typography>
                                <Typography variant="body2" fontWeight={400}>R$ {Number(order.total_amount).toFixed(2)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Previsão Entrega:</Typography>
                                <Typography variant="body2">{moment(order.expected_delivery_date).format('DD/MM/YYYY')}</Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} mt={3}>
                            {order.status !== 'received' && (
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    color="success" 
                                    startIcon={<FaCheckCircle />}
                                    onClick={() => handleReceiveOrder(order.id)}
                                    sx={{ borderRadius: '10px', fontWeight: 400 }}
                                >
                                    Receber
                                </Button>
                            )}
                            <Button 
                                fullWidth 
                                variant="outlined" 
                                startIcon={<FaSearch />}
                                onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                                sx={{ borderRadius: '10px', fontWeight: 400 }}
                            >
                                Detalhes
                            </Button>
                        </Stack>
                    </Paper>
                </motion.div>
            </Grid>
        ))}
      </Grid>

      {/* Modal de Detalhes */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 400 }}>Itens do Pedido #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 400 }}>Item</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 400 }}>Qtd</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 400 }}>Unit.</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {selectedOrder?.items?.map((item: any, i: number) => (
                        <TableRow key={i}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">R$ {Number(item.unit_price).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default PurchaseOrdersPage;

