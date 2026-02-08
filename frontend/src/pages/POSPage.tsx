import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  FaWifi, FaShoppingCart, FaExchangeAlt, FaMoneyBillWave, FaMoneyBillAlt, 
  FaHistory, FaUser, FaWeight, FaCreditCard, FaSearch, FaThLarge, 
  FaDesktop, FaHandPointer, FaPrint, FaSync, FaMobileAlt, FaTimes, 
  FaCog, FaTools, FaSignOutAlt, FaInfoCircle, FaBirthdayCake, FaGripVertical
} from 'react-icons/fa';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useSound } from '../contexts/SoundContext';
import { useInactivityTracker } from '../contexts/InactivityTrackerContext';
import { 
  Typography, Box, Grid, TextField, Paper, Avatar, Divider, IconButton,
  Dialog, DialogContent, DialogTitle,
  Button as MuiButton, useTheme as useMuiTheme, InputAdornment, Stack
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
} from '@dnd-kit/sortable';

import { db } from '../db';
import {
  POSContainer,
  MainSection,
  CartSidebar,
  OperationToolbar,
  ButtonGroup,
  CartHeader,
  CartItemList,
  CartFooter,
  SummaryLine,
  ActionButton,
  QuickPickSection,
  POSLayout,
} from '../styles/POSStyles';

import CustomerManagementModal from '../components/POS/CustomerManagementModal';
import ZReportModal from '../components/POS/ZReportModal';
import SplitPaymentModal from '../components/POS/SplitPaymentModal';
import PrintCostCalculator from '../components/POS/PrintCostCalculator';
import { Part } from '../types/part';
import { Product } from '../types/product';
import { Category } from '../types/category';
import Fuse from 'fuse.js';
import axios from 'axios';
import { hardwareService } from '../services/hardwareService';
import { useSocket } from '../contexts/SocketContext';
import { BorderBeam } from '../components/ui/BorderBeam';

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

import { ThermalReceipt } from '../components/ui/ThermalPrintTemplate';
import { useReactToPrint } from 'react-to-print';
import { Magnetic } from '../components/ui/Magnetic';

