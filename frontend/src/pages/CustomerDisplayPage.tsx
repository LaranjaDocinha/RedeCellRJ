import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandingProvider, useBranding } from '../contexts/BrandingContext';

const CustomerDisplay: React.FC = () => {
  const theme = useTheme();
  const { branding } = useBranding();
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const channel = new BroadcastChannel('pos_display_channel');
    
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'UPDATE_CART') {
        setCart(payload.cart);
        setTotal(payload.total);
        setCustomer(payload.customer);
      }
    };

    return () => channel.close();
  }, []);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      bgcolor: 'background.default',
      color: 'text.primary',
      overflow: 'hidden'
    }}>
      {/* Esquerda: Itens do Carrinho */}
      <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" style={{ height: 60 }} />
          ) : (
            <Typography variant="h3" fontWeight={900} color="primary">REDECELL</Typography>
          )}
          <Typography variant="h4" fontWeight={300} color="text.secondary">| Checkout</Typography>
        </Box>

        <Typography variant="h5" fontWeight={800} gutterBottom>Seu Pedido</Typography>
        <Paper elevation={0} sx={{ flex: 1, overflowY: 'auto', borderRadius: '24px', border: '1px solid', borderColor: 'divider', p: 2 }}>
          <List>
            <AnimatePresence>
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText 
                      primary={<Typography variant="h6" fontWeight={700}>{item.name}</Typography>}
                      secondary={<Typography variant="body1">Qtd: {item.quantity} x R$ {item.price.toFixed(2)}</Typography>}
                    />
                    <Typography variant="h6" fontWeight={800}>R$ {item.subtotal.toFixed(2)}</Typography>
                  </ListItem>
                  <Divider />
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
          {cart.length === 0 && (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.disabled" variant="h5">Aguardando itens...</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Direita: Total e Promoções */}
      <Box sx={{ 
        width: 450, 
        bgcolor: 'primary.main', 
        color: 'white', 
        p: 6, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
      }}>
        <Box>
          {customer ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800 }}>CLIENTE IDENTIFICADO</Typography>
              <Typography variant="h4" fontWeight={900} gutterBottom>{customer.name}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>Você tem pontos acumulados! Aproveite descontos exclusivos.</Typography>
            </motion.div>
          ) : (
            <Box>
              <Typography variant="h4" fontWeight={900}>Bem-vindo!</Typography>
              <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>Identifique-se no caixa para acumular pontos de fidelidade.</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Box component="img" src="https://placehold.co/300x200?text=Promocao+do+Dia" sx={{ width: '100%', borderRadius: '24px', mb: 4, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }} />
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Acesse: www.redercell.com.br</Typography>
        </Box>

        <Box>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 4 }} />
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant="h4" fontWeight={300}>TOTAL</Typography>
            <Typography variant="h1" fontWeight={900} sx={{ letterSpacing: '-4px' }}>
              R$ {total.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const CustomerDisplayPage: React.FC = () => (
  <BrandingProvider>
    <CustomerDisplay />
  </BrandingProvider>
);

export default CustomerDisplayPage;
