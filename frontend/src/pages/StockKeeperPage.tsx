import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  List, 
  CircularProgress, 
  IconButton, 
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Stack,
  useTheme,
  InputAdornment,
  Badge,
  Tooltip
} from '@mui/material';
import { 
  QrCodeScanner as BarcodeIcon, 
  Add as PlusIcon, 
  Remove as MinusIcon, 
  Search as SearchIcon, 
  Sync as SyncIcon,
  Inventory as StockIcon,
  Warning as AlertIcon,
  History as HistoryIcon,
  ChevronRight as ArrowIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { fetchAllProducts } from '../services/productService';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductStockInfo {
  product_id: number;
  variation_id: number;
  product_name: string;
  variation_details: string;
  current_stock: number;
  sku: string;
  image_url?: string;
  min_stock?: number;
}

const StockKeeperPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductStockInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const { addNotification } = useNotification();
  const { token } = useAuth();

  const currentBranchId = 1;

  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const { products: fetchedProducts } = await fetchAllProducts(token!, query, undefined, 1, 50);

      const allStockInfo: ProductStockInfo[] = fetchedProducts.flatMap((p: any) => {
        return p.variations.map((v: any) => ({
          product_id: p.id,
          variation_id: v.id,
          product_name: p.name,
          variation_details: `${v.name || ''} ${v.color ? `• ${v.color}` : ''}`,
          current_stock: v.stock_quantity || 0, // Simplified for placeholder consistency
          sku: v.sku || 'SEM SKU',
          image_url: v.image_url,
          min_stock: v.min_stock_level || 2
        }));
      });

      setProducts(allStockInfo);
    } catch (error: any) {
      addNotification(`Erro ao buscar produtos: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  const handleAdjustStock = async (variationId: number, change: number) => {
    try {
      // API integration placeholder
      setProducts(prev => prev.map(p => 
        p.variation_id === variationId ? { ...p, current_stock: Math.max(0, p.current_stock + change) } : p
      ));
      addNotification(`Estoque ajustado com sucesso.`, 'success');
    } catch (error: any) {
      addNotification(`Erro ao ajustar estoque.`, 'error');
    }
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      {/* Header Operacional */}
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Terminal de Estoque
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <StockIcon color="primary" />
            <Typography variant="body1" color="text.secondary" fontWeight={400}>
              Almoxarifado Central • Filial Matriz
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<HistoryIcon />} sx={{ borderRadius: '12px', fontWeight: 400 }}>Histórico</Button>
          <Button 
            variant="contained" 
            startIcon={<SyncIcon />} 
            sx={{ borderRadius: '12px', px: 3, fontWeight: 400 }}
          >
            Sincronizar
          </Button>
        </Stack>
      </Box>

      {/* Barra de Busca Gigante (Estilo Scanner) */}
      <Paper elevation={0} sx={{ p: 1, mb: 6, borderRadius: '24px', border: '2px solid', borderColor: isScanning ? 'primary.main' : 'divider', transition: '0.3s' }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Escaneie o código de barras ou digite o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsScanning(true)}
            onBlur={() => setIsScanning(false)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            sx={{ 
              '& .MuiOutlinedInput-root': { border: 'none', fontSize: '1.2rem', fontWeight: 400 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><BarcodeIcon color="primary" sx={{ fontSize: 32 }} /></InputAdornment>,
            }}
          />
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => handleSearch(searchTerm)}
            sx={{ height: 60, px: 6, borderRadius: '18px', fontWeight: 400 }}
          >
            BUSCAR
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
          <CircularProgress size={60} thickness={5} />
          <Typography sx={{ mt: 3, fontWeight: 400 }} color="text.secondary">Consultando inventário...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((p, idx) => (
            <Grid item xs={12} key={p.variation_id}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={1}>
                        <Avatar 
                          variant="rounded" 
                          src={p.image_url} 
                          sx={{ width: 80, height: 80, borderRadius: '12px', bgcolor: 'action.hover' }}
                        >
                          <PhotoIcon />
                        </Avatar>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" fontWeight={400}>{p.product_name}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={400}>{p.variation_details}</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'divider', px: 1, borderRadius: '4px', mt: 1, display: 'inline-block' }}>
                          SKU: {p.sku}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2} textAlign="center">
                        <Box>
                          <Typography variant="caption" fontWeight={400} color="text.secondary">ESTOQUE ATUAL</Typography>
                          <Typography variant="h4" fontWeight={400} color={p.current_stock <= (p.min_stock || 0) ? 'error.main' : 'text.primary'}>
                            {p.current_stock}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={2} textAlign="center">
                         {p.current_stock <= (p.min_stock || 0) && (
                           <Chip icon={<AlertIcon sx={{ fontSize: '14px !important' }} />} label="ESTOQUE CRÍTICO" color="error" size="small" sx={{ fontWeight: 400, borderRadius: '6px' }} />
                         )}
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Box sx={{ bgcolor: 'background.paper', borderRadius: '14px', border: '1px solid', borderColor: 'divider', p: 0.5, display: 'flex', gap: 1 }}>
                            <IconButton size="large" onClick={() => handleAdjustStock(p.variation_id, -1)} sx={{ bgcolor: 'error.50', color: 'error.main', borderRadius: '10px' }}>
                              <MinusIcon />
                            </IconButton>
                            <Box sx={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="h6" fontWeight={400}>1</Typography>
                            </Box>
                            <IconButton size="large" onClick={() => handleAdjustStock(p.variation_id, 1)} sx={{ bgcolor: 'success.50', color: 'success.main', borderRadius: '10px' }}>
                              <PlusIcon />
                            </IconButton>
                          </Box>
                          <Button variant="contained" color="primary" sx={{ borderRadius: '14px', fontWeight: 400 }}>REPOR</Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
          
          {products.length === 0 && !loading && (
            <Box textAlign="center" py={10} width="100%">
              <StockIcon sx={{ fontSize: 80, color: 'divider', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">Aguardando leitura de código de barras ou SKU...</Typography>
            </Box>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default StockKeeperPage;
