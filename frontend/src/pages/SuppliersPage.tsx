import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  Stack, 
  Chip, 
  IconButton, 
  alpha, 
  useTheme,
  Avatar,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  FaTruck, FaPlus, FaSearch, FaHistory, FaStar, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileInvoice
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

const SuppliersPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { addNotification } = useNotification();
  
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/suppliers', { headers: { Authorization: `Bearer ${token}` } });
      setSuppliers(res.data);
    } catch (err) {
      addNotification('Erro ao carregar fornecedores.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      import { 
  FaTruck, FaPlus, FaSearch, FaHistory, FaStar, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileInvoice, FaSync, FaChartLine
} from 'react-icons/fa';

// ... inside component
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={5}>
        <Box>
            <Typography variant="h4" fontWeight={400} sx={{ letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: 2 }}>
                <FaTruck color={theme.palette.primary.main} /> Parceiros & Fornecedores
            </Typography>
            <Typography variant="body2" color="text.secondary">Gestão de suprimentos, qualidade e histórico de compras</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<FaSync />}>Sincronizar Catálogos</Button>
            <Button variant="contained" startIcon={<FaPlus />} sx={{ borderRadius: '12px', px: 3 }}>Novo Fornecedor</Button>
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: '24px', display: 'flex', alignItems: 'center', gap: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}><FaChartLine /></Avatar>
                  <Box>
                      <Typography variant="caption" fontWeight={400}>LEAD TIME MÉDIO</Typography>
                      <Typography variant="h5" fontWeight={400}>2.4 Dias</Typography>
                  </Box>
              </Paper>
          </Grid>
          {/* ... more stats */}
      </Grid>

      {/* Busca e Resumo */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: '20px', border: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 3, alignItems: 'center' }}>
          <TextField 
            fullWidth 
            size="small" 
            placeholder="Pesquisar por nome, produto ou cidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                startAdornment: <InputAdornment position="start"><FaSearch size={14} color={theme.palette.primary.main} /></InputAdornment>,
                sx: { borderRadius: '12px', bgcolor: 'action.hover', border: 'none', '& fieldset': { border: 'none' } }
            }}
          />
          <Divider orientation="vertical" flexItem />
          <Box display="flex" gap={3}>
              <Box textAlign="center"><Typography variant="h6" fontWeight={400}>{suppliers.length}</Typography><Typography variant="caption" color="text.secondary">ATIVOS</Typography></Box>
              <Box textAlign="center"><Typography variant="h6" fontWeight={400} color="success.main">98%</Typography><Typography variant="caption" color="text.secondary">QUALIDADE</Typography></Box>
          </Box>
      </Paper>

      <Grid container spacing={3}>
        {suppliers.map((supplier, idx) => (
            <Grid item xs={12} md={6} lg={4} key={supplier.id}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Paper sx={{ p: 3, borderRadius: '28px', border: `1px solid ${theme.palette.divider}`, position: 'relative', overflow: 'hidden', '&:hover': { borderColor: 'primary.main', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' } }}>
                        <Box display="flex" gap={2} mb={3}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '1.2rem', fontWeight: 400 }}>{supplier.name[0]}</Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={400}>{supplier.name}</Typography>
                                <Stack direction="row" spacing={1} mt={0.5}>
                                    <Chip label="Eletrônicos" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 400 }} />
                                    <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'warning.main' }}><FaStar size={10} /><Typography variant="caption" fontWeight={400}>4.9</Typography></Box>
                                </Stack>
                            </Box>
                        </Box>

                        <Stack spacing={1.5} mb={3}>
                            <Box display="flex" alignItems="center" gap={1.5} color="text.secondary">
                                <FaEnvelope size={12} /> <Typography variant="caption">{supplier.email || 'N/A'}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1.5} color="text.secondary">
                                <FaPhone size={12} /> <Typography variant="caption">{supplier.phone || 'N/A'}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1.5} color="text.secondary">
                                <FaMapMarkerAlt size={12} /> <Typography variant="caption" noWrap>{supplier.address || 'Internacional'}</Typography>
                            </Box>
                        </Stack>

                        <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Button fullWidth variant="outlined" startIcon={<FaHistory />} sx={{ borderRadius: '10px', fontSize: '0.75rem', fontWeight: 400 }}>PEDIDOS</Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button fullWidth variant="outlined" startIcon={<FaFileInvoice />} sx={{ borderRadius: '10px', fontSize: '0.75rem', fontWeight: 400 }}>NOTAS</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </motion.div>
            </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SuppliersPage;