const POSPage: React.FC = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { products: loadedProducts, categories: loadedCategories, customers: loadedCustomers } = useLoaderData() as { products: Product[], categories: Category[], customers: Customer[] };
  const { socket } = useSocket();
  const { addNotification } = useNotification();
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const { playSound } = useSound();
  const { lock } = useInactivityTracker();

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        syncOfflineSales();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('pix_paid', ({ transactionId }) => {
        addNotification(`Pagamento Pix confirmado! (TX: ${transactionId})`, 'success');
        playSound('checkoutSuccess');
        setIsSplitPaymentModalOpen(false);
        setCart([]);
        setSelectedCustomer(null);
    });
    return () => { socket.off('pix_paid'); };
  }, [socket, playSound, addNotification]);

  const syncOfflineSales = async () => {
    const offlineSales = await db.offlineSales.where('synced').equals(0).toArray();
    if (offlineSales.length > 0) {
        addNotification(`Sincronizando ${offlineSales.length} vendas offline...`, 'info');
        for (const sale of offlineSales) {
            try {
                await axios.post('/api/v1/sales', sale, { headers: { Authorization: `Bearer ${token}` } });
                await db.offlineSales.update(sale.id!, { synced: true });
            } catch (e) {
                console.error('Falha ao sincronizar venda', e);
            }
        }
        addNotification('Sincronização concluída!', 'success');
    }
  };

  const [lastSaleForPrint, setLastSaleForPrint] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  useEffect(() => {
    if (lastSaleForPrint) {
        handlePrint();
        setLastSaleForPrint(null);
    }
  }, [lastSaleForPrint, handlePrint]);

  // --- States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [manualDiscountAmount, setManualDiscountAmount] = useState(0);

  // Modals States
  const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [isPrintCalculatorOpen, setIsPrintCalculatorOpen] = useState(false);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Part | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- DnD Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allProducts = useMemo(() => {
      return (loadedProducts || []).map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: Number(p.variations?.[0]?.price || 0),
          stock_quantity: p.variations?.[0]?.stock_quantity || 0,
          image_url: p.variations?.[0]?.image_url,
          color: p.variations?.[0]?.color
      } as unknown as Part));
  }, [loadedProducts]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  const total = useMemo(() => Math.max(0, subtotal - appliedDiscount - manualDiscountAmount), [subtotal, appliedDiscount, manualDiscountAmount]);

  const logAudit = useCallback(async (action: string, details: any) => {
    try {
        await axios.post('/api/audit/log', { action, entityType: 'POS', details: { ...details, timestamp: new Date().toISOString() } }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { console.warn('Audit log failed', e); }
  }, [token]);

  const fuse = useMemo(() => new Fuse(allProducts, { keys: ['name', 'sku'], threshold: 0.3 }), [allProducts]);

  useEffect(() => {
    if (searchTerm.length >= 2) setSearchResults(fuse.search(searchTerm).map(r => r.item));
    else setSearchResults([]);
  }, [searchTerm, fuse]);

  const confirmAddToCart = (product: Part) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i);
      return [...prev, { ...product, id: Number(product.id), quantity: 1, subtotal: product.price, color: product.color || 'N/A' }];
    });
    playSound('addToCart');
    setIsProductDetailsModalOpen(false);
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Deseja cancelar a venda atual?')) {
      setCart([]); setSelectedCustomer(null); setAppliedDiscount(0); setManualDiscountAmount(0);
    }
  };

  const handleOpenDrawer = async () => {
      const success = await hardwareService.openCashDrawer();
      if (success) addNotification('Gaveta aberta.', 'info');
  };

  // --- Hotkeys ---
  useHotkeys('f1', (e) => { e.preventDefault(); searchInputRef.current?.focus(); });
  useHotkeys('f2', (e) => { e.preventDefault(); if (cart.length > 0) setIsSplitPaymentModalOpen(true); });
  useHotkeys('f3', (e) => { e.preventDefault(); setIsCustomerModalOpen(true); });
  useHotkeys('f4', (e) => { e.preventDefault(); clearCart(); });
  useHotkeys('f9', (e) => { e.preventDefault(); setIsZReportModalOpen(true); });
  useHotkeys('ctrl+l', (e) => { e.preventDefault(); lock(); });

  return (
    <POSContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <POSLayout>
        <MainSection>
            {/* ... (simplificação para o exemplo, manter o layout original no real) */}
            <Typography variant="h4">PDV RedecellRJ</Typography>
            <TextField 
                fullWidth 
                placeholder="Pesquisar Produto (F1)" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                inputRef={searchInputRef}
            />
        </MainSection>

        <CartSidebar>
          <CartHeader>
            <Typography variant="h6">Carrinho ({cart.length})</Typography>
            <IconButton onClick={clearCart} color="error"><FaTimes /></IconButton>
          </CartHeader>
          
          <CartItemList>
              {cart.map(item => (
                  <Box key={item.id} p={2} borderBottom={1} borderColor="divider">
                      <Typography>{item.name}</Typography>
                      <Typography variant="caption">{item.quantity}x R$ {item.price.toFixed(2)}</Typography>
                  </Box>
              ))}
          </CartItemList>

          <CartFooter>
            <SummaryLine>
                <Typography>Subtotal</Typography>
                <Typography>R$ {subtotal.toFixed(2)}</Typography>
            </SummaryLine>
            <SummaryLine>
                <Typography variant="h5" fontWeight={700}>TOTAL</Typography>
                <Typography variant="h5" fontWeight={700}>R$ {total.toFixed(2)}</Typography>
            </SummaryLine>

            <Stack spacing={2} mt={2}>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <MuiButton fullWidth variant="outlined" startIcon={<FaMoneyBillWave />} onClick={handleOpenDrawer}>Gaveta</MuiButton>
                    </Grid>
                    <Grid item xs={6}>
                        <MuiButton fullWidth variant="outlined" startIcon={<FaUser />} onClick={() => setIsCustomerModalOpen(true)}>Cliente</MuiButton>
                    </Grid>
                </Grid>

                <Box sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                    <BorderBeam $size={150} $duration={4} />
                    <Magnetic strength={0.2}>
                        <MuiButton 
                            fullWidth 
                            variant="contained" 
                            color="primary"
                            sx={{ height: 70, fontSize: '1.2rem', fontWeight: 600, borderRadius: '16px' }} 
                            onClick={() => setIsSplitPaymentModalOpen(true)}
                            disabled={cart.length === 0}
                        >
                            FINALIZAR VENDA (F2)
                        </MuiButton>
                    </Magnetic>
                </Box>
            </Stack>
          </CartFooter>
        </CartSidebar>
      </POSLayout>

      <CustomerManagementModal open={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onCustomerSelect={(c: any) => setSelectedCustomer(c)} />
      <SplitPaymentModal 
        open={isSplitPaymentModalOpen} 
        onClose={() => setIsSplitPaymentModalOpen(false)} 
        totalAmount={total} 
        availablePaymentMethods={['cash', 'credit_card', 'pix', 'store_credit']} 
        onConfirm={() => {}} 
      />
    </POSContainer>
  );
};

export default POSPage;