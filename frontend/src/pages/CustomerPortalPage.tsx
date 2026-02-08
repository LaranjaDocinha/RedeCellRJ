import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  Tabs, 
  Tab, 
  Avatar, 
  Chip, 
  Divider, 
  IconButton, 
  Card, 
  CardContent,
  useTheme,
  Stack,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  History as HistoryIcon, 
  Person as PersonIcon, 
  Receipt as InvoiceIcon, 
  VerifiedUser as WarrantyIcon, 
  LocationOn as AddressIcon, 
  CreditCard as PaymentIcon, 
  NotificationsActive as AlertIcon,
  ShoppingBag as OrderIcon,
  Handyman as RepairIcon,
  Stars as LoyaltyIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerPortalPage: React.FC = () => {
  const theme = useTheme();
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [customerWarranties, setCustomerWarranties] = useState<any[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [customerPaymentMethods, setCustomerPaymentMethods] = useState<any[]>([]);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);

  const { token, user } = useAuth();

  const menuItems = [
    { label: 'Overview', icon: <LoyaltyIcon /> },
    { label: 'Histórico', icon: <HistoryIcon /> },
    { label: 'Dados Pessoais', icon: <PersonIcon /> },
    { label: 'Faturas', icon: <InvoiceIcon /> },
    { label: 'Garantias', icon: <WarrantyIcon /> },
    { label: 'Endereços', icon: <AddressIcon /> },
    { label: 'Pagamentos', icon: <PaymentIcon /> },
    { label: 'Notificações', icon: <AlertIcon /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        // Simulated or API Fetch
        setCustomerHistory({
          points: 1250,
          tier: 'Premium',
          nextTier: 2000,
          purchases: [
            { id: '102', date: new Date(), total: 3500.00, items: ['iPhone 15 Pro'], status: 'Entregue' },
            { id: '098', date: moment().subtract(1, 'month'), total: 150.00, items: ['Capa MagSafe'], status: 'Entregue' }
          ],
          repairs: [
            { id: 'OS-442', device: 'iPhone 13', date: moment().subtract(5, 'days'), status: 'Concluído', issue: 'Troca de Tela' }
          ]
        });
        setCustomerInvoices([{ id: 1, date: new Date(), amount: '3.500,00', status: 'Pago' }]);
        setCustomerWarranties([{ product: 'iPhone 15 Pro', endDate: moment().add(1, 'year'), status: 'Ativa' }]);
        setCustomerAddresses([{ id: 1, address_line1: 'Rua das Flores, 123', city: 'Rio de Janeiro', state: 'RJ', zip_code: '22000-000', is_default: true }]);
        setCustomerPaymentMethods([{ id: 1, card_type: 'Visa', last_four: '4242', is_default: true }]);
      } catch (error) {
        console.error('Error fetching customer portal data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header / User Profile Summary */}
      <Box sx={{ bgcolor: 'primary.main', pt: 6, pb: 12, color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={{ width: 100, height: 100, border: '4px solid rgba(255,255,255,0.2)', bgcolor: 'secondary.main' }}>
                  {user?.name?.[0] || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={400}>Olá, {user?.name || 'Cliente'}!</Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>ID Cliente: #12948 • Membro desde 2022</Typography>
                  <Stack direction="row" spacing={1} mt={1.5}>
                    <Chip label="CLIENTE PREMIUM" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 400 }} />
                    <Chip icon={<LoyaltyIcon sx={{ fontSize: '14px !important', color: 'gold !important' }} />} label={`${customerHistory?.points} Pontos`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 400 }} />
                  </Stack>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                <Typography variant="subtitle2" fontWeight={400} gutterBottom>Próximo Nível: GOLD</Typography>
                <LinearProgress variant="determinate" value={(customerHistory?.points / customerHistory?.nextTier) * 100} sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>Faltam 750 pontos</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, mb: 8 }}>
        <Grid container spacing={4}>
          {/* Sidebar Navigation */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, borderRadius: '24px', border: '1px solid', borderColor: 'divider', position: 'sticky', top: 20 }}>
              <List sx={{ p: 0 }}>
                {menuItems.map((item, idx) => (
                  <ListItemButton 
                    key={item.label} 
                    selected={value === idx} 
                    onClick={() => setValue(idx)}
                    sx={{ borderRadius: '12px', mb: 0.5, py: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: value === idx ? 'primary.main' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 400 }} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Content Area */}
          <Grid item xs={12} md={9}>
            <AnimatePresence mode="wait">
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider', minHeight: 500 }}>
                  
                  {value === 0 && (
                    <Box>
                      <Typography variant="h5" fontWeight={400} gutterBottom>Visão Geral</Typography>
                      <Grid container spacing={3} mt={1}>
                        <Grid item xs={12} sm={6}>
                          <Card elevation={0} sx={{ borderRadius: '20px', bgcolor: 'action.hover' }}>
                            <CardContent>
                              <Typography variant="overline" color="text.secondary" fontWeight={400}>Último Pedido</Typography>
                              <Typography variant="h6" fontWeight={400}>#102 - R$ 3.500,00</Typography>
                              <Chip label="ENTREGUE" size="small" color="success" sx={{ mt: 1, fontWeight: 400, height: 20, fontSize: '0.65rem' }} />
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Card elevation={0} sx={{ borderRadius: '20px', bgcolor: 'action.hover' }}>
                            <CardContent>
                              <Typography variant="overline" color="text.secondary" fontWeight={400}>Reparo Ativo</Typography>
                              <Typography variant="h6" fontWeight={400}>Nenhum reparo em andamento</Typography>
                              <Button size="small" variant="text" sx={{ mt: 1, textTransform: 'none', fontWeight: 400 }}>Solicitar Reparo</Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="subtitle1" fontWeight={400} sx={{ mt: 6, mb: 3 }}>Atividades Recentes</Typography>
                      <Stack spacing={2}>
                        {customerHistory?.purchases.map((p: any) => (
                          <Paper key={p.id} variant="outlined" sx={{ p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.light' }}><OrderIcon /></Avatar>
                            <Box flexGrow={1}>
                              <Typography variant="body2" fontWeight={400}>Compra de {p.items.join(', ')}</Typography>
                              <Typography variant="caption" color="text.secondary">{moment(p.date).format('LL')}</Typography>
                            </Box>
                            <Typography variant="subtitle2" fontWeight={400}>R$ {p.total.toFixed(2)}</Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {value === 1 && (
                    <Box>
                      <Typography variant="h5" fontWeight={400} gutterBottom>Histórico Completo</Typography>
                      <List>
                        {customerHistory?.repairs.map((r: any) => (
                          <ListItem key={r.id} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <ListItemIcon><RepairIcon color="primary" /></ListItemIcon>
                            <ListItemText primary={`Reparo ${r.id} - ${r.device}`} secondary={`${r.issue} • Concluído em ${moment(r.date).format('LL')}`} />
                            <Chip label="RECIBO" variant="outlined" size="small" sx={{ borderRadius: '6px' }} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {value === 2 && (
                    <Box>
                      <Typography variant="h5" fontWeight={400} gutterBottom>Minhas Faturas</Typography>
                      <Stack spacing={2} mt={3}>
                        {customerInvoices.map(inv => (
                          <Paper key={inv.id} variant="outlined" sx={{ p: 3, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography fontWeight={400}>Fatura #{inv.id}</Typography>
                              <Typography variant="caption" color="text.secondary">{moment(inv.date).format('LLL')}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={3}>
                              <Typography fontWeight={400}>R$ {inv.amount}</Typography>
                              <Chip label={inv.status} color="success" size="small" sx={{ fontWeight: 400 }} />
                              <IconButton size="small"><DownloadIcon /></IconButton>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {value === 3 && (
                    <Box>
                      <Typography variant="h5" fontWeight={400} gutterBottom>Garantias Ativas</Typography>
                      <Grid container spacing={3} mt={1}>
                        {customerWarranties.map((w, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
                              <CardContent>
                                <Typography variant="h6" fontWeight={400}>{w.product}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Expira em {moment(w.endDate).format('LL')}</Typography>
                                <Chip icon={<WarrantyIcon />} label="PROTEGIDO" color="primary" sx={{ fontWeight: 400 }} />
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {value === 5 && (
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <Typography variant="h5" fontWeight={400}>Meus Endereços</Typography>
                        <Button startIcon={<AddIcon />} variant="contained" sx={{ borderRadius: '10px' }}>Novo Endereço</Button>
                      </Box>
                      <Stack spacing={2}>
                        {customerAddresses.map(addr => (
                          <Paper key={addr.id} variant="outlined" sx={{ p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'action.hover', color: 'primary.main' }}><AddressIcon /></Avatar>
                            <Box flexGrow={1}>
                              <Typography variant="body2" fontWeight={400}>{addr.address_line1}</Typography>
                              <Typography variant="caption" color="text.secondary">{addr.city}, {addr.state} - {addr.zip_code}</Typography>
                            </Box>
                            {addr.is_default && <Chip label="PADRÃO" size="small" variant="outlined" sx={{ borderRadius: '6px', fontSize: '0.6rem' }} />}
                            <IconButton size="small"><EditIcon /></IconButton>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Other tabs can follow similar logic */}
                  {value > 5 && (
                    <Box textAlign="center" py={10}>
                      <SettingsIcon sx={{ fontSize: 64, color: 'divider', mb: 2 }} />
                      <Typography color="text.secondary">Esta seção está sendo sincronizada com o servidor.</Typography>
                    </Box>
                  )}

                </Paper>
              </motion.div>
            </AnimatePresence>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CustomerPortalPage;
