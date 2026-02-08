import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Typography, Paper, Chip, IconButton, Tooltip, 
  Button, Grid, Avatar, TextField, InputAdornment, LinearProgress, 
  Stack, Divider, useTheme, alpha, Drawer
} from '@mui/material';
import { 
  DataGrid, GridColDef, GridToolbarContainer, 
  GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton,
  GridRowSelectionModel
} from '@mui/x-data-grid';
import { 
  Search, Add, History, Inventory as InventoryIcon, WarningAmber, 
  Assessment, LocalOffer, Print, FileDownload, TrendingUp, SmartToy, 
  Bolt, Close, KeyboardReturn, QrCodeScanner, Sync,
  AttachMoney, Timer, TrendingDown, Speed,
  Inventory2Outlined, AutoGraph
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import InventorySkeleton from '../components/ui/InventorySkeleton';
import { AISuggestionsModal } from '../components/Products/AISuggestionsModal';

// --- Estilos de Luxo ---

const PageWrapper = styled(motion.div)`
  padding: 32px;
  background: ${({ theme }) => theme.palette.mode === 'light' ? '#f4f7fc' : '#020817'};
  min-height: 100vh;
`;

const GlassCard = styled(Paper)`
  padding: 24px;
  border-radius: 28px;
  background: ${({ theme }) => alpha(theme.palette.background.paper, 0.8)};
  backdrop-filter: blur(16px);
  border: 1px solid ${({ theme }) => alpha(theme.palette.divider, 0.1)};
  box-shadow: 0 10px 40px ${({ theme }) => alpha(theme.palette.common.black, 0.06)};
  position: relative;
  overflow: hidden;
  height: 100%;
`;

const BulkToolbar = styled(motion.div)`
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => alpha(theme.palette.text.primary, 0.95)};
  backdrop-filter: blur(10px);
  color: ${({ theme }) => theme.palette.background.paper};
  padding: 14px 36px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 28px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.4);
  z-index: 1000;
`;

const QuickStatsBox = styled(Box)`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
  &::-webkit-scrollbar { height: 4px; }
`;

// --- Interfaces ---

interface ProductVariation {
  id: number;
  variation_id: number;
  product_id: number;
  product_name: string;
  color: string;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  price: number;
  cost_price: number;
  image_url?: string;
  category_name: string;
  abc_class: 'A' | 'B' | 'C';
  days_of_cover: number;
  last_audit: string;
  is_aging: boolean;
}

const InventoryPage: React.FC = () => {
  const theme = useTheme();
  const { addNotification } = useNotification();
  const { socket } = useSocket();

  // Estados
  const [products, setProducts] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductVariation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMargin, setShowMargin] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'low' | 'aging' | 'top'>('all');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  const [aiLoading, setAILoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventory');
      setProducts(response.data.data || []);
    } catch (error) {
      addNotification('Erro ao carregar inventário.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchAISuggestions = async () => {
    setIsAIModalOpen(true);
    setAILoading(true);
    try {
      const response = await api.get('/inventory/ai-insights');
      setAISuggestions(response.data.data || []);
    } catch (error) {
      addNotification('Falha ao obter insights da IA.', 'error');
    } finally {
      setAILoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    if (socket) {
      socket.on('stock_update', fetchInventory); 
      return () => { socket.off('stock_update'); };
    }
  }, [socket, fetchInventory]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (quickFilter === 'low') result = result.filter(p => p.stock_quantity <= p.min_stock);
    if (quickFilter === 'aging') result = result.filter(p => p.is_aging);
    if (quickFilter === 'top') result = result.filter(p => p.abc_class === 'A');

    return result;
  }, [products, searchTerm, quickFilter]);

  const stats = useMemo(() => {
    return {
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0),
      capitalImobilizado: products.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0),
      criticalCount: products.filter(p => p.stock_quantity <= p.min_stock).length,
      agingCount: products.filter(p => p.is_aging).length
    };
  }, [products]);

  const handleQuickAdjust = async (id: number, delta: number) => {
    const originalProducts = [...products];
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: Math.max(0, p.stock_quantity + delta) } : p));
    
    try {
      await api.put('/inventory/adjust-stock', { 
        variationId: id, 
        quantityChange: delta,
        reason: 'Ajuste rápido via Hub de Ativos'
      });
      addNotification('Estoque ajustado!', 'success');
    } catch (error) {
      setProducts(originalProducts);
      addNotification('Falha no ajuste.', 'error');
    }
  };

  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'product_name', 
      headerName: 'PRODUTO E CATEGORIA', 
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Stack direction="row" spacing={2} alignItems="center" height="100%">
          <Avatar 
            src={params.row.image_url} 
            variant="rounded" 
            sx={{ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
          >
            <LocalOffer sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 400, color: params.row.is_aging ? 'error.main' : 'inherit', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {params.value}
              {params.row.is_aging && <Tooltip title="Estoque Parado (+60 dias)"><Timer sx={{ fontSize: 14 }} /></Tooltip>}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Inventory2Outlined sx={{ fontSize: 12 }} /> {params.row.category_name}
            </Typography>
          </Box>
        </Stack>
      )
    },
    {
      field: 'stock_quantity',
      headerName: 'SALDO ATUAL',
      width: 200,
      headerAlign: 'center',
      renderCell: (params) => {
        const p = params.row;
        const color = p.stock_quantity <= p.min_stock ? 'error' : p.stock_quantity <= p.min_stock * 2 ? 'warning' : 'success';
        return (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" width="100%">
            <IconButton size="small" onClick={() => handleQuickAdjust(p.id, -1)} disabled={p.stock_quantity === 0} sx={{ border: '1px solid ' + alpha(theme.palette.divider, 0.2) }}><TrendingDown fontSize="inherit" /></IconButton>
            <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: color + '.main', lineHeight: 1 }}>{p.stock_quantity}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>UNIDADES</Typography>
            </Box>
            <IconButton size="small" onClick={() => handleQuickAdjust(p.id, 1)} sx={{ border: '1px solid ' + alpha(theme.palette.divider, 0.2) }}><Add fontSize="inherit" /></IconButton>
          </Stack>
        );
      }
    },
    {
      field: 'price',
      headerName: showMargin ? 'LUCRATIVIDADE %' : 'VALOR VENDA',
      width: 160,
      renderCell: (params) => {
        const p = params.row;
        if (showMargin) {
          const margin = ((p.price - p.cost_price) / p.price) * 100;
          return <Chip label={`${margin.toFixed(1)}%`} size="small" color={margin > 30 ? 'success' : margin > 15 ? 'warning' : 'error'} variant="filled" sx={{ fontWeight: 400, borderRadius: '6px' }} />;
        }
        return (
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 400 }}>R$ {p.price.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary">Markup: {(((p.price - p.cost_price) / p.cost_price) * 100).toFixed(0)}%</Typography>
            </Box>
        );
      }
    },
    {
      field: 'abc_class',
      headerName: 'CLASS.',
      width: 90,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Tooltip title={`Prioridade ${params.value} - Curva ABC`}>
            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', fontWeight: 400, bgcolor: params.value === 'A' ? 'error.main' : params.value === 'B' ? 'warning.main' : 'success.main', color: '#fff' }}>
                {params.value}
            </Avatar>
        </Tooltip>
      )
    },
    {
      field: 'days_of_cover',
      headerName: 'SAÚDE GIRO',
      width: 120,
      renderCell: (params) => {
        const value = params.value;
        const color = value < 7 ? 'error' : value < 15 ? 'warning' : 'success';
        return (
            <Box width="100%">
                <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                    <Speed sx={{ fontSize: 14, color: color + '.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 400 }}>{value} dias</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={Math.min((value / 30) * 100, 100)} color={color} sx={{ height: 4, borderRadius: 5 }} />
            </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={() => { setSelectedProduct(params.row); setIsDrawerOpen(true); }}>
            <Assessment sx={{ color: alpha(theme.palette.text.primary, 0.4) }} />
        </IconButton>
      )
    }
  ], [theme, showMargin, handleQuickAdjust]);

  if (loading && products.length === 0) return <InventorySkeleton />;

  return (
    <PageWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* Top Header Inteligente */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-2px', background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hub de Ativos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400, mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy sx={{ fontSize: 18, color: 'primary.main' }} /> Gestão Estratégica Baseada em Dados
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Box sx={{ display: 'flex', bgcolor: 'background.paper', p: 0.5, borderRadius: '16px', border: '1px solid ' + theme.palette.divider }}>
            <Button size="small" variant={!showMargin ? "contained" : "text"} onClick={() => setShowMargin(false)} sx={{ borderRadius: '12px' }}>Preços</Button>
            <Button size="small" variant={showMargin ? "contained" : "text"} onClick={() => setShowMargin(true)} sx={{ borderRadius: '12px' }}>Margens</Button>
          </Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<SmartToy />} 
            onClick={fetchAISuggestions}
            sx={{ borderRadius: '16px', px: 3, fontWeight: 400 }}
          >
            Insights IA
          </Button>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: '16px', px: 4, py: 1.2, fontWeight: 400, boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}` }}>
            Entrada de Estoque
          </Button>
        </Stack>
      </Box>

      {/* Analytics Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'VALOR EM ESTOQUE (VENDA)', val: `R$ ${stats.totalValue.toLocaleString()}`, color: 'primary.main', icon: <AttachMoney />, trend: '+4.2%' },
          { label: 'CAPITAL INVESTIDO (CUSTO)', val: `R$ ${stats.capitalImobilizado.toLocaleString()}`, color: 'secondary.main', icon: <InventoryIcon />, trend: '-1.5%' },
          { label: 'PRODUTOS EM RUPTURA', val: stats.criticalCount, color: 'error.main', icon: <WarningAmber />, trend: 'Crítico' },
          { label: 'ITENS SEM GIRO (AGING)', val: stats.agingCount, color: 'warning.main', icon: <Timer />, trend: 'Ação Necessária' }
        ].map((s, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <GlassCard>
              <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.05, transform: 'scale(2)' }}>{s.icon}</Box>
              <Typography variant="overline" sx={{ fontWeight: 400, opacity: 0.6, letterSpacing: 1 }}>{s.label}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 400 }}>{s.val}</Typography>
                <Chip label={s.trend} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 400, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }} />
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Filtros de Fluxo Rápido */}
      <QuickStatsBox>
        <Chip 
            icon={<Assessment />} 
            label="Ver Tudo" 
            onClick={() => setQuickFilter('all')} 
            variant={quickFilter === 'all' ? 'filled' : 'outlined'} 
            color="primary" sx={{ fontWeight: 400, borderRadius: '10px' }} 
        />
        <Chip 
            icon={<WarningAmber />} 
            label="Reposição Urgente" 
            onClick={() => setQuickFilter('low')} 
            variant={quickFilter === 'low' ? 'filled' : 'outlined'} 
            color="error" sx={{ fontWeight: 400, borderRadius: '10px' }} 
        />
        <Chip 
            icon={<Timer />} 
            label="Estoque Parado" 
            onClick={() => setQuickFilter('aging')} 
            variant={quickFilter === 'aging' ? 'filled' : 'outlined'} 
            color="warning" sx={{ fontWeight: 400, borderRadius: '10px' }} 
        />
        <Chip 
            icon={<AutoGraph />} 
            label="Top Performance (A)" 
            onClick={() => setQuickFilter('top')} 
            variant={quickFilter === 'top' ? 'filled' : 'outlined'} 
            color="secondary" sx={{ fontWeight: 400, borderRadius: '10px' }} 
        />
      </QuickStatsBox>

      {/* Busca Avançada */}
      <Paper sx={{ p: 1.5, mb: 3, borderRadius: '20px', border: '1px solid ' + alpha(theme.palette.divider, 0.1), display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField 
            id="inventory-search"
            placeholder="Pesquisar por nome, SKU, categoria ou bipa agora (/) ..."
            fullWidth variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ 
              disableUnderline: true,
              startAdornment: <InputAdornment position="start" sx={{ ml: 1 }}><Search color="primary" /></InputAdornment>,
              sx: { height: 45, fontSize: '1.1rem', fontWeight: 400 }
            }}
          />
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Sincronizar Dados"><IconButton onClick={fetchInventory} color="primary"><Sync /></IconButton></Tooltip>
          <Tooltip title="Leitura de QR Code"><IconButton color="secondary"><QrCodeScanner /></IconButton></Tooltip>
      </Paper>

      {/* Grid Principal */}
      <Box sx={{ height: 700, width: '100%', bgcolor: 'background.paper', borderRadius: '32px', overflow: 'hidden', border: '1px solid ' + theme.palette.divider, boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newModel) => setSelectionModel(newModel)}
          rowSelectionModel={selectionModel}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeader': { bgcolor: alpha(theme.palette.primary.main, 0.03), fontWeight: 400, color: 'primary.main' },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid ' + alpha(theme.palette.divider, 0.05) },
            '& .MuiDataGrid-row:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid ' + theme.palette.divider }
          }}
          slots={{
            toolbar: () => (
              <GridToolbarContainer sx={{ p: 2, gap: 1, borderBottom: '1px solid ' + theme.palette.divider }}>
                <GridToolbarColumnsButton sx={{ fontWeight: 400 }} />
                <GridToolbarFilterButton sx={{ fontWeight: 400 }} />
                <GridToolbarExport sx={{ fontWeight: 400 }} />
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>{filteredProducts.length} ITENS FILTRADOS</Typography>
              </GridToolbarContainer>
            )
          }}
        />
      </Box>

      {/* Bulk Action Toolbar */}
      <AnimatePresence>
        {selectionModel.length > 0 && (
          <BulkToolbar initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: 'inherit' }}>{selectionModel.length}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 400, opacity: 0.8, lineHeight: 1 }}>ITENS<br/>SELECIONADOS</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: alpha('#fff', 0.2) }} />
            <Stack direction="row" spacing={1.5}>
              <Button size="small" variant="contained" sx={{ bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: '#eee' }, borderRadius: '12px', fontWeight: 400 }} startIcon={<Print />}>Imprimir Etiquetas</Button>
              <Button size="small" variant="outlined" color="inherit" sx={{ borderRadius: '12px', fontWeight: 400 }} startIcon={<TrendingUp />}>Reajustar Lote</Button>
              <Button size="small" variant="outlined" color="inherit" sx={{ borderRadius: '12px', fontWeight: 400 }} startIcon={<KeyboardReturn />}>Devolver</Button>
              <IconButton size="small" color="inherit" onClick={() => setSelectionModel([])} sx={{ ml: 2 }}><Close fontSize="small" /></IconButton>
            </Stack>
          </BulkToolbar>
        )}
      </AnimatePresence>

      {/* Dashboard 360 do Produto */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} PaperProps={{ sx: { width: 520, p: 4, borderRadius: '40px 0 0 40px', borderLeft: 'none' } }}>
        {selectedProduct && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={selectedProduct.image_url} sx={{ width: 72, height: 72, border: '4px solid ' + alpha(selectedProduct.color, 0.2) }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 400 }}>{selectedProduct.product_name}</Typography>
                        <Stack direction="row" spacing={1} mt={0.5}>
                            <Chip label={`Classe ${selectedProduct.abc_class}`} size="small" color="secondary" sx={{ fontWeight: 400 }} />
                            <Chip label={selectedProduct.color} size="small" variant="outlined" sx={{ fontWeight: 400 }} />
                        </Stack>
                    </Box>
                </Stack>
                <IconButton onClick={() => setIsDrawerOpen(false)} sx={{ bgcolor: 'action.hover' }}><Close /></IconButton>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="overline" sx={{ fontWeight: 400, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoGraph fontSize="small" /> Inteligência de Inventário
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '20px', bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={400}>MARKUP ATUAL</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 400, color: 'success.main' }}>
                    {(((selectedProduct.price - selectedProduct.cost_price) / selectedProduct.cost_price) * 100).toFixed(1)}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '20px', bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={400}>DIAS DE COBERTURA</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 400, color: 'info.main' }}>{selectedProduct.days_of_cover}d</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '20px', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={400}>PATRIMÔNIO IMOBILIZADO NESTE ITEM</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 400 }}>R$ {(selectedProduct.cost_price * selectedProduct.stock_quantity).toLocaleString()}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Insight Gerencial */}
            <Box sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.warning.main, 0.08), borderRadius: '24px', border: '1px solid ' + alpha(theme.palette.warning.main, 0.2) }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 400, color: 'warning.dark' }}>
                <Bolt /> Insight Estratégico
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 400, lineHeight: 1.6 }}>
                {selectedProduct.is_aging ? 
                    `Este produto está parado há muito tempo. Recomendamos aplicar um desconto de 15% (R$ ${(selectedProduct.price * 0.85).toFixed(2)}) para liberar R$ ${(selectedProduct.cost_price * selectedProduct.stock_quantity).toFixed(2)} de capital.` :
                    `Ritmo de venda saudável. O próximo pedido de reposição deve ser feito em aproximadamente ${Math.max(0, selectedProduct.days_of_cover - 5)} dias para evitar ruptura.`
                }
              </Typography>
              <Button fullWidth variant="contained" color="warning" sx={{ mt: 2, borderRadius: '12px', fontWeight: 400 }}>
                {selectedProduct.is_aging ? 'Aplicar Queima de Estoque' : 'Agendar Reposição'}
              </Button>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button fullWidth variant="outlined" startIcon={<History />} sx={{ borderRadius: '14px', py: 1.5, fontWeight: 400 }}>Histórico</Button>
                <Button fullWidth variant="contained" startIcon={<FileDownload />} sx={{ borderRadius: '14px', py: 1.5, fontWeight: 400 }}>Auditoria</Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      <AISuggestionsModal 
        open={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        suggestions={aiSuggestions} 
        loading={aiLoading} 
      />

    </PageWrapper>
  );
};

export default InventoryPage;