import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, useTheme, Zoom, Fade } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandingProvider, useBranding } from '../contexts/BrandingContext';
import QRCode from 'qrcode';
import { FiCheckCircle, FiGift } from 'react-icons/fi';

// Componente de Slideshow para Modo Ocioso
const IdleSlideshow = () => {
    const images = [
        'https://placehold.co/1920x1080/1976d2/white?text=Ofertas+Imperdiveis',
        'https://placehold.co/1920x1080/4caf50/white?text=Acumule+Pontos',
        'https://placehold.co/1920x1080/ff9800/white?text=Novos+Acessorios'
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <AnimatePresence mode="wait">
                <motion.img
                    key={index}
                    src={images[index]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </AnimatePresence>
            <Box sx={{ 
                position: 'absolute', inset: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                display: 'flex', alignItems: 'flex-end', p: 8
            }}>
                <Typography variant="h2" color="white" fontWeight={700} sx={{ textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    Bem-vindo à RedecellRJ
                </Typography>
            </Box>
        </Box>
    );
};

const CustomerDisplay: React.FC = () => {
  const theme = useTheme();
  const { branding } = useBranding();
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [customer, setCustomer] = useState<any>(null);
  const [paymentState, setPaymentState] = useState<{ type: string, qrCode?: string, status: 'pending' | 'success' } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const channel = new BroadcastChannel('pos_display_channel');
    
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'UPDATE_CART') {
        setCart(payload.cart);
        setTotal(payload.total);
        setCustomer(payload.customer);
        if (payload.cart.length === 0) setPaymentState(null); // Reset payment on clear
      }
      if (type === 'SHOW_PAYMENT') {
          setPaymentState({ type: payload.method, qrCode: payload.qrCode, status: 'pending' });
      }
      if (type === 'PAYMENT_SUCCESS') {
          setPaymentState(prev => prev ? { ...prev, status: 'success' } : null);
          setTimeout(() => {
              setCart([]);
              setTotal(0);
              setCustomer(null);
              setPaymentState(null);
          }, 5000); // 5s success screen
      }
    };

    return () => channel.close();
  }, []);

  useEffect(() => {
      if (paymentState?.qrCode && canvasRef.current) {
          QRCode.toCanvas(canvasRef.current, paymentState.qrCode, { width: 256, margin: 2 }, (error) => {
              if (error) console.error(error);
          });
      }
  }, [paymentState]);

  const isIdle = cart.length === 0 && !paymentState;

  if (isIdle) {
      return <IdleSlideshow />;
  }

  if (paymentState?.status === 'success') {
      return (
          <Box sx={{ height: '100vh', bgcolor: 'success.main', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <FiCheckCircle size={150} />
              </motion.div>
              <Typography variant="h2" fontWeight={700}>Pagamento Confirmado!</Typography>
              <Typography variant="h4">Obrigado pela preferência.</Typography>
          </Box>
      );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      bgcolor: 'background.paper',
      color: 'text.primary',
      overflow: 'hidden'
    }}>
      {/* Esquerda: Itens do Carrinho */}
      <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" style={{ height: 60 }} />
          ) : (
            <Typography variant="h4" fontWeight={800} color="primary">{branding.appName || 'PDV'}</Typography>
          )}
        </Box>

        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiGift /> Seu Pedido
        </Typography>
        
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 2 }}>
          <List>
            <AnimatePresence>
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                >
                  <Paper elevation={0} sx={{ mb: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h6" fontWeight={600}>{item.name}</Typography>
                            <Typography variant="body1" color="text.secondary">
                                {item.quantity} x R$ {item.price.toFixed(2)}
                            </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={700} color="primary">
                            R$ {item.subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Box>
      </Box>

      {/* Direita: Total e Promoções/Pagamento */}
      <Box sx={{ 
        width: 500, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText', 
        p: 6, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern Decoration */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: 'white', opacity: 0.05 }} />
        
        <Box sx={{ zIndex: 1 }}>
          {customer ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 600, letterSpacing: 2 }}>CLIENTE</Typography>
              <Typography variant="h3" fontWeight={700} gutterBottom>{customer.name}</Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 2, mt: 2 }}>
                  <Typography variant="body1" fontWeight={500}>🌟 Cliente Fidelidade</Typography>
              </Box>
            </motion.div>
          ) : (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography variant="h4" fontWeight={600}>Olá! 👋</Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>Identifique-se para descontos.</Typography>
            </motion.div>
          )}
        </Box>

        <Box sx={{ textAlign: 'center', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {paymentState?.type === 'pix' ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Paper sx={{ p: 2, display: 'inline-block', borderRadius: 4 }}>
                    <canvas ref={canvasRef} />
                  </Paper>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>Escaneie para Pagar (Pix)</Typography>
              </motion.div>
          ) : (
            <>
                <Typography variant="h1" fontWeight={800} sx={{ fontSize: '5rem' }}>
                    {cart.length}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.7 }}>ITENS NO CARRINHO</Typography>
            </>
          )}
        </Box>

        <Box sx={{ zIndex: 1 }}>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 4 }} />
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant="h4" fontWeight={300}>TOTAL A PAGAR</Typography>
            <motion.div key={total} initial={{ scale: 1.2, color: '#ffeb3b' }} animate={{ scale: 1, color: 'inherit' }}>
                <Typography variant="h2" fontWeight={800} sx={{ letterSpacing: '-2px' }}>
                R$ {total.toFixed(2)}
                </Typography>
            </motion.div>
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