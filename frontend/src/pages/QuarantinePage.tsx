import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
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
  CardContent,
  alpha,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  Checkbox
} from '@mui/material';
import { 
  FaBoxOpen, 
  FaSearch, 
  FaTrash, 
  FaExclamationTriangle, 
  FaTruckLoading, 
  FaCheckDouble, 
  FaHistory, 
  FaArrowRight, 
  FaMapMarkerAlt, 
  FaCalendarTimes, 
  FaChartBar,
  FaWhatsapp,
  FaCamera,
  FaFire,
  FaFileInvoice,
  FaPlusCircle,
  FaMoneyBillWave,
  FaQrcode
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from '../components/Button';
import ErrorBoundary from '../components/ErrorBoundary';
import api from '../services/api';
import { QuarantineForm } from '../components/QuarantineForm';
import RMABorderou from '../components/ui/RMABorderou';
import { useReactToPrint } from 'react-to-print';

const QuarantinePage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { showNotification } = useNotification();
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priceRange, setPriceRange] = useState<number[]>([0, 3000]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintRMA = useReactToPrint({
    contentRef: printRef,
  });

  const fetchQuarantine = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/quarantine');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch quarantine items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuarantine(); }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedItemsForRMA = useMemo(() => 
    items.filter(i => selectedIds.includes(i.id)), 
  [items, selectedIds]);

  const supplierStats = useMemo(() => {
    const stats: Record<string, { total: number, defects: number }> = {};
    items.forEach(i => {
        if (!stats[i.supplier]) stats[i.supplier] = { total: 100, defects: 0 }; 
        stats[i.supplier].defects++;
    });
    return Object.entries(stats).map(([name, data]) => ({
        name,
        rate: (data.defects / data.total) * 100
    })).sort((a, b) => b.rate - a.rate);
  }, [items]);

  const totalLoss = useMemo(() => items.reduce((sum, item) => sum + Number(item.item_cost || 0), 0), [items]);
  const batteryRisks = useMemo(() => items.filter(i => i.is_battery_risk).length, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
        const matchesSearch = (item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.reason?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesPrice = (item.item_cost || 0) >= priceRange[0] && (item.item_cost || 0) <= priceRange[1];
        
        return matchesSearch && matchesStatus && matchesPrice;
    });
  }, [items, searchTerm, statusFilter, priceRange]);

  const handleAddItem = async (data: any) => {
    try {
      const res = await api.post('/api/quarantine', data);
      setItems([res.data, ...items]);
      setIsModalOpen(false);
      showNotification('Item enviado para quarentena.', 'success');
    } catch (err) {
      showNotification('Erro ao adicionar item.', 'error');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
        case 'Pending': return { label: 'Em Loja', color: theme.palette.warning.main, icon: <FaBoxOpen /> };
        case 'RMA_Sent': return { label: 'Enviado RMA', color: theme.palette.info.main, icon: <FaTruckLoading /> };
        case 'Returned': return { label: 'Reposto', color: theme.palette.success.main, icon: <FaCheckDouble /> };
        case 'Scrapped': return { label: 'Descartado', color: theme.palette.error.main, icon: <FaTrash /> };
        default: return { label: status, color: theme.palette.text.disabled, icon: <FaHistory /> };
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, margin: '0 auto' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 400, letterSpacing: '-0.5px' }}>Centro de Quarentena & RMA</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>Gestão estratégica de peças defeituosas e ativos em garantia</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
                variant="outlined" 
                label={`Exportar RMA (${selectedIds.length})`} 
                startIcon={<FaFileInvoice />} 
                disabled={selectedIds.length === 0}
                onClick={() => handlePrintRMA()}
            />
            <Button variant="contained" label="Adicionar Peça Defeituosa" startIcon={<FaPlusCircle />} onClick={() => setIsModalOpen(true)} />
          </Stack>
        </Box>

        <Box sx={{ mb: 4, p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="caption" fontWeight={400} color="error.main">MAIOR TAXA DE DEFEITO:</Typography>
            <Stack direction="row" spacing={2}>
                {supplierStats.slice(0, 3).map((s, i) => (
                    <Chip key={i} label={`${s.name}: ${s.rate.toFixed(1)}%`} size="small" color="error" sx={{ fontWeight: 400 }} />
                ))}
            </Stack>
        </Box>

        <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '24px', bgcolor: alpha(theme.palette.error.main, 0.02), border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, borderRadius: '14px' }}><FaMoneyBillWave /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Prejuízo Imobilizado</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 400, color: theme.palette.error.main }}>R$ {totalLoss.toLocaleString()}</Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '24px', bgcolor: batteryRisks > 0 ? alpha(theme.palette.warning.main, 0.05) : theme.palette.background.paper, border: batteryRisks > 0 ? `1px solid ${theme.palette.warning.main}` : `1px solid ${theme.palette.divider}` }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, borderRadius: '14px' }}><FaFire /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Riscos de Segurança</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 400 }}>{batteryRisks}</Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '24px', bgcolor: theme.palette.background.paper }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, borderRadius: '14px' }}><FaTruckLoading /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Aguardando Coleta</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 400 }}>{items.filter(i => i.status === 'Pending').length}</Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '24px', bgcolor: theme.palette.background.paper }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, borderRadius: '14px' }}><FaChartBar /></Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Eficiência de RMA</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 400 }}>94%</Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Grid>
        </Grid>

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexGrow={1}>
                <TextField 
                    size="small" placeholder="Bucar por SKU, fornecedor ou defeito..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 450 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FaSearch size={14} /></InputAdornment>, sx: { borderRadius: '12px', bgcolor: theme.palette.background.paper } }}
                />
                <TextField
                    select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ width: 220 }}
                    InputProps={{ sx: { borderRadius: '12px', bgcolor: theme.palette.background.paper } }}
                >
                    <MenuItem value="All">Todos os Itens</MenuItem>
                    <MenuItem value="Pending">Pendente na Loja</MenuItem>
                    <MenuItem value="RMA_Sent">Em Garantia (Enviado)</MenuItem>
                    <MenuItem value="Returned">Resolvido / Reposto</MenuItem>
                    <MenuItem value="Scrapped">Lixo Eletrônico</MenuItem>
                </TextField>
            </Stack>
            <Box sx={{ width: 250, px: 2 }}>
                <Typography variant="caption" color="text.secondary">Filtrar por Custo (R$)</Typography>
                <Slider size="small" value={priceRange} onChange={(_, v) => setPriceRange(v as number[])} min={0} max={3000} valueLabelDisplay="auto" />
            </Box>
        </Box>

        <Box sx={{ minHeight: '500px' }}>
            {loading ? (
                <Box display="flex" justifyContent="center" py={10}><CircularProgress thickness={2} /></Box>
            ) : (
                <Grid container spacing={3}>
                    <AnimatePresence>
                        {filteredItems.map((item) => {
                            const status = getStatusInfo(item.status);
                            const isExpired = moment(item.warranty_expiry_date).isBefore(moment());
                            const daysInStore = moment().diff(moment(item.created_at), 'days');

                            return (
                                <Grid item xs={12} md={6} lg={4} key={item.id} component={motion.div} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                    <Card variant="outlined" sx={{ 
                                        borderRadius: '24px', 
                                        border: `1px solid ${theme.palette.divider}`, 
                                        bgcolor: theme.palette.background.paper, 
                                        position: 'relative', 
                                        overflow: 'hidden', 
                                        transition: 'all 0.3s',
                                        height: '480px', 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        '&:hover': { boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.05)' } 
                                    }}>
                                        
                                        {item.is_battery_risk && (
                                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.warning.main})` }} />
                                        )}
                                        {daysInStore > 15 && !item.is_battery_risk && (
                                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: theme.palette.error.main }} />
                                        )}

                                        <Box sx={{ p: 2.5, bgcolor: alpha(status.color, 0.03), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Checkbox 
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    size="small"
                                                />
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(status.color, 0.1), color: status.color, fontSize: '0.8rem' }}>{status.icon}</Avatar>
                                                <Box>
                                                    <Typography variant="body2">{item.supplier}</Typography>
                                                    <Typography variant="caption" sx={{ color: status.color }}>{status.label.toUpperCase()}</Typography>
                                                </Box>
                                            </Stack>
                                            <Stack direction="row" spacing={1}>
                                                {item.is_battery_risk && <Tooltip title="Risco de Explosão / Incêndio"><IconButton size="small" color="error"><FaFire size={14} /></IconButton></Tooltip>}
                                                <IconButton size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaQrcode size={12} /></IconButton>
                                            </Stack>
                                        </Box>

                                        <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Box display="flex" justifyContent="space-between" mb={2}>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ lineHeight: 1.2, height: '40px', overflow: 'hidden' }}>{item.product_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{item.variation}</Typography>
                                                </Box>
                                                <Typography variant="h6" color="error.main">R$ {Number(item.item_cost).toFixed(2)}</Typography>
                                            </Box>

                                            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: isDarkMode ? alpha('#fff', 0.02) : '#f8f9fa', mb: 2, border: `1px solid ${theme.palette.divider}`, height: '80px', overflow: 'hidden' }}>
                                                <Stack direction="row" spacing={1} alignItems="center" mb={1} sx={{ opacity: 0.6 }}>
                                                    <FaExclamationTriangle size={12} color={theme.palette.warning.main} />
                                                    <Typography variant="caption" sx={{ letterSpacing: 0.5 }}>DIAGNÓSTICO TÉCNICO</Typography>
                                                </Stack>
                                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{item.reason}</Typography>
                                            </Box>

                                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                                <Grid item xs={6}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FaMapMarkerAlt size={12} style={{ opacity: 0.5 }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block">LOCALIZAÇÃO</Typography>
                                                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{item.physical_location}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FaCalendarTimes size={12} color={isExpired ? theme.palette.error.main : 'inherit'} style={{ opacity: 0.5 }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block">GARANTIA ATÉ</Typography>
                                                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: isExpired ? theme.palette.error.main : 'inherit' }}>
                                                                {moment(item.warranty_expiry_date).format('DD/MM/YY')}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Grid>
                                            </Grid>

                                            <Box sx={{ mt: 'auto' }}>
                                                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="caption" color="text.secondary">Entrada há {daysInStore} dias</Typography>
                                                    <Stack direction="row" spacing={1}>
                                                        <Tooltip title="Avisar Fornecedor (WhatsApp)"><IconButton size="small" color="success" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaWhatsapp size={14} /></IconButton></Tooltip>
                                                        <Tooltip title="Anexar Prova Visual"><IconButton size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaCamera size={14} /></IconButton></Tooltip>
                                                        <Button variant="text" size="small" label="Gerir RMA" endIcon={<FaArrowRight />} sx={{ fontWeight: 400 }} />
                                                    </Stack>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </AnimatePresence>
                </Grid>
            )}
        </Box>

        <Dialog 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '24px' } }}
        >
          <DialogTitle>Entrada de Material Defeituoso</DialogTitle>
          <DialogContent>
            <Box mt={1}>
              <QuarantineForm onSubmit={handleAddItem} onCancel={() => setIsModalOpen(false)} />
            </Box>
          </DialogContent>
        </Dialog>

        <div style={{ display: 'none' }}>
            <div ref={printRef}>
                {selectedItemsForRMA.length > 0 && (
                    <RMABorderou 
                        supplier={selectedItemsForRMA[0].supplier}
                        items={selectedItemsForRMA}
                    />
                )}
            </div>
        </div>

      </Box>
    </ErrorBoundary>
  );
};

export default QuarantinePage;