import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Stack, 
  alpha, 
  useTheme,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot, 
  TimelineOppositeContent 
} from '@mui/lab';
import { 
  FaBox, 
  FaTruck, 
  FaHome, 
  FaCheckCircle, 
  FaSearch, 
  FaMapMarkerAlt,
  FaCube,
  FaBarcode,
  FaMapMarkedAlt,
  FaBell,
  FaPhone
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const trackingSteps = [
    { status: 'Pedido Realizado', date: '2025-12-20T10:30:00', icon: <FaCheckCircle />, color: 'success', active: true, description: 'Seu pedido foi recebido em nosso sistema.' },
    { status: 'Pagamento Aprovado', date: '2025-12-20T10:32:00', icon: <FaCheckCircle />, color: 'success', active: true, description: 'Confirmamos o recebimento do seu pagamento.' },
    { status: 'Em Separação', date: '2025-12-21T09:00:00', icon: <FaCube />, color: 'success', active: true, description: 'Estamos preparando seus itens com cuidado.' },
    { status: 'Enviado para a Transportadora', date: '2025-12-22T18:00:00', icon: <FaTruck />, color: 'primary', active: true, description: 'O pacote foi coletado pelo parceiro logístico.' },
    { status: 'Saiu para Entrega', date: '2025-12-23T08:00:00', icon: <FaMapMarkerAlt />, color: 'primary', active: true, description: 'O motorista está a caminho do seu endereço.' },
    { status: 'Entregue', date: null, icon: <FaHome />, color: 'grey', active: false, description: 'Aguardando confirmação de entrega no local.' },
];

const OrderTrackingPage: React.FC = () => {
  const theme = useTheme();
  const [trackingId, setTrackingId] = useState('#RD-12509');

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <Box sx={{ textAlign: 'center', mb: 8, mt: 4 }}>
        <Typography variant="h3" fontWeight={400} gutterBottom sx={{ letterSpacing: '-1.5px' }}>
            Acompanhe seu Pedido
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
            Fique por dentro de cada passo da entrega em tempo real.
        </Typography>
        
        <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
            <Paper sx={{ p: 1, borderRadius: '20px', boxShadow: theme.shadows[10], border: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 1 }}>
                <TextField 
                    fullWidth
                    placeholder="Nº do Pedido ou Código de Rastreio"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: <InputAdornment position="start" sx={{ ml: 2 }}><FaBarcode color={theme.palette.primary.main} /></InputAdornment>,
                        sx: { height: 56, fontSize: '1.1rem', fontWeight: 400 }
                    }}
                />
                <Button variant="contained" sx={{ borderRadius: '14px', px: 4, fontWeight: 400 }}>
                    BUSCAR
                </Button>
            </Paper>
        </Box>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} lg={10}>
            {/* 7.1 Mapa Real-time Placeholder & 7.5 ETA */}
            <Paper sx={{ mb: 4, borderRadius: '32px', height: 350, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                <FaMapMarkedAlt size={80} style={{ opacity: 0.05 }} />
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle, transparent 20%, ${alpha(theme.palette.background.paper, 0.4)} 100%)` }} />
                
                <Box sx={{ position: 'absolute', top: 30, left: 30 }}>
                    <Chip icon={<FaBell />} label="LIVE UPDATES ON" color="success" sx={{ fontWeight: 400, fontSize: '0.6rem' }} />
                </Box>

                <Box sx={{ position: 'absolute', bottom: 30, right: 30, bgcolor: 'background.paper', p: 3, borderRadius: '24px', boxShadow: theme.shadows[10], minWidth: 200, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" fontWeight={400} color="primary" sx={{ letterSpacing: 1 }}>CHEGADA ESTIMADA</Typography>
                    <Typography variant="h4" fontWeight={400}>14:45</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }} src="https://placehold.co/100" />
                        <Box>
                            <Typography variant="caption" display="block" fontWeight={400}>ENTREGADOR</Typography>
                            <Typography variant="body2" fontWeight={400}>Ricardo M.</Typography>
                        </Box>
                        <IconButton size="small" color="primary" sx={{ ml: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.1) }}><FaPhone size={12} /></IconButton>
                    </Stack>
                </Box>
            </Paper>

            <Card sx={{ borderRadius: '32px', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 6 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={6} spacing={2}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={400} sx={{ letterSpacing: 1 }}>STATUS DO PEDIDO</Typography>
                            <Typography variant="h4" fontWeight={400} color="primary.main">A caminho do destino</Typography>
                        </Box>
                        <Box sx={{ textAlign: { md: 'right' } }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={400} sx={{ letterSpacing: 1 }}>PREVISÃO DE ENTREGA</Typography>
                            <Typography variant="h5" fontWeight={400}>24 de Dezembro, 2025</Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 6, borderStyle: 'dashed' }} />

                    <Timeline position="alternate">
                        {trackingSteps.map((step, index) => (
                            <TimelineItem key={index}>
                                <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
                                    {step.date ? moment(step.date).format('DD MMM, HH:mm') : '---'}
                                </TimelineOppositeContent>
                                <TimelineSeparator>
                                    <TimelineConnector sx={{ bgcolor: step.active ? theme.palette.success.main : 'divider' }} />
                                    <TimelineDot 
                                        sx={{ 
                                            p: 1.5, 
                                            bgcolor: step.active ? alpha(theme.palette.success.main, 0.1) : 'action.hover',
                                            color: step.active ? theme.palette.success.main : 'text.disabled',
                                            boxShadow: 'none',
                                            border: `2px solid ${step.active ? theme.palette.success.main : theme.palette.divider}`
                                        }}
                                    >
                                        {step.icon}
                                    </TimelineDot>
                                    <TimelineConnector sx={{ bgcolor: step.active && trackingSteps[index+1]?.active ? theme.palette.success.main : 'divider' }} />
                                </TimelineSeparator>
                                <TimelineContent sx={{ py: '12px', px: 2 }}>
                                    <motion.div initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }}>
                                        <Typography variant="h6" fontWeight={400} component="span" sx={{ color: step.active ? 'text.primary' : 'text.disabled' }}>
                                            {step.status}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {step.description}
                                        </Typography>
                                    </motion.div>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </CardContent>
                
                <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary">
                        Dúvidas sobre sua entrega? <Button variant="text" sx={{ fontWeight: 400 }}>Fale com nosso suporte</Button>
                    </Typography>
                </Box>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderTrackingPage;
