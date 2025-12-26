import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  FaWifi, FaShoppingCart, FaExchangeAlt, FaMoneyBillWave, FaMoneyBillAlt, 
  FaHistory, FaUser, FaWeight, FaCreditCard, FaSearch, FaThLarge, 
  FaDesktop, FaHandPointer, FaPrint, FaSync, FaMobileAlt, FaTimes, 
  FaCog, FaTools, FaSignOutAlt, FaInfoCircle, FaBirthdayCake, FaGripVertical
} from 'react-icons/fa';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { usePermissions } from '../contexts/PermissionContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { useSound } from '../contexts/SoundContext';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useInactivityTracker } from '../contexts/InactivityTrackerContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Typography, Box, DialogActions, Chip, Stack, Tooltip, Grid, 
  TextField, LinearProgress, Paper, Avatar, Divider, IconButton,
  List, ListItem, ListItemText, ListItemAvatar, Dialog, DialogContent, DialogTitle,
  Button as MuiButton, useTheme as useMuiTheme, InputAdornment
} from '@mui/material';

import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { db } from '../db';
import { CartItemType } from '../types/cart';
import {
  POSContainer,
  MainSection,
  CartSidebar,
  OperationToolbar,
  ButtonGroup,
  CompactSearchResult,
  CartHeader,
  CartItemList,
  CartFooter,
  SummaryLine,
  ActionButton,
  QuickPickSection,
  POSLayout,
  BirthdayAlert,
  HardwareStatus
} from '../styles/POSStyles';

import POSCartItem from '../components/POS/POSCartItem';
import CustomerManagementModal from '../components/POS/CustomerManagementModal';
import ZReportModal from '../components/POS/ZReportModal';
import SplitPaymentModal from '../components/POS/SplitPaymentModal';
import { fetchAllProducts } from '../services/productService';
import { Part } from '../types/part';
import Fuse from 'fuse.js';
import axios from 'axios';

// --- Interfaces ---
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cpf?: string;
  birth_date?: string;
  loyalty_points?: number;
  store_credit_balance?: number;
}

interface CartItemType extends Part {
  id: number;
  quantity: number;
  subtotal: number;
  salesperson_name?: string;
}

