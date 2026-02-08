import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Stack,
  useTheme,
  Grid,
  InputAdornment,
  Slider,
  Card,
  CardContent,
  Avatar,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { 
  FaBoxOpen, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaSearch,
  FaCalculator,
  FaDollarSign,
  FaChartLine
} from 'react-icons/fa';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { productKitService } from '../services/productKitService';
import { fetchAllProducts } from '../services/productService';
import { ProductKit, ProductKitItem, CreateProductKitDTO } from '../types/productKit';
import { Product } from '../types/product';

const StyledPageContainer = styled(motion.div)`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const StyledPageTitle = styled(motion.h1)`
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 24px;
  letter-spacing: -1px;
`;

// Extended type for local state to include price info
interface ExtendedProductKitItem extends ProductKitItem {
    cost_price?: number;
    unit_price?: number; // Current selling price of the item
}

interface ExtendedCreateProductKitDTO extends Omit<CreateProductKitDTO, 'items'> {
    items: ExtendedProductKitItem[];
}

const ProductKitsPage: React.FC = () => {
  const theme = useTheme();
  const [kits, setKits] = useState<ProductKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<ProductKit | null>(null);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  
  // Form State with extended item type
  const [formData, setFormData] = useState<ExtendedCreateProductKitDTO>({
    name: '',
    description: '',
    price: 0,
    is_active: true,
    items: []
  });
  
  // Item adding state
  const [selectedVariationId, setSelectedVariationId] = useState<number | ''>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const { token } = useAuth();
  const { addNotification } = useNotification();

  const fetchKits = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await productKitService.getAllProductKits(token);
      setKits(data);
    } catch (err: any) {
      addNotification('Erro ao carregar combos', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  useEffect(() => {
    fetchKits();
  }, [fetchKits]);

  const loadProducts = async () => {
      if (!token) return;
      if (availableProducts.length > 0) return; // Already loaded
      setLoadingProducts(true);
      try {
          const { products } = await fetchAllProducts(token, undefined, undefined, 1, 1000); 
          setAvailableProducts(products);
      } catch (error) {
          addNotification('Erro ao carregar produtos', 'error');
      } finally {
          setLoadingProducts(false);
      }
  };

  useEffect(() => {
      if (isModalOpen) {
          loadProducts();
      }
  }, [isModalOpen]);

  // Strategy Calculations
  const strategy = useMemo(() => {
      const totalCost = formData.items.reduce((acc, item) => acc + ((item.cost_price || 0) * item.quantity), 0);
      const originalTotalValue = formData.items.reduce((acc, item) => acc + ((item.unit_price || 0) * item.quantity), 0);
      const kitPrice = formData.price;
      const profit = kitPrice - totalCost;
      const margin = kitPrice > 0 ? (profit / kitPrice) * 100 : 0;
      const discount = originalTotalValue > 0 ? ((originalTotalValue - kitPrice) / originalTotalValue) * 100 : 0;

      return { totalCost, originalTotalValue, profit, margin, discount };
  }, [formData.items, formData.price]);

  const filteredKits = useMemo(() => {
    return kits.filter(k => 
        k.name.toLowerCase().includes(search.toLowerCase()) &&
        k.price >= priceRange[0] && k.price <= priceRange[1]
    );
  }, [kits, search, priceRange]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este combo?')) return;
    try {
      await productKitService.deleteProductKit(id, token!);
      addNotification('Combo excluído com sucesso!', 'success');
      fetchKits();
    } catch (err: any) {
      addNotification('Erro ao excluir combo', 'error');
    }
  };

  const handleOpenModal = (kit?: ProductKit) => {
      if (kit) {
          setEditingKit(kit);
          // Note: When editing, we might not have cost info unless we fetch full product details for items.
          // For simplicity here, we assume basic load or re-match with available products if loaded.
          // Ideally, the backend should return snapshot or current costs in kit details.
          setFormData({
              name: kit.name,
              description: kit.description || '',
              price: Number(kit.price),
              is_active: kit.is_active,
              items: kit.items?.map(item => ({
                  product_id: item.product_id,
                  variation_id: item.variation_id,
                  quantity: item.quantity,
                  product_name: item.product_name,
                  // We'd need to find these from availableProducts if loaded to populate costs correctly for editing
                  // Leaving 0 for now if not found, forcing user to re-add if they want strategy calc updates on edit
                  cost_price: 0, 
                  unit_price: 0
              })) || []
          });
      } else {
          setEditingKit(null);
          setFormData({
              name: '',
              description: '',
              price: 0,
              is_active: true,
              items: []
          });
      }
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingKit(null);
      setSelectedVariationId('');
      setItemQuantity(1);
  };

  const handleAddItem = () => {
      if (!selectedVariationId || itemQuantity <= 0) return;
      
      // Find product and variation details
      let foundProduct: Product | undefined;
      let foundVariation: any; 
      
      for (const p of availableProducts) {
          const v = p.variations.find(v => v.id === selectedVariationId);
          if (v) {
              foundProduct = p;
              foundVariation = v;
              break;
          }
      }

      if (!foundProduct || !foundVariation) return;

      const newItem: ExtendedProductKitItem = {
          product_id: foundProduct.id,
          variation_id: foundVariation.id,
          quantity: itemQuantity,
          product_name: foundProduct.name,
          variation_name: foundVariation.sku,
          cost_price: Number(foundVariation.cost_price || 0),
          unit_price: Number(foundVariation.price || 0)
      };

      setFormData(prev => ({
          ...prev,
          items: [...prev.items, newItem]
      }));
      
      setSelectedVariationId('');
      setItemQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
      setFormData(prev => ({
          ...prev,
          items: prev.items.filter((_, i) => i !== index)
      }));
  };

  const handleSaveKit = async () => {
      if (!formData.name || formData.items.length === 0) {
          addNotification('Nome e pelo menos um item são obrigatórios', 'warning');
          return;
      }
      if (!token) return;

      // Clean up extended props before sending
      const submissionData: CreateProductKitDTO = {
          ...formData,
          items: formData.items.map(i => ({
              product_id: i.product_id,
              variation_id: i.variation_id,
              quantity: i.quantity
          }))
      };

      try {
          if (editingKit) {
              await productKitService.updateProductKit(editingKit.id, submissionData, token);
              addNotification('Combo atualizado com sucesso!', 'success');
          } else {
              await productKitService.createProductKit(submissionData, token);
              addNotification('Combo criado com sucesso!', 'success');
          }
          fetchKits();
          handleCloseModal();
      } catch (error) {
          addNotification('Erro ao salvar combo', 'error');
      }
  };

  // Helper to generate options for select
  const productOptions = useMemo(() => {
      const options: { value: number; label: string }[] = [];
      availableProducts.forEach(p => {
          p.variations.forEach(v => {
              options.push({
                  value: v.id!,
                  label: `${p.name} - ${v.sku} (R$ ${Number(v.price).toFixed(2)})`
              });
          });
      });
      return options;
  }, [availableProducts]);

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <StyledPageTitle>Combos Estratégicos</StyledPageTitle>
        <Stack direction="row" spacing={2} alignItems="center">
            <TextField 
                size="small"
                placeholder="Buscar combo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start"><FaSearch size={14} /></InputAdornment>,
                        sx: { borderRadius: '12px', width: 250, bgcolor: 'background.paper' }
                    }
                }}
            />
            <Button 
                variant="contained" 
                startIcon={<FaPlus />} 
                onClick={() => handleOpenModal()}
                sx={{ borderRadius: '12px', px: 3 }}
            >
                Novo Combo
            </Button>
        </Stack>
      </Box>

      {/* Filtros Rápidos */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 4, alignItems: 'center' }}>
          <Box sx={{ width: 300 }}>
            <Typography variant="caption" fontWeight={400} color="text.secondary" gutterBottom display="block">FAIXA DE PREÇO (R$)</Typography>
            <Slider
                size="small"
                value={priceRange}
                onChange={(_, val) => setPriceRange(val as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
            />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box display="flex" gap={1}>
            <Chip label="Mais Vendidos" onClick={() => {}} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 400 }} />
            <Chip label="Promoção Ativa" onClick={() => {}} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 400 }} />
          </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
      ) : filteredKits.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'action.hover', borderRadius: '24px' }}>
          <FaBoxOpen size={48} style={{ opacity: 0.3 }} />
          <Typography variant="body1" color="text.secondary" mt={2}>Nenhum combo encontrado com esses filtros.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
            {filteredKits.map((kit) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={kit.id}>
                    <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ height: 180, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                             <FaBoxOpen size={40} style={{ opacity: 0.2 }} />
                        </Box>
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Typography variant="h6" fontWeight={400} noWrap sx={{ maxWidth: '70%' }}>{kit.name}</Typography>
                                <Chip label="COMBO" size="small" color="primary" sx={{ fontWeight: 400, fontSize: '0.6rem' }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                                height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', mb: 2 
                            }}>
                                {kit.description || 'Este combo reúne itens essenciais para sua conveniência.'}
                            </Typography>
                            
                            <Stack direction="row" spacing={1} mb={3}>
                                {kit.items?.slice(0, 3).map((item, idx) => (
                                    <Tooltip key={idx} title={`Item ${idx + 1}`}>
                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: 'primary.50', color: 'primary.main', fontWeight: 400 }}>
                                            {item.quantity}x
                                        </Avatar>
                                    </Tooltip>
                                ))}
                                {(kit.items?.length || 0) > 3 && <Typography variant="caption">+{kit.items!.length - 3}</Typography>}
                            </Stack>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Preço do Combo</Typography>
                                    <Typography variant="h5" fontWeight={400} color="primary">R$ {Number(kit.price).toFixed(2)}</Typography>
                                </Box>
                                <Stack direction="row">
                                    <IconButton size="small" color="primary" onClick={() => handleOpenModal(kit)}><FaEdit size={14} /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(kit.id)}><FaTrash size={14} /></IconButton>
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
      )}

      {/* Modal de Criação/Edição - Estratégico */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 400, pb: 0 }}>
            {editingKit ? 'Editar Combo' : 'Novo Combo Estratégico'}
        </DialogTitle>
        <DialogContent>
            <Grid container spacing={3} pt={2}>
                {/* Lado Esquerdo - Configuração */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Stack spacing={3}>
                        <TextField 
                            label="Nome do Combo" 
                            fullWidth 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        />
                        <TextField 
                            label="Descrição" 
                            fullWidth 
                            multiline 
                            rows={2} 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        />
                        
                        <Divider textAlign="left"><Chip label="Adicionar Itens" size="small" /></Divider>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <FormControl fullWidth size="small">
                                <InputLabel>Selecionar Produto/Variação</InputLabel>
                                <Select
                                    value={selectedVariationId}
                                    label="Selecionar Produto/Variação"
                                    onChange={(e) => setSelectedVariationId(Number(e.target.value))}
                                >
                                    {productOptions.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField 
                                label="Qtd" 
                                type="number" 
                                size="small" 
                                sx={{ width: 100 }} 
                                value={itemQuantity}
                                onChange={(e) => setItemQuantity(Number(e.target.value))}
                            />
                            <Button variant="contained" onClick={handleAddItem} disabled={!selectedVariationId}>Add</Button>
                        </Stack>

                        <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell>Produto</TableCell>
                                        <TableCell align="center">Qtd</TableCell>
                                        <TableCell align="right">Custo Unit.</TableCell>
                                        <TableCell align="right">Preço Orig.</TableCell>
                                        <TableCell align="center">Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.items.length === 0 && (
                                        <TableRow><TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 3 }}>Nenhum item adicionado.</TableCell></TableRow>
                                    )}
                                    {formData.items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={400}>{item.product_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{item.variation_name}</Typography>
                                            </TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell align="right">R$ {Number(item.cost_price).toFixed(2)}</TableCell>
                                            <TableCell align="right">R$ {Number(item.unit_price).toFixed(2)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton color="error" size="small" onClick={() => handleRemoveItem(idx)}>
                                                    <FaTrash size={12} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Stack>
                </Grid>

                {/* Lado Direito - Dashboard Estratégico */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 3, 
                            borderRadius: '24px', 
                            bgcolor: 'primary.50', 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}
                    >
                        <Typography variant="h6" fontWeight={400} color="primary.main" display="flex" alignItems="center" gap={1}>
                            <FaChartLine /> Análise Financeira
                        </Typography>

                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={400}>CUSTO TOTAL DOS ITENS</Typography>
                            <Typography variant="h5" fontWeight={400}>R$ {strategy.totalCost.toFixed(2)}</Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={400}>SOMA DOS PREÇOS ORIGINAIS</Typography>
                            <Typography variant="h5" fontWeight={400} sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                R$ {strategy.originalTotalValue.toFixed(2)}
                            </Typography>
                        </Box>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'background.paper' }}>
                            <Typography variant="caption" color="primary" fontWeight={400} gutterBottom display="block">DEFINIR PREÇO DO COMBO</Typography>
                            <TextField 
                                fullWidth 
                                value={formData.price} 
                                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                                InputProps={{ 
                                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                    sx: { fontSize: '1.5rem', fontWeight: 400 }
                                }}
                                variant="standard"
                            />
                        </Paper>

                        <Stack direction="row" spacing={2} justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={400}>LUCRO LÍQUIDO</Typography>
                                <Typography variant="h6" fontWeight={400} color={strategy.profit > 0 ? "success.main" : "error.main"}>
                                    R$ {strategy.profit.toFixed(2)}
                                </Typography>
                            </Box>
                            <Box textAlign="right">
                                <Typography variant="caption" color="text.secondary" fontWeight={400}>MARGEM</Typography>
                                <Chip 
                                    label={`${strategy.margin.toFixed(1)}%`} 
                                    color={strategy.margin > 20 ? "success" : strategy.margin > 0 ? "warning" : "error"} 
                                    size="small" 
                                    sx={{ fontWeight: 400 }} 
                                />
                            </Box>
                        </Stack>

                        {strategy.discount > 0 && (
                            <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 1.5, borderRadius: '12px', textAlign: 'center' }}>
                                <Typography variant="body2" fontWeight={400}>
                                    Você está oferecendo {strategy.discount.toFixed(1)}% de desconto neste combo!
                                </Typography>
                            </Box>
                        )}

                        <FormControlLabel 
                            control={
                                <Switch 
                                    checked={formData.is_active} 
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                                />
                            } 
                            label="Combo Ativo para Vendas" 
                            sx={{ mt: 'auto' }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseModal} sx={{ borderRadius: '12px' }}>Cancelar</Button>
            <Button 
                variant="contained" 
                onClick={handleSaveKit} 
                sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 400 }}
                startIcon={<FaCalculator />}
            >
                Salvar Combo
            </Button>
        </DialogActions>
      </Dialog>
    </StyledPageContainer>
  );
};

export default ProductKitsPage;
