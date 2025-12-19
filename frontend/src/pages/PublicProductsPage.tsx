import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import ProductCard from '../components/Products/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  sku: string;
  variations: Array<{
    id: number;
    color: string;
    price: number;
    image_url?: string;
  }>;
  description?: string;
  // Adicionar outros campos relevantes do produto
}

interface PaginatedProductsResponse {
  products: Product[];
  totalCount: number;
}

const PublicProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('ASC');

  const { token } = useAuth(); // Token pode ser nulo para produtos públicos, mas é bom ter o contexto
  const { addToast } = useNotification();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', ((page - 1) * limit).toString());
      if (search) queryParams.append('search', search);
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortDirection', sortDirection);

      const response = await fetch(`/api/public-products?${queryParams.toString()}`, {
        headers: {
          // Para rotas públicas, o token pode ser opcional ou não necessário
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PaginatedProductsResponse = await response.json();
      setProducts(data.products);
      setTotalProducts(data.totalCount);
    } catch (err: any) {
      console.error('Falha ao buscar produtos:', err);
      setError(err.message || 'Falha ao carregar produtos.');
      addToast('Falha ao carregar produtos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryId, minPrice, maxPrice, sortBy, sortDirection, token, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleLimitChange = (event: SelectChangeEvent) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Resetar para a primeira página ao mudar o limite
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setCategoryId(e.target.value);
    setPage(1);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
    setPage(1);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
    setPage(1);
  };

  const handleSortByChange = (e: SelectChangeEvent) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleSortDirectionChange = (e: SelectChangeEvent) => {
    setSortDirection(e.target.value);
    setPage(1);
  };

  // TODO: Buscar categorias dinamicamente do backend
  const mockCategories = [
    { id: '1', name: 'Eletrônicos' },
    { id: '2', name: 'Roupas' },
    { id: '3', name: 'Livros' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Nossos Produtos
      </Typography>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Buscar Produto"
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select value={categoryId} label="Categoria" onChange={handleCategoryChange}>
                <MenuItem value="">Todas</MenuItem>
                {mockCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Preço Mínimo"
              variant="outlined"
              size="small"
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Preço Máximo"
              variant="outlined"
              size="small"
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select value={sortBy} label="Ordenar por" onChange={handleSortByChange}>
                <MenuItem value="name">Nome</MenuItem>
                <MenuItem value="price">Preço</MenuItem>
                <MenuItem value="created_at">Data de Criação</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Direção</InputLabel>
              <Select value={sortDirection} label="Direção" onChange={handleSortDirectionChange}>
                <MenuItem value="ASC">ASC</MenuItem>
                <MenuItem value="DESC">DESC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </motion.div>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={Math.ceil(totalProducts / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default PublicProductsPage;
