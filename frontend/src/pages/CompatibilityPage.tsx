import React, { useState, useEffect } from 'react';
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
  alpha
} from '@mui/material';
import {
  Search,
  Add,
  Smartphone,
  CompareArrows,
  PhoneAndroid,
  Apple,
  InfoOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

interface Compatibility {
  id: number;
  brand: string;
  model: string;
  compatible_models: string[];
  category: string;
  notes?: string;
}

const CompatibilityPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newCompatibility, setNewCompatibility] = useState({
    brand: '',
    model: '',
    compatible_models: '',
    category: 'Pelicula 3D',
    notes: ''
  });

  const fetchCompatibilities = async (search?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/compatibility`, {
        params: { search, category: 'Pelicula 3D' },
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompatibilities(response.data);
    } catch (error) {
      console.error('Error fetching compatibilities:', error);
      // Fallback para visualização se a API falhar
      if (compatibilities.length === 0) {
          setCompatibilities([
            { id: 1, brand: 'Apple', model: 'iPhone 13', compatible_models: ['iPhone 13 Pro', 'iPhone 14'], category: 'Pelicula 3D', notes: 'Mesmo tamanho de tela 6.1"' },
            { id: 2, brand: 'Samsung', model: 'Galaxy A22', compatible_models: ['Galaxy M32', 'Galaxy A33 5G'], category: 'Pelicula 3D' },
          ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const delayDebounceFn = setTimeout(() => {
      fetchCompatibilities(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, token]);

  const handleCreate = async () => {
    if (!token) return;
    try {
      await axios.post('/api/compatibility', {
        ...newCompatibility,
        compatible_models: newCompatibility.compatible_models.split(',').map(m => m.trim())
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenModal(false);
      fetchCompatibilities(searchTerm);
      setNewCompatibility({ brand: '', model: '', compatible_models: '', category: 'Pelicula 3D', notes: '' });
    } catch (error) {
      console.error('Error creating compatibility:', error);
    }
  };

  const getBrandIcon = (brand: string) => {
    if (brand.toLowerCase().includes('apple') || brand.toLowerCase().includes('iphone')) {
      return <Apple sx={{ color: theme.palette.mode === 'dark' ? '#aaa' : '#555' }} />;
    }
    return <Smartphone color="primary" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 400 }}>
            Películas Compatíveis 3D
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consulte quais modelos de aparelhos compartilham a mesma película.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: '12px', textTransform: 'none', px: 3, boxShadow: 'none' }}
        >
          Nova Compatibilidade
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 1,
          mb: 4,
          borderRadius: '16px',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <TextField
          fullWidth
          placeholder="Pesquisar por marca ou modelo (ex: iPhone 13 ou Samsung A22)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 2 }}>
                <Search color="action" />
              </InputAdornment>
            ),
            sx: { height: '56px', fontSize: '1.1rem' }
          }}
        />
      </Paper>

      {loading && compatibilities.length === 0 ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {compatibilities.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: '24px',
                      height: '100%',
                      bgcolor: 'background.paper',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.05)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={2.5}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            display: 'flex',
                            mr: 2
                          }}
                        >
                          {getBrandIcon(item.brand)}
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {item.brand}
                          </Typography>
                          <Typography variant="h6">
                            {item.model}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CompareArrows sx={{ fontSize: 18, mr: 1 }} color="action" />
                        Compatível com:
                      </Typography>

                      <Box display="flex" flexWrap="wrap" gap={1} mb={2.5}>
                        {item.compatible_models.map((compat, idx) => (
                          <Chip
                            key={idx}
                            label={compat}
                            size="small"
                            variant="outlined"
                            icon={<PhoneAndroid sx={{ fontSize: '14px !important' }} />}
                            sx={{ borderRadius: '8px', borderStyle: 'dashed' }}
                          />
                        ))}
                      </Box>

                      {item.notes && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'flex-start',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <InfoOutlined sx={{ fontSize: 16, mr: 1, mt: 0.2, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {item.notes}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>

          {!loading && compatibilities.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box textAlign="center" py={10}>
                <Typography variant="h6" color="text.secondary">
                  Nenhuma compatibilidade encontrada para "{searchTerm}"
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={() => setOpenModal(true)}
                  sx={{ mt: 2 }}
                >
                  Adicionar esta informação
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Modal Nova Compatibilidade */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        PaperProps={{ sx: { borderRadius: '24px', width: '100%', maxWidth: '500px', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem' }}>
          Nova Compatibilidade
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={2}>
            <TextField
              label="Marca"
              fullWidth
              value={newCompatibility.brand}
              onChange={(e) => setNewCompatibility({ ...newCompatibility, brand: e.target.value })}
              placeholder="Ex: Samsung"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Modelo Principal"
              fullWidth
              value={newCompatibility.model}
              onChange={(e) => setNewCompatibility({ ...newCompatibility, model: e.target.value })}
              placeholder="Ex: Galaxy A22"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Modelos Compatíveis"
              fullWidth
              multiline
              rows={2}
              value={newCompatibility.compatible_models}
              onChange={(e) => setNewCompatibility({ ...newCompatibility, compatible_models: e.target.value })}
              placeholder="Separe por vírgula. Ex: Galaxy M32, Galaxy A33"
              helperText="Quais modelos usam a mesma película deste modelo principal?"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Notas Adicionais"
              fullWidth
              value={newCompatibility.notes}
              onChange={(e) => setNewCompatibility({ ...newCompatibility, notes: e.target.value })}
              placeholder="Ex: Tela 6.4 polegadas, sem notch"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            sx={{ borderRadius: '12px', px: 4, boxShadow: 'none' }}
            disabled={!newCompatibility.brand || !newCompatibility.model || !newCompatibility.compatible_models}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompatibilityPage;