import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Divider, 
  TextField, 
  Stack, 
  Button, 
  alpha, 
  useTheme,
  Avatar,
  IconButton,
  Chip
} from '@mui/material';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaCreditCard, 
  FaCheckCircle, 
  FaTag,
  FaShieldAlt,
  FaLock,
  FaArrowRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const cartItems = [
    { id: 1, name: 'iPhone 15 Pro Max', price: 9299.99, quantity: 1, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2000&auto=format&fit=crop' },
    { id: 2, name: 'Capa de Silicone', price: 299.00, quantity: 1, image: 'https://images.unsplash.com/photo-1603313011101-31c72eee93ef?q=80&w=2000&auto=format&fit=crop' },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + 25.00;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={400} sx={{ letterSpacing: '-1.5px', mb: 1 }}>Finalizar Pedido</Typography>
        <Typography variant="body2" color="text.secondary">Seguro, rápido e criptografado</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Esquerda: Checkout Flow */}
        <Grid item xs={12} lg={8}>
import {
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCheckCircle,
  FaTag,
  FaShieldAlt,
  FaLock,
  FaArrowRight,
  FaApple,
  FaGooglePay
} from 'react-icons/fa';

// ... inside component
                {/* 8.1 One-Click Checkout & 8.2 Mobile Pays */}
                <Paper sx={{ p: 4, borderRadius: '24px', bgcolor: alpha(theme.palette.text.primary, 0.02), border: `1px dashed ${theme.palette.divider}`, mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={400} mb={2} textAlign="center">EXPRESS CHECKOUT</Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <Button fullWidth variant="contained" sx={{ bgcolor: 'black', color: 'white', py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: '#333' } }} startIcon={<FaApple />}>Apple Pay</Button>
                        <Button fullWidth variant="contained" sx={{ bgcolor: 'black', color: 'white', py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: '#333' } }} startIcon={<FaGooglePay />}>Google Pay</Button>
                    </Stack>
                    <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">OU USE O CHECKOUT PADRÃO</Typography></Divider>
                </Paper>

                {/* Step 1: Identificação */}
                <Paper sx={{ p: 4, borderRadius: '24px', border: `1px solid ${activeStep === 0 ? theme.palette.primary.main : theme.palette.divider}` }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: activeStep >= 0 ? 'primary.main' : 'action.hover', width: 32, height: 32, fontSize: '0.9rem' }}>1</Avatar>
                        <Typography variant="h6" fontWeight={400}>Identificação</Typography>
                    </Stack>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Nome Completo" size="small" variant="standard" /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="E-mail" size="small" variant="standard" /></Grid>
                    </Grid>
                </Paper>

                {/* Step 2: Entrega */}
                <Paper sx={{ p: 4, borderRadius: '24px', border: `1px solid ${activeStep === 1 ? theme.palette.primary.main : theme.palette.divider}`, opacity: activeStep < 1 ? 0.6 : 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: activeStep >= 1 ? 'primary.main' : 'action.hover', width: 32, height: 32, fontSize: '0.9rem' }}>2</Avatar>
                        <Typography variant="h6" fontWeight={400}>Endereço de Entrega</Typography>
                    </Stack>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}><TextField fullWidth label="Endereço" size="small" variant="standard" /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="CEP" size="small" variant="standard" /></Grid>
                    </Grid>
                </Paper>

                {/* Step 3: Pagamento */}
                <Paper sx={{ p: 4, borderRadius: '24px', border: `1px solid ${activeStep === 2 ? theme.palette.primary.main : theme.palette.divider}`, opacity: activeStep < 2 ? 0.6 : 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: activeStep >= 2 ? 'primary.main' : 'action.hover', width: 32, height: 32, fontSize: '0.9rem' }}>3</Avatar>
                        <Typography variant="h6" fontWeight={400}>Forma de Pagamento</Typography>
                    </Stack>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Button fullWidth variant="outlined" startIcon={<FaCreditCard />} sx={{ py: 2, borderRadius: '16px' }}>Cartão de Crédito</Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button fullWidth variant="outlined" sx={{ py: 2, borderRadius: '16px', fontWeight: 400, color: '#32bcad', borderColor: '#32bcad' }}>PIX (-5% OFF)</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Stack>
        </Grid>

        {/* Direita: Resumo */}
        <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 4, borderRadius: '32px', position: 'sticky', top: 20 }}>
                <Typography variant="h6" fontWeight={400} gutterBottom>Resumo</Typography>
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={2} sx={{ mb: 3 }}>
                    {cartItems.map(item => (
                        <Box key={item.id} display="flex" gap={2}>
                            <Avatar variant="rounded" src={item.image} sx={{ width: 50, height: 50 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" fontWeight={400}>{item.name}</Typography>
                                <Typography variant="caption" color="text.secondary">Qtd: {item.quantity}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={400}>R$ {item.price.toLocaleString()}</Typography>
                        </Box>
                    ))}
                </Stack>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover', mb: 3, borderStyle: 'dashed' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FaTag color={theme.palette.primary.main} />
                        <TextField fullWidth placeholder="CUPOM" variant="standard" InputProps={{ disableUnderline: true, sx: { fontSize: '0.8rem', fontWeight: 400 } }} />
                        <Button size="small" variant="text" sx={{ fontWeight: 400 }}>APLICAR</Button>
                    </Stack>
                </Paper>

                <Stack spacing={1.5} sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Subtotal</Typography><Typography variant="body2">R$ {subtotal.toLocaleString()}</Typography></Box>
                    <Box display="flex" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Frete</Typography><Typography variant="body2">R$ 25,00</Typography></Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between"><Typography variant="h5" fontWeight={400}>Total</Typography><Typography variant="h5" fontWeight={400} color="primary.main">R$ {total.toLocaleString()}</Typography></Box>
                </Stack>

                <Button fullWidth variant="contained" size="large" sx={{ py: 2, borderRadius: '16px', fontWeight: 400, fontSize: '1.1rem' }} endIcon={<FaArrowRight />}>
                    FECHAR PEDIDO
                </Button>

                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={3} sx={{ opacity: 0.5 }}>
                    <FaLock size={12} />
                    <Typography variant="caption" fontWeight={400}>PAGAMENTO 100% SEGURO</Typography>
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;

