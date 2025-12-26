import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  CircularProgress, 
  TextField, 
  MenuItem, 
  IconButton, 
  Chip, 
  Avatar, 
  Stack, 
  Divider, 
  useTheme,
  InputAdornment,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  Assignment as OrderIcon,
  PendingActions as PendingIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DoneIcon,
  Error as ErrorIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Description as ReportIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import type { ServiceOrder, ServiceOrderStatus } from '../types/serviceOrder';
import { getServiceOrders, getServiceOrderById } from '../services/orderService';
import OrdersTable from '../components/OrdersTable';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const OrdersPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { showNotification } = useNotification();
  
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const filters = {
        status: statusFilter || undefined,
        customer_name: customerFilter || undefined,
      };
      const data = await getServiceOrders(token, filters);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotification('Falha ao buscar pedidos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(fetchOrders, 500);
    return () => clearTimeout(debounceTimer);
  }, [statusFilter, customerFilter, token]);

  const handleViewDetails = async (order: ServiceOrder) => {
    if (!token) return;
    try {
      const fullOrder = await getServiceOrderById(token, order.id.toString());
      setSelectedOrder(fullOrder);
      setIsModalOpen(true);
    } catch (err) {
      showNotification('Erro ao carregar detalhes.', 'error');
    }
  };

  const orderStatusOptions: ServiceOrderStatus[] = [
    'Aguardando Avaliação', 'Aguardando Aprovação', 'Aprovado', 'Em Reparo', 
    'Aguardando Peça', 'Aguardando QA', 'Finalizado', 'Não Aprovado', 'Entregue'
  ];

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status.includes('Aguardando')).length,
      repairing: orders.filter(o => o.status === 'Em Reparo').length,
      finished: orders.filter(o => o.status === 'Finalizado' || o.status === 'Entregue').length,
    };
  }, [orders]);

  return (
    <Box p={4} sx={{ maxWidth: 1600, margin: '0 auto', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <OrderIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
              GERENCIAMENTO OPERACIONAL
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Pedidos e OS
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Controle o fluxo de ordens de serviço e vendas especiais da sua unidade.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchOrders} sx={{ borderRadius: '12px', fontWeight: 700 }}>Atualizar</Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            sx={{ borderRadius: '12px', px: 3, py: 1.5, fontWeight: 800, boxShadow: '0 10px 20px rgba(25, 118, 210, 0.2)' }}
          >
            Nova Ordem
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { label: 'Total Geral', value: stats.total, icon: <OrderIcon />, color: 'primary.main' },
          { label: 'Aguardando', value: stats.pending, icon: <PendingIcon />, color: 'warning.main' },
          { label: 'Em Reparo', value: stats.repairing, icon: <ShippingIcon />, color: 'info.main' },
          { label: 'Concluídos', value: stats.finished, icon: <DoneIcon />, color: 'success.main' },
        ].map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 56, height: 56, borderRadius: '16px' }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>{stat.label}</Typography>
                  <Typography variant="h4" fontWeight={900}>{stat.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Table Area */}
      <Paper sx={{ p: 0, borderRadius: '32px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        <Box p={3} borderBottom="1px solid" borderColor="divider">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight={800}>Lista de Ordens</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                <TextField 
                  placeholder="Buscar por cliente..." 
                  size="small" 
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  sx={{ width: { sm: 250 }, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                />
                <TextField
                  select
                  size="small"
                  label="Filtrar Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ width: { sm: 200 }, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                >
                  <MenuItem value="">Todos os Status</MenuItem>
                  {orderStatusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ minHeight: 400, position: 'relative' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
              <CircularProgress thickness={5} />
            </Box>
          ) : orders.length === 0 ? (
            <Box textAlign="center" py={10}>
              <ReportIcon sx={{ fontSize: 60, color: 'divider', mb: 2 }} />
              <Typography color="text.secondary">Nenhum pedido encontrado com os filtros atuais.</Typography>
            </Box>
          ) : (
            <OrdersTable orders={orders} onViewDetails={handleViewDetails} />
          )}
        </Box>
      </Paper>

      {isModalOpen && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setIsModalOpen(false)} />
      )}
    </Box>
  );
};

export default OrdersPage;