const POSPage: React.FC = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { addNotification } = useNotification();
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const { playSound } = useSound();
  const { lock } = useInactivityTracker();
  
  // --- States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  const [allProducts, setAllProducts] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [manualDiscountAmount, setManualDiscountAmount] = useState(0);
  const [peripherals, setPeripherals] = useState({ printer: true, scale: true, cardTerminal: true });

  // Modals States
  const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Part | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- DnD Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Promo Engine (Compre X, Leve Y) ---
  const promoDiscount = useMemo(() => {
    let disc = 0;
    // Promoção simplificada: Se houver 3+ itens no carrinho, ganha 5% do valor do primeiro item como desconto adicional
    if (cart.length >= 3) {
        disc = (cart[0].price * 0.05);
    }
    return disc;
  }, [cart]);

  // --- Calculations ---
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  const total = useMemo(() => Math.max(0, subtotal - appliedDiscount - manualDiscountAmount - promoDiscount), [subtotal, appliedDiscount, manualDiscountAmount, promoDiscount]);

  // --- Audit Logger ---
  const logAudit = useCallback(async (action: string, details: any) => {
    try {
        await axios.post('/api/audit/log', {
            action,
            entityType: 'POS',
            details: { ...details, timestamp: new Date().toISOString() }
        }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        console.warn('Audit log failed', e);
    }
  }, [token]);

  // --- Side Effects ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const { products } = await fetchAllProducts(token as string, undefined, undefined, 1, 1000);
        setAllProducts(products as unknown as Part[]);
      } catch (e) {
        addNotification('Erro ao carregar catálogo.', 'error');
      }
    };
    if (token) loadData();
  }, [token, addNotification]);

  const fuse = useMemo(() => new Fuse(allProducts, {
    keys: ['name', 'sku', 'barcode'],
    threshold: 0.3,
  }), [allProducts]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setSearchResults(fuse.search(searchTerm).map(r => r.item));
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, fuse]);

  // --- Actions ---
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCart((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const confirmAddToCart = (product: Part) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i);
      }
      return [...prev, { ...product, id: Number(product.id), quantity: 1, subtotal: product.price, color: product.color || 'N/A' }];
    });
    playSound('addToCart');
    setIsProductDetailsModalOpen(false);
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Deseja cancelar a venda atual?')) {
      setCart([]);
      setSelectedCustomer(null);
      setAppliedDiscount(0);
      setManualDiscountAmount(0);
    }
  };

  const handleUpdateSalesperson = (id: number) => {
      const name = prompt("Nome do Vendedor:");
      if (name) {
          setCart(prev => prev.map(i => i.id === id ? { ...i, salesperson_name: name } : i));
          addNotification('Vendedor atribuído ao item.', 'info');
      }
  };

  // --- Hotkeys ---
  useHotkeys('f1', (e) => { e.preventDefault(); searchInputRef.current?.focus(); });
  useHotkeys('f2', (e) => { e.preventDefault(); if (cart.length > 0) setIsSplitPaymentModalOpen(true); });
  useHotkeys('f3', (e) => { e.preventDefault(); setIsCustomerModalOpen(true); });

  return (
    <POSContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <POSLayout>
        {/* 1. BUSCA (ESQUERDA - 25%) */}
        <MainSection>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="overline" fontWeight={900} color="primary.main" sx={{ letterSpacing: 2 }}>
                PESQUISA (F1)
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Impressora"><Box><HardwareStatus $online={peripherals.printer} /></Box></Tooltip>
                    <Tooltip title="Balança"><Box><HardwareStatus $online={peripherals.scale} /></Box></Tooltip>
                    <Tooltip title="Cartão"><Box><HardwareStatus $online={peripherals.cardTerminal} /></Box></Tooltip>
                </Stack>
            </Stack>
            <TextField
              fullWidth
              inputRef={searchInputRef}
              placeholder="Digite o nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start"><FaSearch /></InputAdornment>,
                sx: { borderRadius: '12px', height: 45, bgcolor: 'background.paper' }
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
            {searchResults.length > 0 ? (
              <List sx={{ p: 0 }}>
                {searchResults.map(product => (
                  <CompactSearchResult key={product.id} onClick={() => {
                      if (product.price > 1500) addNotification(`Upsell: Sugerir Seguro para ${product.name}`, 'info');
                      setSelectedProductDetails(product);
                      setIsProductDetailsModalOpen(true);
                  }} whileHover={{ x: 5 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.85rem' }}>{product.name}</Typography>
                      <Typography variant="caption" color="text.secondary">SKU: {product.sku} • {product.stock_quantity} un.</Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={900} color="primary">R$ {product.price.toFixed(2)}</Typography>
                  </CompactSearchResult>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={10} sx={{ opacity: 0.3 }}>
                <FaSearch size={40} />
                <Typography variant="caption" display="block" mt={2}>Pesquise no catálogo...</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1.5} justifyContent="center">
                <Tooltip title="Sangria"><IconButton size="small"><FaMoneyBillWave /></IconButton></Tooltip>
                <Tooltip title="Suprimento"><IconButton size="small"><FaMoneyBillAlt /></IconButton></Tooltip>
                <Tooltip title="Relatório Z"><IconButton size="small" onClick={() => setIsZReportModalOpen(true)}><FaHistory /></IconButton></Tooltip>
                <Tooltip title="Bloquear (Ctrl+L)"><IconButton size="small" onClick={lock}><FaCog /></IconButton></Tooltip>
            </Stack>
          </Box>
        </MainSection>

        {/* 2. CARRINHO (DIREITA - 75%) */}
        <CartSidebar>
          <CartHeader>
            <Box display="flex" alignItems="center" gap={2}>
              <h2><FaShoppingCart color={muiTheme.palette.primary.main} /> {t('cart')}</h2>
              {selectedCustomer?.birth_date?.includes('12-21') && (
                  <BirthdayAlert initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                      <FaBirthdayCake /> ANIVERSARIANTE!
                  </BirthdayAlert>
              )}
              <MuiButton 
                variant="outlined" 
                size="small"
                startIcon={<FaUser />}
                onClick={() => setIsCustomerModalOpen(true)}
                sx={{ borderRadius: '10px', borderStyle: 'dashed', fontWeight: 700, textTransform: 'none' }}
              >
                {selectedCustomer ? selectedCustomer.name : 'VINCULAR CLIENTE (F3)'}
              </MuiButton>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
               <Chip label={`${cart.length} ITENS`} sx={{ fontWeight: 900, bgcolor: 'primary.main', color: 'white' }} />
               <MuiButton variant="text" color="error" onClick={clearCart} sx={{ fontWeight: 800 }}>LIMPAR TUDO</MuiButton>
            </Box>
          </CartHeader>

          <CartItemList>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={cart.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence mode="popLayout">
                  {cart.length === 0 ? (
                    <Box key="empty" textAlign="center" py={20} sx={{ opacity: 0.1 }}>
                      <FaShoppingCart size={150} />
                      <Typography variant="h3" fontWeight={900}>Terminal Pronto</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {cart.map((item) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
                          <POSCartItem 
                            item={item} 
                            onUpdateQuantity={(id, q) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, q), subtotal: Math.max(0, q) * i.price } : i))}
                            onRemove={() => {
                                setCart(prev => prev.filter(i => i.id !== item.id));
                                playSound('removeFromCart');
                            }}
                            onUpdateSalesperson={handleUpdateSalesperson}
                            onUpdateNotes={() => {}}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          </CartItemList>

          <CartFooter>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}>
              <Box sx={{ flexGrow: 1 }}>
                <SummaryLine>
                  <span>Subtotal da Venda</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </SummaryLine>
                {promoDiscount > 0 && (
                    <SummaryLine>
                        <span style={{ color: muiTheme.palette.success.main }}>Promoções Aplicadas</span>
                        <span style={{ color: muiTheme.palette.success.main }}>- R$ {promoDiscount.toFixed(2)}</span>
                    </SummaryLine>
                )}
                <SummaryLine $total>
                  <span>Total Líquido</span>
                  <span>R$ {total.toFixed(2)}</span>
                </SummaryLine>
              </Box>

              <Box sx={{ width: '50%' }}>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12 }}>
                    <ActionButton 
                      $variant="primary" 
                      onClick={() => setIsSplitPaymentModalOpen(true)}
                      disabled={cart.length === 0}
                      sx={{ height: 70 }}
                    >
                      <FaCreditCard size={24} /> FINALIZAR E RECEBER (F2)
                    </ActionButton>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <ActionButton $variant="outline" sx={{ height: 50, fontSize: '0.85rem' }} onClick={() => addNotification('Em breve: Uso de Crédito de Loja', 'info')}>
                      Usar Crédito
                    </ActionButton>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <ActionButton $variant="outline" sx={{ height: 50, fontSize: '0.85rem' }} onClick={() => addNotification('Em breve: Resgate de Pontos', 'info')}>
                      Resgatar Pontos
                    </ActionButton>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </CartFooter>
        </CartSidebar>
      </POSLayout>

      {/* MODALS */}
      <Dialog open={isProductDetailsModalOpen} onClose={() => setIsProductDetailsModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        {selectedProductDetails && (
          <>
            <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Detalhes do Produto
              <IconButton onClick={() => setIsProductDetailsModalOpen(false)}><FaTimes /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Box textAlign="center" mb={3}>
                <Avatar variant="rounded" src={selectedProductDetails.image_url} sx={{ width: 200, height: 200, margin: '0 auto', borderRadius: '20px', bgcolor: 'action.hover' }}>
                  <FaShoppingCart fontSize={60} />
                </Avatar>
              </Box>
              <Typography variant="h5" fontWeight={900} gutterBottom>{selectedProductDetails.name}</Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover', mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>SKU</Typography>
                    <Typography variant="body1" fontWeight={800}>{selectedProductDetails.sku}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>ESTOQUE</Typography>
                    <Typography variant="body1" fontWeight={800} color="primary">{selectedProductDetails.stock_quantity} un.</Typography>
                  </Grid>
                </Grid>
              </Paper>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight={900} color="primary">R$ {selectedProductDetails.price.toFixed(2)}</Typography>
                <MuiButton variant="contained" size="large" onClick={() => confirmAddToCart(selectedProductDetails)} sx={{ borderRadius: '12px', px: 4, fontWeight: 800 }}>ADICIONAR</MuiButton>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      <CustomerManagementModal open={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onCustomerSelect={(c: any) => setSelectedCustomer(c)} />
      <SplitPaymentModal 
        open={isSplitPaymentModalOpen} 
        onClose={() => setIsSplitPaymentModalOpen(false)} 
        totalAmount={total} 
        availablePaymentMethods={['cash', 'credit_card', 'pix', 'store_credit']} 
        onConfirm={async (payments) => { 
            await logAudit('SALE_COMPLETED', { total, payments, customerId: selectedCustomer?.id });
            setCart([]); 
            setSelectedCustomer(null); 
            setIsSplitPaymentModalOpen(false); 
            addNotification('Venda finalizada!', 'success'); 
        }} 
      />
      <ZReportModal open={isZReportModalOpen} onClose={() => setIsZReportModalOpen(false)} />
    </POSContainer>
  );
};

export default POSPage;
