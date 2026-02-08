import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  alpha,
  Grid,
  Divider
} from '@mui/material';
import { 
  FaPercentage, 
  FaTicketAlt, 
  FaPlus, 
  FaSearch, 
  FaTimes, 
  FaTag, 
  FaHistory,
  FaCheckCircle,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from '../components/Button';
import ErrorBoundary from '../components/ErrorBoundary';

// Components
import { DiscountList } from '../components/DiscountList';
import { DiscountForm } from '../components/DiscountForm';
import { CouponList } from '../components/CouponList';
import { CouponForm } from '../components/CouponForm';

interface PromotionBase {
  id: number;
  name?: string;
  code?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  uses_count: number;
}

import api from '../services/api';

const PromotionsPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [discounts, setDiscounts] = useState<PromotionBase[]>([]);
  const [coupons, setCoupons] = useState<PromotionBase[]>([]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromotionBase | null>(null);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const [discRes, coupRes] = await Promise.all([
        api.get('discounts'),
        api.get('coupons')
      ]);
      
      setDiscounts(discRes.data);
      setCoupons(coupRes.data);

    } catch (error) {
      // Mock Data fallback para desenvolvimento visual se a API falhar
      setDiscounts([
        { id: 1, name: 'Saldão de Películas', type: 'percentage', value: 50, start_date: new Date().toISOString(), is_active: true, uses_count: 142 },
        { id: 2, name: 'Desconto à Vista', type: 'percentage', value: 10, start_date: new Date().toISOString(), is_active: true, uses_count: 890 },
      ]);
      setCoupons([
        { id: 101, name: 'Cupom Primeira Compra', code: 'BEMVINDO10', type: 'percentage', value: 10, start_date: new Date().toISOString(), is_active: true, uses_count: 45 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, [token]);

  const filteredItems = useMemo(() => {
    const list = activeTab === 0 ? discounts : coupons;
    return list.filter(item => 
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, discounts, coupons, searchTerm]);

  const handleOpenDialog = (item?: PromotionBase) => {
    setEditingItem(item || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingItem(null);
    setDialogOpen(false);
  };

  const handleSave = async (data: any) => {
    const endpoint = activeTab === 0 ? 'discounts' : 'coupons';
    const method = editingItem ? 'put' : 'post';
    const url = editingItem 
        ? `${endpoint}/${activeTab === 0 ? editingItem.id : editingItem.code}` 
        : endpoint;

    try {
      await api[method](url, data);
      
      addNotification(`Promoção ${editingItem ? 'atualizada' : 'criada'} com sucesso!`, 'success');
      handleCloseDialog();
      fetchPromotions();
    } catch (error: any) {
      addNotification('Erro ao salvar promoção.', 'error');
    }
  };

  const handleDelete = async (item: PromotionBase) => {
    if (!window.confirm('Excluir esta promoção definitivamente?')) return;
    const endpoint = activeTab === 0 ? 'discounts' : 'coupons';
    const idParam = activeTab === 0 ? item.id : item.code;
    try {
      await api.delete(`${endpoint}/${idParam}`);
      addNotification('Excluído com sucesso', 'success');
      fetchPromotions();
    } catch (error: any) {
      addNotification('Erro ao excluir.', 'error');
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Typography variant="h4">Gestão de Promoções</Typography>
            <Paper variant="outlined" sx={{ bgcolor: theme.palette.background.paper, borderRadius: '12px', overflow: 'hidden' }}>
                <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ minHeight: 40, '& .MuiTab-root': { py: 1, minHeight: 40, fontSize: '0.85rem', textTransform: 'none' } }}>
                    <Tab icon={<FaPercentage style={{ marginRight: 8 }} />} iconPosition="start" label="Descontos Diretos" />
                    <Tab icon={<FaTicketAlt style={{ marginRight: 8 }} />} iconPosition="start" label="Cupons de Código" />
                </Tabs>
            </Paper>
          </Stack>
          <Button variant="contained" label={activeTab === 0 ? "Novo Desconto" : "Novo Cupom"} startIcon={<FaPlus />} onClick={() => handleOpenDialog()} />
        </Box>

        <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }}>
                    <TextField 
                        fullWidth size="small" placeholder={activeTab === 0 ? "Buscar descontos..." : "Buscar por código ou nome..."}
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><FaSearch size={14} color={theme.palette.text.disabled} /></InputAdornment>, sx: { borderRadius: '10px', bgcolor: theme.palette.background.paper } } }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: true }}>
                    <Stack direction="row" spacing={3} justifyContent="flex-end" sx={{ opacity: 0.6 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaCheckCircle color={theme.palette.success.main} /> {activeTab === 0 ? discounts.filter(d => d.is_active).length : coupons.filter(c => c.is_active).length} Ativos
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><FaHistory /> Total de Usos: {filteredItems.reduce((acc, curr) => acc + curr.uses_count, 0)}</Typography>
                    </Stack>
                </Grid>
            </Grid>
        </Box>

        <Box sx={{ position: 'relative', minHeight: '400px' }}>
            {loading ? (
                <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
            ) : filteredItems.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, bgcolor: isDarkMode ? alpha('#fff', 0.01) : '#fcfcfc', borderRadius: '16px', border: `1px dashed ${theme.palette.divider}`, textAlign: 'center' }}>
                    <FaTag size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <Typography variant="h6">Nenhuma promoção encontrada</Typography>
                    <Typography variant="body2" color="text.secondary">Clique em "Novo" para criar sua primeira estratégia de vendas.</Typography>
                </Box>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {activeTab === 0 ? (
                            <DiscountList discounts={filteredItems as any} onEdit={(id) => handleOpenDialog(discounts.find(d => d.id === id))} onDelete={(id) => handleDelete(discounts.find(d => d.id === id)!)} />
                        ) : (
                            <CouponList coupons={filteredItems as any} onEdit={(id) => handleOpenDialog(coupons.find(c => c.id === id))} onDelete={(id) => handleDelete(coupons.find(c => c.id === id)!)} />
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </Box>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', bgcolor: theme.palette.background.default, backgroundImage: 'none' } }}>
            <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                <Typography variant="h5">{editingItem ? 'Editar' : 'Nova'} {activeTab === 0 ? 'Regra de Desconto' : 'Estratégia de Cupom'}</Typography>
                <IconButton onClick={handleCloseDialog} size="small"><FaTimes /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 0 }}>
                {activeTab === 0 ? (
                    <DiscountForm initialData={editingItem as any} onSubmit={handleSave} onCancel={handleCloseDialog} />
                ) : (
                    <CouponForm initialData={editingItem as any} onSubmit={handleSave} onCancel={handleCloseDialog} />
                )}
            </DialogContent>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default PromotionsPage;