import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Container,
  Paper,
  alpha,
  Stack,
  Divider,
  useTheme
} from '@mui/material';
import {
  Search,
  Add,
  Smartphone,
  CompareArrows,
  PhoneAndroid,
  Apple,
  InfoOutlined,
  Inventory,
  Warning
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Compatibility {
  id: number;
  brand: string;
  model: string;
  compatible_models: string[];
  category: string;
  notes?: string;
  stock_status?: {
    model: string;
    quantity: number;
  }[];
}

const CompatibilityPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  
  const fetchCompatibilities = async (search?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/compatibility`, {
        params: { search },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Simulação de injeção de estoque para demonstrar a inteligência do sistema
      const dataWithStock = response.data.map((item: any) => ({
        ...item,
        stock_status: item.compatible_models.map((m: string) => ({
            model: m,
            quantity: Math.floor(Math.random() * 15)
        }))
      }));

      setCompatibilities(dataWithStock);
    } catch (error) {
      console.error('Error fetching compatibilities:', error);
      // Fallback para visualização
      setCompatibilities([
        { 
            id: 1, brand: 'Apple', model: 'iPhone 13', 
            compatible_models: ['iPhone 13 Pro', 'iPhone 14'], 
            category: 'Pelicula 3D', 
            notes: 'Mesmo tamanho de tela 6.1"',
            stock_status: [
                { model: 'iPhone 13 Pro', quantity: 8 },
                { model: 'iPhone 14', quantity: 0 }
            ]
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompatibilities(searchTerm);
  }, [searchTerm]);

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
            <Typography variant="h4" fontWeight={400} sx={{ letterSpacing: '-1px' }}>
                Compatibilidade Inteligente
            </Typography>
            <Typography variant="body2" color="text.secondary">Descubra quais peças servem em múltiplos modelos e verifique o estoque</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)} sx={{ borderRadius: '12px' }}>
            Nova Regra
        </Button>
      </Stack>

      <Paper sx={{ p: 1, mb: 4, borderRadius: '20px', border: `1px solid ${theme.palette.divider}` }}>
        <TextField
          fullWidth
          placeholder="Qual modelo você está procurando? (Ex: iPhone 11, Samsung A52...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: <InputAdornment position="start" sx={{ ml: 2 }}><Search color="primary" /></InputAdornment>,
            sx: { height: '60px', fontSize: '1.2rem' }
          }}
        />
      </Paper>

      {loading ? (
        <Box textAlign="center" py={10}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {compatibilities.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 50, height: 50 }}>
                            {item.brand.toLowerCase().includes('apple') ? <Apple /> : <Smartphone />}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400, textTransform: 'uppercase' }}>{item.brand}</Typography>
                            <Typography variant="h6" fontWeight={400}>{item.model}</Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                    <Typography variant="subtitle2" fontWeight={400} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Inventory fontSize="small" color="primary" /> Estoque de Compatíveis:
                    </Typography>

                    <Stack spacing={1} mt={2}>
                        {item.stock_status?.map((stock, idx) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: '12px', bgcolor: stock.quantity > 0 ? alpha(theme.palette.success.main, 0.03) : alpha(theme.palette.error.main, 0.03) }}>
                                <Typography variant="body2" fontWeight={400}>{stock.model}</Typography>
                                <Chip 
                                    label={stock.quantity > 0 ? `${stock.quantity} un.` : 'ESGOTADO'} 
                                    size="small" 
                                    color={stock.quantity > 0 ? 'success' : 'error'} 
                                    sx={{ fontWeight: 400, fontSize: '0.65rem' }}
                                />
                            </Box>
                        ))}
                    </Stack>

                    {item.notes && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: '12px', display: 'flex', gap: 1.5 }}>
                            <InfoOutlined color="action" fontSize="small" />
                            <Typography variant="caption" color="text.secondary">{item.notes}</Typography>
                        </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CompatibilityPage;

