import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Chip, 
  Stack, 
  alpha, 
  useTheme,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaFire, FaBolt, FaStar, FaShoppingCart, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { 
  FaFire, FaBolt, FaStar, FaShoppingCart, FaChevronRight, FaPlayCircle, FaExchangeAlt, FaBell 
} from 'react-icons/fa';
import { Countdown } from '../components/Countdown';

const LaunchesPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* 5.1 Stories Visual (Destaques) */}
      <Stack direction="row" spacing={2} sx={{ mb: 6, overflowX: 'auto', pb: 2 }}>
          {['Review iP15', 'Unboxing AirPods', 'Teste de Carga'].map((s, i) => (
              <Box key={i} sx={{ minWidth: 80, textAlign: 'center' }}>
                  <Avatar sx={{ width: 70, height: 70, border: `3px solid ${theme.palette.secondary.main}`, p: 0.5, bgcolor: 'transparent' }}>
                      <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaPlayCircle />
                      </Box>
                  </Avatar>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 400 }}>{s}</Typography>
              </Box>
          ))}
      </Stack>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={400} sx={{ letterSpacing: '-2px', background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.warning.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 2 }}>
            <FaBolt /> Novidades no Estoque
        </Typography>
        {/* 5.4 Contagem Regressiva Global */}
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            PRÓXIMO LOTE EM: <Countdown targetDate={new Date(new Date().getTime() + 48 * 60 * 60 * 1000)} />
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {mockLaunches.map((item, index) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <Paper 
                        elevation={0}
                        sx={{ 
                            borderRadius: '32px', 
                            overflow: 'hidden', 
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: 'background.paper',
                            position: 'relative'
                        }}
                    >
                        <Box sx={{ height: 300, position: 'relative' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
                                <Chip 
                                    label={item.status} 
                                    size="small" 
                                    color="secondary" 
                                    sx={{ fontWeight: 400, px: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} 
                                />
                            </Box>
                        </Box>

                        <Box sx={{ p: 4 }}>
                            <Typography variant="caption" fontWeight={400} color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                {item.category}
                            </Typography>
                            <Typography variant="h5" fontWeight={400} sx={{ mt: 1, mb: 2 }}>{item.name}</Typography>
                            
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Preço à Vista</Typography>
                                    <Typography variant="h5" fontWeight={400} color="success.main">
                                        R$ {item.price.toLocaleString()}
                                    </Typography>
                                    {/* 5.12 Simulador de Parcelamento */}
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>ou 12x de R$ {(item.price * 1.1 / 12).toFixed(2)}</Typography>
                                </Box>
                                <Stack direction="column" alignItems="flex-end" spacing={1}>
                                    {/* 5.10 Prova Social */}
                                    <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 400, fontSize: '0.6rem' }}>
                                        🔥 12 comprados hoje
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Comparar Técnica"><IconButton size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaExchangeAlt size={14}/></IconButton></Tooltip>
                                        <Tooltip title="Avise-me Reposição"><IconButton size="small" color="secondary" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaBell size={14}/></IconButton></Tooltip>
                                        <Button 
                                            variant="contained" 
                                            component={Link} 
                                            to="/pos"
                                            sx={{ borderRadius: '16px', py: 1.5, px: 3, fontWeight: 400 }}
                                            startIcon={<FaShoppingCart />}
                                        >
                                            Vender
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Box>
                    </Paper>
                </motion.div>
            </Grid>
        ))}
      </Grid>

      {/* Seção Informativa de Próximos Lançamentos */}
      <Paper sx={{ mt: 8, p: 6, borderRadius: '40px', bgcolor: alpha(theme.palette.primary.main, 0.03), border: `2px dashed ${alpha(theme.palette.primary.main, 0.1)}`, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={400} gutterBottom>Em Breve na Redecell</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>Estamos negociando lotes de reposição para itens esgotados.</Typography>
        <Button variant="outlined" endIcon={<FaChevronRight />}>Acompanhar Pedidos de Compra</Button>
      </Paper>
    </Box>
  );
};

export default LaunchesPage;

