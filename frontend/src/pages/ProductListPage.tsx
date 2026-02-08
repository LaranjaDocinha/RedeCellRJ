import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLoaderData, useNavigation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Pagination, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Tooltip, 
  Divider, 
  Chip,
  TableSortLabel,
  useTheme,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaPlus, 
  FaThLarge, 
  FaList, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaShoppingCart, 
  FaImage, 
  FaHeart, 
  FaRegHeart, 
  FaSearch, 
  FaBox, 
  FaFilter,
  FaCalculator 
} from 'react-icons/fa';

import ErrorBoundary from '../components/ErrorBoundary';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import LabelPrintModal from '../components/ProductCatalog/LabelPrintModal';
import ShelfLabelModal from '../components/ProductCatalog/ShelfLabelModal';
import ProductForm from '../components/Products/ProductForm';
import PageHeader from '../components/Shared/PageHeader';

import { useWishlist } from '../hooks/useWishlist';
import { Product } from '../types/product';

import { ProductBulkEditModal } from '../components/Products/ProductBulkEditModal';

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isInWishlist } = useWishlist();
  const navigation = useNavigation();
  
  // Data from loader
  const { products: initialProducts, totalCount } = useLoaderData() as { products: Product[], totalCount: number };
  
  // Estados de Filtro e Busca
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Estados de UI
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [orderBy, setOrderBy] = useState<string>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

  // Sync URL with filters for loader (Optional but recommended for Deep Linking)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (page > 1) params.set('page', page.toString());
    
    // navigate({ search: params.toString() }, { replace: true });
    // Note: To avoid infinite loop or flickering, we only navigate if something changed.
    // For this simple refactor, we'll keep local state and the loader will run on initial mount.
  }, [filters, page]);

  const totalPages = Math.ceil((totalCount || 0) / 10);
  const categories = ["Todos", "Smartphones", "Carregadores", "Cabos", "Áudio", "Películas", "Acessórios"];

  // Debounce para a busca
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProducts = useMemo(() => {
    if (!initialProducts) return [];
    let filtered = [...initialProducts];
    if (showFavoritesOnly) {
      filtered = filtered.filter(p => isInWishlist(p.id));
    }
    return filtered.sort((a, b) => {
      let aValue: any = (a as any)[orderBy];
      let bValue: any = (b as any)[orderBy];
      if (orderBy === 'price') {
        aValue = Number(a.variations?.[0]?.price || 0);
        bValue = Number(b.variations?.[0]?.price || 0);
      } else if (orderBy === 'stock') {
        aValue = Number(a.variations?.[0]?.stock_quantity || 0);
        bValue = Number(b.variations?.[0]?.stock_quantity || 0);
      }
      if (bValue < aValue) return order === 'asc' ? -1 : 1;
      if (bValue > aValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [initialProducts, order, orderBy, showFavoritesOnly, isInWishlist]);

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isShelfLabelModalOpen, setIsShelfLabelModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const isDarkMode = theme.palette.mode === 'dark';
  const isNavigating = navigation.state === "loading";

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <PageHeader 
          title="Produtos"
          subtitle={`${totalCount || 0} itens cadastrados`}
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Catálogo', to: '/products' }, { label: 'Produtos' }]}
          actions={[
            { label: 'Gôndola', onClick: () => setIsShelfLabelModalOpen(true), variant: 'outlined' },
            { label: 'Etiquetas', onClick: () => setIsLabelModalOpen(true), variant: 'outlined' },
            { label: 'Edição Expressa', onClick: () => setIsBulkEditOpen(true), variant: 'outlined', color: 'secondary', icon: <FaCalculator /> },
            { label: 'Novo Produto', onClick: () => setIsProductModalOpen(true), icon: <FaPlus /> }
          ]}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
             <Stack direction="row" spacing={1.5} alignItems="center">
                <Paper variant="outlined" sx={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
                    <IconButton 
                        size="small" 
                        onClick={() => setViewMode('card')}
                        sx={{ borderRadius: 0, bgcolor: viewMode === 'card' ? alpha(theme.palette.primary.main, 0.1) : 'transparent', color: viewMode === 'card' ? theme.palette.primary.main : 'inherit' }}
                    >
                        <FaThLarge size={14} />
                    </IconButton>
                    <Divider orientation="vertical" flexItem />
                    <IconButton 
                        size="small" 
                        onClick={() => setViewMode('list')}
                        sx={{ borderRadius: 0, bgcolor: viewMode === 'list' ? alpha(theme.palette.primary.main, 0.1) : 'transparent', color: viewMode === 'list' ? theme.palette.primary.main : 'inherit' }}
                    >
                        <FaList size={14} />
                    </IconButton>
                </Paper>
                <Tooltip title={showFavoritesOnly ? "Ver Todos" : "Ver Favoritos"}>
                    <IconButton 
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        sx={{ 
                            border: `1px solid ${theme.palette.divider}`, 
                            borderRadius: '10px',
                            color: showFavoritesOnly ? '#ff4d4f' : theme.palette.text.secondary,
                            bgcolor: showFavoritesOnly ? alpha('#ff4d4f', 0.05) : theme.palette.background.paper,
                            width: 40, height: 40
                        }}
                    >
                        {showFavoritesOnly ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                    </IconButton>
                </Tooltip>
             </Stack>
        </Box>

        {/* Filtros e Busca */}
        <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Pesquisar itens..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FaSearch size={14} color={theme.palette.text.disabled} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '10px', bgcolor: theme.palette.background.paper }
                            }
                        }}
                    />
                </Grid>
                <Grid>
                    <Button 
                        variant="outlined"
                        color="primary"
                        onClick={(e) => setFilterAnchorEl(e?.currentTarget)}
                        startIcon={<FaFilter size={12} />}
                        label={filters.category || "Categorias"}
                        sx={{ borderRadius: '10px', borderColor: theme.palette.divider, color: theme.palette.text.secondary, height: 40, textTransform: 'none', fontWeight: 400 }}
                    />
                    <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={() => setFilterAnchorEl(null)}>
                        {categories.map((cat) => (
                            <MenuItem key={cat} onClick={() => { setFilters(prev => ({ ...prev, category: cat === "Todos" ? "" : cat })); setFilterAnchorEl(null); }}>
                                {cat}
                            </MenuItem>
                        ))}
                    </Menu>
                </Grid>
                <Grid size="grow">
                    <Box sx={{ display: 'flex', gap: 3, opacity: 0.6, justifyContent: 'flex-end' }}>
                        <Typography variant="caption" sx={{ fontWeight: 400 }}>{totalCount || 0} Itens</Typography>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="caption" sx={{ fontWeight: 400, color: theme.palette.error.main }}>
                            {initialProducts?.filter((p: any) => (p.variations?.[0]?.stock_quantity || 0) <= 5).length || 0} Baixo estoque
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>

        {/* Área de Resultados */}
        <Box sx={{ position: 'relative', minHeight: '400px' }}>
            <AnimatePresence>
                {isNavigating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: alpha(theme.palette.background.default, 0.4),
                            backdropFilter: 'blur(2px)',
                            borderRadius: '16px'
                        }}
                    >
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress size={40} thickness={4} />
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, letterSpacing: 1, fontWeight: 400 }}>
                                ATUALIZANDO...
                            </Typography>
                        </Stack>
                    </motion.div>
                )}
            </AnimatePresence>

            <Box sx={{ opacity: isNavigating ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
                {sortedProducts.length === 0 && !isNavigating ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fcfcfc', borderRadius: '16px', border: `1px dashed ${theme.palette.divider}`, textAlign: 'center' }}>
                        <FaBox size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <Typography variant="h6" sx={{ fontWeight: 400 }}>Nenhum produto encontrado</Typography>
                    </Box>
                ) : viewMode === 'card' ? (
                    <Grid container spacing={3}>
                        {sortedProducts.map((product: Product) => {
                            const variation = product.variations?.[0];
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                                    <ProductCard 
                                        id={product.id}
                                        name={product.name}
                                        imageUrl={variation?.image_url || 'https://placehold.co/150'}
                                        price={variation?.price ? Number(variation.price) : 0}
                                        rating={5}
                                        onAddToCart={() => {}}
                                        onQuickView={() => navigate(`/products/${product.id}`)}
                                        onEdit={() => navigate(`/products/${product.id}/edit`)}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: isDarkMode ? alpha(theme.palette.common.white, 0.05) : '#f8f9fa' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 400 }}><TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleRequestSort('name')}>PRODUTO</TableSortLabel></TableCell>
                                    <TableCell sx={{ fontWeight: 400 }}><TableSortLabel active={orderBy === 'sku'} direction={orderBy === 'sku' ? order : 'asc'} onClick={() => handleRequestSort('sku')}>SKU</TableSortLabel></TableCell>
                                    <TableCell sx={{ fontWeight: 400 }}>TIPO</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 400 }}><TableSortLabel active={orderBy === 'price'} direction={orderBy === 'price' ? order : 'asc'} onClick={() => handleRequestSort('price')}>PREÇO</TableSortLabel></TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 400 }}><TableSortLabel active={orderBy === 'stock'} direction={orderBy === 'stock' ? order : 'asc'} onClick={() => handleRequestSort('stock')}>ESTOQUE</TableSortLabel></TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 400 }}>AÇÕES</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedProducts.map((product: Product) => {
                                    const variation = product.variations?.[0];
                                    return (
                                        <TableRow key={product.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ width: 40, height: 40, borderRadius: '6px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fbfbfb', border: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                        {variation?.image_url ? <Box component="img" src={variation.image_url} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <FaImage size={18} color={theme.palette.text.disabled} />}
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 400 }}>{product.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell><Typography variant="caption" sx={{ fontWeight: 400 }}>{product.sku}</Typography></TableCell>
                                            <TableCell><Chip label={product.product_type || 'Produto'} size="small" variant="outlined" sx={{ fontSize: '0.65rem', fontWeight: 400 }} /></TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 400 }}>R$ {Number(variation?.price || 0).toFixed(2)}</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 400 }}>{variation?.stock_quantity || 0}</TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <IconButton size="small" color="primary"><FaShoppingCart size={14} /></IconButton>
                                                    <IconButton size="small" onClick={() => navigate(`/products/${product.id}`)} sx={{ color: theme.palette.text.secondary }}><FaEye size={14} /></IconButton>
                                                    <IconButton size="small" onClick={() => navigate(`/products/${product.id}/edit`)} sx={{ color: theme.palette.text.secondary }}><FaEdit size={14} /></IconButton>
                                                    <IconButton size="small" color="error"><FaTrash size={14} /></IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" />
        </Box>

        {/* Modals */}
        <Dialog open={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px', bgcolor: theme.palette.background.default } }}>
          <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 400 }}>Cadastrar Novo Produto</Typography>
            <IconButton onClick={() => setIsProductModalOpen(false)} size="small"><FaTimes /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 0 }}>
            <ProductForm onSuccess={() => { setIsProductModalOpen(false); /* loader logic handles refresh on navigation */ }} onCancel={() => setIsProductModalOpen(false)} />
          </DialogContent>
        </Dialog>

        <LabelPrintModal open={isLabelModalOpen} onClose={() => setIsLabelModalOpen(false)} products={(initialProducts as any) || []} />
        <ShelfLabelModal open={isShelfLabelModalOpen} onClose={() => setIsShelfLabelModalOpen(false)} products={(initialProducts as any) || []} />
        <ProductBulkEditModal open={isBulkEditOpen} onClose={() => setIsBulkEditOpen(false)} products={initialProducts || []} onSuccess={() => {}} />
      </Box>
    </ErrorBoundary>
  );
};

export default ProductListPage;