import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Pagination,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Container,
  Paper,
  Chip,
  Stack,
  useTheme,
  IconButton,
  Divider,
  Select
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  LocalOffer as TagIcon,
  ShoppingCart as StoreIcon,
  GridView as GridIcon,
  ViewList as ListIcon
} from '@mui/icons-material';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';

const PublicProductsPage: React.FC = () => {
  const theme = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const { token } = useAuth();
  const { addNotification } = useNotification();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Simulação de carregamento de dados de alta fidelidade
      setTimeout(() => {
        setProducts([
          { id: 1, name: 'iPhone 15 Pro Max', variations: [{ price: 8999.00, image_url: 'https://placehold.co/400x400?text=iPhone+15+Pro' }], description: 'O chip A17 Pro é um salto épico para a performance gráfica.', rating: 5 },
          { id: 2, name: 'Samsung Galaxy S24 Ultra', variations: [{ price: 7499.00, image_url: 'https://placehold.co/400x400?text=Galaxy+S24' }], description: 'Galaxy AI está aqui. Bem-vindo à era da IA móvel.', rating: 4.8 },
          { id: 3, name: 'AirPods Pro (2ª Geração)', variations: [{ price: 1899.00, image_url: 'https://placehold.co/400x400?text=AirPods+Pro' }], description: 'Cancelamento Ativo de Ruído até 2x mais potente.', rating: 4.9 },
          { id: 4, name: 'Apple Watch Series 9', variations: [{ price: 3299.00, image_url: 'https://placehold.co/400x400?text=Apple+Watch' }], description: 'Mais potente, mais brilhante, mais mágico.', rating: 4.7 },
        ]);
        setTotalProducts(4);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      addNotification('Falha ao carregar catálogo.', 'error');
    }
  }, [addNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', pt: 8, pb: 12, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', right: -50, top: -50, opacity: 0.1 }}><StoreIcon sx={{ fontSize: 300 }} /></Box>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 3, opacity: 0.8 }}>SHOWROOM OFICIAL</Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-2px', mb: 2 }}>Explore nosso Catálogo</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, fontWeight: 400, mb: 6 }}>
            Os melhores dispositivos e acessórios com garantia Redecell e suporte especializado.
          </Typography>
          
          <Paper elevation={0} sx={{ p: 1, borderRadius: '20px', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="O que você está procurando hoje?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { border: 'none', px: 2 }, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
              slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
                }
              }}
            />
            <Button variant="contained" sx={{ height: 56, px: 6, borderRadius: '16px', fontWeight: 900 }}>BUSCAR</Button>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, mb: 10 }}>
        <Paper sx={{ p: 2, mb: 6, borderRadius: '24px', border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2}>
            <Chip icon={<FilterIcon />} label="Filtros" onClick={() => {}} variant="outlined" sx={{ fontWeight: 700, borderRadius: '8px' }} />
            <Chip icon={<TagIcon />} label="Categorias" onClick={() => {}} variant="outlined" sx={{ fontWeight: 700, borderRadius: '8px' }} />
          </Stack>
          
          <Stack direction="row" spacing={3} alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" fontWeight={800} color="text.secondary">ORDENAR POR:</Typography>
              <Select value={sortBy} size="small" onChange={(e) => setSortBy(e.target.value)} sx={{ minWidth: 150, borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                <MenuItem value="name">Nome (A-Z)</MenuItem>
                <MenuItem value="price">Menor Preço</MenuItem>
                <MenuItem value="newest">Novidades</MenuItem>
              </Select>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ height: 24 }} />
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" color="primary"><GridIcon /></IconButton>
              <IconButton size="small"><ListIcon /></IconButton>
            </Stack>
          </Stack>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}><CircularProgress thickness={5} size={60} /></Box>
        ) : (
          <Grid container spacing={4}>
            {products.map((product, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    imageUrl={product.variations?.[0]?.image_url || 'https://placehold.co/400x400'}
                    price={product.variations?.[0]?.price || 0}
                    rating={product.rating}
                    onAddToCart={() => {}}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <Pagination
            count={Math.ceil(totalProducts / limit)}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            size="large"
            sx={{ '& .MuiPaginationItem-root': { fontWeight: 800, borderRadius: '12px' } }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default PublicProductsPage;
