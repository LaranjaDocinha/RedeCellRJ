import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FaWifi, FaShoppingCart, FaSun, FaMoon, FaGripVertical, FaQuestionCircle, FaVolumeUp, FaVolumeMute, FaExchangeAlt, FaMoneyBillWave, FaMoneyBillAlt, FaHistory, FaUser, FaExpand, FaCompress, FaWeight, FaCreditCard } from 'react-icons/fa'; // Added FaWeight, FaCreditCard
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // Fixed import syntax
import { AnimatePresence, useAnimation } from 'framer-motion';
import { usePermissions } from '../contexts/PermissionContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSound } from '../contexts/SoundContext';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'; // Import Hook
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { db } from '../db';
import { sendOfflineRequest, syncOfflineRequests } from '../utils/offlineApi';

import {
  POSContainer,
  POSHeader,
  HeaderActions,
  StatusIndicator,
  POSLayout,
  ProductSection,
  SearchWrapper,
  CartSection,
  CartHeader,
  CartItemsList,
  CartSummary,
  CouponWrapper,
  TotalLine,
  CheckoutButton,
  EmptyCart,
  ThemeToggleButton,
  DragHandle,
} from '../styles/POSStyles';

import Input from '../components/Input';
import { Button } from '../components/Button';
import POSCartItem from '../components/POS/POSCartItem';
import Customer360View from '../components/POS/Customer360View';
import PaymentMethodSelector from '../components/POS/PaymentMethodSelector';
import CustomerManagementModal from '../components/POS/CustomerManagementModal';
import ShiftDashboard from '../components/POS/ShiftDashboard';
import ZReportModal from '../components/POS/ZReportModal';
import SalesGoalWidget from '../components/POS/SalesGoalWidget';
import SplitPaymentModal from '../components/POS/SplitPaymentModal';
import PostSaleActionsModal from '../components/POS/PostSaleActionsModal';
import AnimatedCounter from '../components/AnimatedCounter';
import { Modal } from '../components/Modal';

import { posTourSteps } from '../config/posTourSteps';
import SerialInputModal from '../components/POS/SerialInputModal';
import { Part } from '../types/part';
import { fetchAllProducts } from '../services/productService';
import ProductGrid from '../components/ProductCatalog/ProductGrid';
import axios from 'axios';
import Joyride from 'react-joyride';
import RecommendationWidget from '../components/POS/RecommendationWidget'; // Added Import

// Interfaces
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cpf?: string;
}

interface CartItemType extends Part {
  quantity: number;
  subtotal: number;
  serial_numbers?: string[];
}

type LayoutComponentId = 'products' | 'cart';

// Sortable Component Wrapper
const SortableComponent = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(children as React.ReactElement, { listeners })}
    </div>
  );
};


const POSPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [manualDiscountInput, setManualDiscountInput] = useState('');
  const [manualDiscountAmount, setManualDiscountAmount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOfflineSales, setPendingOfflineSales] = useState(0);
  const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState(false);
  const [isHeldSalesModalOpen, setHeldSalesModalOpen] = useState(false);
  const [isReturnModalOpen, setReturnModalOpen] = useState(false);
  const [isSangriaModalOpen, setSangriaModalOpen] = useState(false);
  const [isSuprimentoModalOpen, setSuprimentoModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false); // Renamed to match usage
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPostSaleActionsModalOpen, setIsPostSaleActionsModalOpen] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [runTour, setRunTour] = useState(false);
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [productToAddSerial, setProductToAddSerial] = useState<Part | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [scaleReading, setScaleReading] = useState<number | null>(null);
  const [isTefModalOpen, setIsTefModalOpen] = useState(false);
  const [tefResult, setTefResult] = useState<any>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false); // Adicionado isCheckoutModalOpen



  // Fetch customer 360 view data
  const { data: customer360Data, refetch: refetchCustomer360Data } = useQuery<Customer360ViewData, Error>(
    ['customer360View', selectedCustomer?.id],
    async () => {
      if (!selectedCustomer?.id) throw new Error('No customer selected');
      const response = await axios.get(`/api/customers/${selectedCustomer.id}/360view`);
      return response.data;
    },
    {
      enabled: !!selectedCustomer?.id,
      staleTime: 5 * 60 * 1000,
    }
  );
  const [tourStep, setTourStep] = useState(0);
  const [allProducts, setAllProducts] = useState<Part[]>([]);

  const { addNotification } = useNotification();
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { isSoundEnabled, toggleSound } = useSound();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const checkoutButtonControls = useAnimation();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const hasTakenTour = localStorage.getItem('hasTakenPosTour');
    if (!hasTakenTour) {
      setRunTour(true);
      localStorage.setItem('hasTakenPosTour', 'true');
    }
  }, []);

  useEffect(() => {
    const fetchAllProductsData = async () => {
      try {
        const { products } = await fetchAllProducts(token as string);
        setAllProducts(products);
      } catch (error: any) {
        addNotification(t('failed_to_load_products', { message: error.message }), 'error');
      }
    };
    fetchAllProductsData();
  }, [addNotification, t, token]);

  // --- Cart Logic (Hoisted for use in Barcode) ---
  const confirmAddToCart = async (productToAdd: Part, serials?: string[]) => {
    const previousCart = cart;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productToAdd.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productToAdd.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
                serial_numbers: serials ? [...(item.serial_numbers || []), ...serials] : item.serial_numbers
              }
            : item
        );
      }
      return [...prevCart, { ...productToAdd, quantity: 1, subtotal: productToAdd.price, serial_numbers: serials }];
    });
    addNotification(t('added_to_cart', { productName: productToAdd.name }), 'success');
  };

  const addToCart = async (productToAdd: Part) => {
    if (productToAdd.is_serialized) {
      setProductToAddSerial(productToAdd);
      setIsSerialModalOpen(true);
      return;
    }
    confirmAddToCart(productToAdd);
  };

  // --- Barcode Scanner Hook ---
  const { isScanning } = useBarcodeScanner({
    onBarcodeScanned: async (barcode) => {
      try {
        const { products } = await fetchAllProducts(token as string, barcode, undefined, 1, 1);
        if (products.length > 0) {
          addToCart(products[0]);
          addNotification(t('product_added_by_barcode', { productName: products[0].name }), 'success');
        } else {
          addNotification(t('product_not_found_barcode', { barcode }), 'warning');
        }
      } catch (error: any) {
        addNotification(t('barcode_scan_failed', { message: error.message }), 'error');
      }
    },
    // Don't scan if a modal is open
    isScanActive: () => !isSplitPaymentModalOpen && !isHeldSalesModalOpen && !isCustomerModalOpen && !isSerialModalOpen
  });

  // --- Hotkeys ---
  const isCheckoutDisabled = cart.length === 0;

  const handleCheckout = useCallback(() => {
    if (isCheckoutDisabled) {
      addNotification(t('cart_is_empty'), 'warning');
      return;
    }
    setIsSplitPaymentModalOpen(true);
  }, [isCheckoutDisabled, addNotification, t]);

  const clearCart = () => {
    setCart([]);
    addNotification(t('cart_cleared'), 'info');
  };

  // Keyboard Shortcuts Map
  useHotkeys('f1', (e) => { e.preventDefault(); searchInputRef.current?.focus(); });
  useHotkeys('f2', (e) => { e.preventDefault(); handleCheckout(); });
  useHotkeys('f3', (e) => { e.preventDefault(); setIsCustomerModalOpen(true); });
  useHotkeys('f4', (e) => { e.preventDefault(); navigate('/pos/sales-history'); });
  useHotkeys('f5', (e) => { e.preventDefault(); holdSale(); });
  useHotkeys('esc', () => setSearchTerm(''), { enableOnTags: ['INPUT'] });
  useHotkeys('ctrl+delete', (e) => { e.preventDefault(); clearCart(); });
  useHotkeys('f6', (e) => { e.preventDefault(); handleReadScale(); }); // Hotkey for Scale
  useHotkeys('f7', (e) => { e.preventDefault(); handleProcessTef(total, 'credit'); }); // Hotkey for TEF, assumes credit for simplicity


  // --- Draggable Layout State ---
  const [layoutComponents, setLayoutComponents] = useState<LayoutComponentId[]>(() => {
    const savedLayout = localStorage.getItem('posLayout');
    if (savedLayout) {
      const parsed = JSON.parse(savedLayout);
      if (Array.isArray(parsed) && parsed.every(item => ['products', 'cart'].includes(item))) {
        return parsed;
      }
    }
    return ['products', 'cart', 'customer360', 'shiftDashboard', 'salesGoalWidget'];
  });

  useEffect(() => {
    localStorage.setItem('posLayout', JSON.stringify(layoutComponents));
  }, [layoutComponents]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLayoutComponents((items) => {
        const oldIndex = items.indexOf(active.id as LayoutComponentId);
        const newIndex = items.indexOf(over.id as LayoutComponentId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- Effects ---
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      addNotification(t('connection_restored'), 'success');
      await syncOfflineRequests('offlineSales');
      updatePendingSalesCount();
    };
    const handleOffline = () => {
      setIsOnline(false);
      addNotification(t('connection_lost'), 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updatePendingSalesCount();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const { products } = await fetchAllProducts(token as string, searchTerm);
        setSearchResults(products);
      } catch (error: any) {
        addNotification(t('search_failed', { message: error.message }), 'error');
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, addNotification, t, token]);

  // --- Data & DB ---
  const updatePendingSalesCount = async () => {
    const count = await db.offlineSales.where('synced').equals(0).count();
    setPendingOfflineSales(count);
  };

  // --- Hardware Integration Functions ---
  const handleReadScale = async () => {
    try {
      addNotification(t('reading_scale'), 'info');
      const response = await axios.get('/api/hardware/scale/read');
      setScaleReading(response.data.weight);
      setIsScaleModalOpen(true);
      addNotification(t('scale_read_success', { weight: response.data.weight }), 'success');
    } catch (error: any) {
      addNotification(t('failed_to_read_scale', { message: error.message }), 'error');
    }
  };

  const handleProcessTef = async (amount: number, paymentType: 'credit' | 'debit') => {
    try {
      addNotification(t('processing_tef'), 'info');
      const response = await axios.post('/api/hardware/tef/process', { amount, paymentType });
      setTefResult(response.data);
      setIsTefModalOpen(true);
      if (response.data.success) {
        addNotification(t('tef_success', { transactionId: response.data.transactionId }), 'success');
      } else {
        addNotification(t('tef_failed', { message: response.data.message }), 'error');
      }
    } catch (error: any) {
      addNotification(t('failed_to_process_tef', { message: error.message }), 'error');
    }
  };

  // --- Cart Functions ---
  const updateCartItemQuantity = async (productId: number, newQuantity: number) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.id !== productId);
      } else {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
            : item
        );
      }
    });
  };

  // --- Hold Sale Logic ---
  const [heldSales, setHeldSales] = useState<CartItemType[][]>([]);

  useEffect(() => {
    try {
      const storedHeldSales = window.localStorage.getItem('heldSales');
      if (storedHeldSales) {
        setHeldSales(JSON.parse(storedHeldSales));
      }
    } catch (error) {
      console.error('Error loading held sales from localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('heldSales', JSON.stringify(heldSales));
    } catch (error) {
      console.error('Error saving held sales to localStorage', error);
    }
  }, [heldSales]);

  const holdSale = () => {
    if (cart.length === 0) {
      addNotification(t('cart_is_empty'), 'warning');
      return;
    }
    setHeldSales((prevHeldSales) => [...prevHeldSales, cart]);
    clearCart();
    addNotification(t('sale_held_success'), 'success');
  };

  const resumeSale = (index: number) => {
    setCart(heldSales[index]);
    setHeldSales((prevHeldSales) => prevHeldSales.filter((_, i) => i !== index));
    addNotification(t('sale_resumed_success'), 'success');
  };

  const removeHeldSale = (index: number) => {
    setHeldSales((prevHeldSales) => prevHeldSales.filter((_, i) => i !== index));
    addNotification(t('sale_removed_success'), 'info');
  };

  const total = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    return (subtotal - appliedDiscount - manualDiscountAmount);
  }, [cart, appliedDiscount, manualDiscountAmount]);

  const loyaltyPointsEarned = useMemo(() => {
    const pointsRate = 10;
    return Math.floor(total / pointsRate);
  }, [total]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const subtotalBeforeDiscount = cart.reduce((sum, item) => sum + item.subtotal, 0);
      const response = await axios.post('/api/coupons/apply', {
        code: couponCode,
        currentAmount: subtotalBeforeDiscount,
      });
      const { finalAmount } = response.data;
      const discountAmount = subtotalBeforeDiscount - finalAmount;

      setAppliedDiscount(discountAmount);
      addNotification(t('coupon_applied', { discount: discountAmount.toFixed(2) }), 'success');
    } catch (error: any) {
      addNotification(t('failed_to_apply_coupon', { message: error.response?.data?.message || error.message }), 'error');
      setAppliedDiscount(0);
    }
  };

  const handleApplyManualDiscount = () => {
    const discount = parseFloat(manualDiscountInput);
    if (isNaN(discount) || discount < 0) {
      addNotification(t('invalid_discount_amount'), 'error');
      setManualDiscountAmount(0);
      return;
    }
    setManualDiscountAmount(discount);
    addNotification(t('manual_discount_applied', { discount: discount.toFixed(2) }), 'success');
  };

  const prevCheckoutDisabled = useRef(isCheckoutDisabled);

  useEffect(() => {
    if (prevCheckoutDisabled.current && !isCheckoutDisabled) {
      checkoutButtonControls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.4, times: [0, 0.5, 1] }
      });
    }
    prevCheckoutDisabled.current = isCheckoutDisabled;
  }, [isCheckoutDisabled, checkoutButtonControls]);

  const toggleHighContrastMode = () => {
    setHighContrastMode(prev => !prev);
  };

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }
  };
  
  // Modals for hardware integration
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false); // Declare this state if not already present, for isScanActive prop

  const componentsMap = {
    products: ({ listeners }: { listeners?: any }) => (
      <ProductSection>
        <SearchWrapper>
          <DragHandle {...listeners}><FaGripVertical /></DragHandle>
          <Input
            id="pos-product-search"
            ref={searchInputRef}
            placeholder={t('search_product_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchWrapper>
        {searchTerm ? (
          <ProductGrid products={searchResults} onProductClick={addToCart} />
        ) : (
          <ProductGrid products={allProducts} onProductClick={addToCart} />
        )}
      </ProductSection>
    ),
    cart: ({ listeners }: { listeners?: any }) => (
      <CartSection id="pos-cart-section">
        <CartHeader>
          <DragHandle {...listeners}><FaGripVertical /></DragHandle>
          {t('cart')}
        </CartHeader>
        <CartItemsList>
          <AnimatePresence>
            {cart.length === 0 ? (
              <EmptyCart>
                <FaShoppingCart />
                <p>{t('cart_is_empty')}</p>
              </EmptyCart>
            ) : (
              cart.map((item) => (
                <POSCartItem key={item.id} item={item} onUpdateQuantity={updateCartItemQuantity} onRemove={() => updateCartItemQuantity(item.id, 0)} />
              ))
            )}
          </AnimatePresence>
        </CartItemsList>
        <RecommendationWidget cartItemIds={cart.map((item) => item.id)} onAddProduct={addToCart} />
        <CartSummary id="pos-checkout-area">
          <CouponWrapper>
            <Input
              placeholder={t('coupon_code_placeholder')}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button label={t('apply_coupon')} onClick={handleApplyCoupon} size="small" />
            {appliedDiscount > 0 && (
              <Button
                label={t('remove_coupon')}
                onClick={() => { setAppliedDiscount(0); setCouponCode(''); }}
                size="small"
                variant="outlined"
                style={{ marginLeft: '10px' }}
              />
            )}
          </CouponWrapper>

          <CouponWrapper style={{ marginTop: '10px' }}>
            <Input
              placeholder={t('manual_discount_placeholder')}
              value={manualDiscountInput}
              onChange={(e) => setManualDiscountInput(e.target.value)}
              type="number"
            />
            <Button label={t('apply_discount')} onClick={handleApplyManualDiscount} size="small" />
            {manualDiscountAmount > 0 && (
              <Button
                label={t('remove_discount')}
                onClick={() => { setManualDiscountAmount(0); setManualDiscountInput(''); }}
                size="small"
                variant="outlined"
                style={{ marginLeft: '10px' }}
              />
            )}
          </CouponWrapper>
          
          <Button 
            label={t('check_promotions')} 
            onClick={async () => {
              try {
                const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
                const response = await axios.post('/api/discounts/best-match', { amount: subtotal });
                
                if (response.data && response.data.discount) {
                  setAppliedDiscount(response.data.savings);
                  setCouponCode(response.data.discount.name); 
                  addNotification(t('best_discount_applied', { name: response.data.discount.name, savings: response.data.savings.toFixed(2) }), 'success');
                } else {
                  addNotification(t('no_better_discount_found'), 'info');
                }
              } catch (error: any) {
                 addNotification(t('check_promotions_failed'), 'error');
              }
            }}
            size="small" 
            variant="outlined" 
            style={{ marginTop: '10px', width: '100%', borderColor: '#4caf50', color: '#4caf50' }} 
          />

          <TotalLine>
            <span>{t('total')}:</span>
            <AnimatedCounter value={total} />
          </TotalLine>
          {selectedCustomer && loyaltyPointsEarned > 0 && (
            <TotalLine>
              <span>{t('points_earned')}:</span>
              <span>{loyaltyPointsEarned}</span>
            </TotalLine>
          )}
          <CheckoutButton
            onClick={handleCheckout}
            disabled={isCheckoutDisabled}
            animate={checkoutButtonControls}
          >
            {t('checkout')}
          </CheckoutButton>
          <Button label={t('clear_cart')} onClick={clearCart} variant="outlined" style={{ marginTop: '10px' }} />
          <Button label={t('hold_sale')} onClick={holdSale} variant="outlined" style={{ marginTop: '10px', marginLeft: '10px' }} />
        </CartSummary>
      </CartSection>
    ),
    customer360: ({ listeners }: { listeners?: any }) => (
      <ProductSection>
        <SearchWrapper>
          <DragHandle {...listeners}><FaGripVertical /></DragHandle>
          <Typography variant="h6">{t('customer_360_view')}</Typography>
        </SearchWrapper>
        {selectedCustomer ? (
          <Customer360View customerId={selectedCustomer.id} />
        ) : (
          <Typography sx={{ p: 2 }}>{t('select_customer_to_view_360')}</Typography>
        )}
      </ProductSection>
    ),
    shiftDashboard: ({ listeners }: { listeners?: any }) => (
      <ShiftDashboard listeners={listeners} />
    ),
    salesGoalWidget: ({ listeners }: { listeners?: any }) => (
      <SalesGoalWidget listeners={listeners} />
    ),
  };

  return (
    <React.Fragment>
      <Joyride
      steps={posTourSteps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      locale={{ last: t('end_tour') }}
      callback={handleJoyrideCallback}
    />
    <POSContainer>
        <POSHeader>
          <h1>{t('point_of_sale')}</h1>
          <HeaderActions>
            <ThemeToggleButton onClick={toggleSound} aria-label={t('toggle_sound_accessibility')}>
              {isSoundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </ThemeToggleButton>
            <StatusIndicator>
              {isOnline ? <FaWifi color="green" aria-label={t('online_status')} /> : <FaWifi color="red" aria-label={t('offline_status')} />}
              {pendingOfflineSales > 0 && `(${pendingOfflineSales} ${t('pending_sales')})`}
            </StatusIndicator>
            <ThemeToggleButton onClick={() => setRunTour(true)} aria-label={t('start_tour_accessibility')}>
              <FaQuestionCircle />
            </ThemeToggleButton>
            <ThemeToggleButton onClick={toggleHighContrastMode} aria-label={t('toggle_high_contrast_accessibility')}>
              {highContrastMode ? <FaMoon /> : <FaSun />}
            </ThemeToggleButton>
            <ThemeToggleButton onClick={() => setIsZenMode(prev => !prev)} aria-label={t('toggle_zen_mode')}>
              {isZenMode ? <FaCompress /> : <FaExpand />}
            </ThemeToggleButton>
            {/* New Hardware Integration Buttons */}
            <Button label={t('read_scale')} onClick={handleReadScale} size="small" style={{ marginLeft: '10px' }}>
              <FaWeight style={{ marginRight: '5px' }} /> {t('read_scale')}
            </Button>
            <Button label={t('process_tef')} onClick={() => handleProcessTef(total, 'credit')} size="small" style={{ marginLeft: '10px' }} disabled={isCheckoutDisabled}>
              <FaCreditCard style={{ marginRight: '5px' }} /> {t('process_tef')}
            </Button>
            <Button label={t('held_sales')} onClick={() => setHeldSalesModalOpen(true)} size="small" style={{ marginLeft: '10px' }} />
            <Button label={t('return_exchange')} onClick={() => setReturnModalOpen(true)} size="small" style={{ marginLeft: '10px' }}>
              <FaExchangeAlt style={{ marginRight: '5px' }} /> {t('return_exchange')}
            </Button>
            <Button label={t('cash_out')} onClick={() => setSangriaModalOpen(true)} size="small" style={{ marginLeft: '10px' }}>
              <FaMoneyBillWave style={{ marginRight: '5px' }} /> {t('cash_out')}
            </Button>
            <Button label={t('cash_in')} onClick={() => setSuprimentoModalOpen(true)} size="small" style={{ marginLeft: '10px' }}>
              <FaMoneyBillAlt style={{ marginRight: '5px' }} /> {t('cash_in')}
            </Button>
            <Button label={t('sales_history')} onClick={() => navigate('/pos/sales-history')} size="small" style={{ marginLeft: '10px' }}>
              <FaHistory style={{ marginRight: '5px' }} /> {t('sales_history')}
            </Button>
            <Button label={t('customer')} onClick={() => setIsCustomerModalOpen(true)} size="small" style={{ marginLeft: '10px' }}>
              <FaUser style={{ marginRight: '5px' }} /> {selectedCustomer ? selectedCustomer.name : t('select_customer')}
            </Button>
            {hasPermission('read', 'ZReport') && (
              <Button label={t('z_report')} onClick={() => setIsZReportModalOpen(true)} size="small" style={{ marginLeft: '10px' }}>
                <FaHistory style={{ marginRight: '5px' }} /> {t('z_report')}
              </Button>
            )}
          </HeaderActions>
        </POSHeader>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={layoutComponents.filter(id => isZenMode ? ['products', 'cart'].includes(id) : true)} strategy={rectSortingStrategy}>
            <POSLayout isZenMode={isZenMode}>
              {layoutComponents.filter(id => isZenMode ? ['products', 'cart'].includes(id) : true).map(id => {
                const Component = componentsMap[id];
                return (
                  <SortableComponent key={id} id={id}>
                    <Component />
                  </SortableComponent>
                );
              })}
            </POSLayout>
          </SortableContext>
        </DndContext>
      </POSContainer>

    <Modal
      open={isHeldSalesModalOpen}
      onClose={() => setHeldSalesModalOpen(false)}
      title={t('held_sales_title')}
    >
      <div>
        {heldSales.length === 0 ? (
          <p>{t('no_held_sales')}</p>
        ) : (
          <ul>
            {heldSales.map((sale, index) => (
              <li key={index} style={{ marginBottom: '10px', borderBottom: '1px dashed #ccc', paddingBottom: '5px' }}>
                <p>{t('held_sale_items', { count: sale.length })}</p>
                <p>{t('held_sale_total', { total: sale.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2) })}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <Button label={t('resume')} onClick={() => { resumeSale(index); setHeldSalesModalOpen(false); }} size="small" />
                  <Button label={t('remove')} onClick={() => removeHeldSale(index)} variant="outlined" size="small" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <Button label={t('close')} onClick={() => setHeldSalesModalOpen(false)} />
      </div>
    </Modal>

      {/* New Return/Exchange Modal */}
      <Modal
        open={isReturnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title={t('return_exchange_title')}
      >
        <div>
          <p>{t('return_exchange_placeholder')}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button label={t('close')} onClick={() => setReturnModalOpen(false)} />
        </div>
      </Modal>

      {/* New Sangria Modal */}
      <Modal
        open={isSangriaModalOpen}
        onClose={() => setSangriaModalOpen(false)}
        title={t('cash_out_title')}
      >
        <div>
          <p>{t('cash_out_placeholder')}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button label={t('close')} onClick={() => setSangriaModalOpen(false)} />
        </div>
      </Modal>

      {/* New Suprimento Modal */}
      <Modal
        open={isSuprimentoModalOpen}
        onClose={() => setSuprimentoModalOpen(false)}
        title={t('cash_in_title')}
      >
        <div>
          <p>{t('cash_in_placeholder')}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button label={t('close')} onClick={() => setSuprimentoModalOpen(false)} />
        </div>
      </Modal>

      {/* Customer Management Modal */}
      <CustomerManagementModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerSelect={setSelectedCustomer}
      />

      {/* Split Payment Modal */}
      <SplitPaymentModal
        open={isSplitPaymentModalOpen}
        onClose={() => setIsSplitPaymentModalOpen(false)}
        totalAmount={total}
        availablePaymentMethods={['cash', 'credit_card', 'pix', 'store_credit']}
        onConfirm={async (payments) => {
          // Implement actual checkout logic here
          try {
            const saleData = {
              userId: user?.id, // Get from auth context
              customerId: selectedCustomer?.id,
              items: cart.map(item => ({
                productId: item.id,
                variationId: item.variation_id,
                quantity: item.quantity,
                unitPrice: item.price,
                costPrice: item.cost_price,
                totalPrice: item.subtotal
              })),
              payment_type: 'mixed', // Indicate mixed payment
              payments: payments.map(p => ({
                method: p.method,
                amount: p.amount,
                // transactionId: p.transactionId // If applicable
              })),
              total_installments: 1, // TODO: Get from UI if applicable
              interest_rate: 0 // TODO: Get from UI if applicable
            };

            const response = await sendOfflineRequest(
              '/api/sales',
              'POST',
              saleData,
              'offlineSales',
              { Authorization: `Bearer ${token}` }
            );

            if (response.offline) {
              addNotification(t('sale_saved_offline'), 'warning');
            } else {
              addNotification(t('sale_successful', { saleId: response.sale_id || 'ID' }), 'success');
              setLastSaleId(response.sale_id);
              setIsPostSaleActionsModalOpen(true);
            }
            
            clearCart();
            setSelectedCustomer(null);
            setIsSplitPaymentModalOpen(false);
            
          } catch (error: any) {
            addNotification(t('sale_failed', { message: error.message }), 'error');
          }
        }}
        customer360Data={customer360Data}
      />
      {/* Post Sale Actions Modal */}
      <PostSaleActionsModal
        open={isPostSaleActionsModalOpen}
        onClose={() => setIsPostSaleActionsModalOpen(false)}
        saleId={lastSaleId}
        customerEmail={selectedCustomer?.email}
      />

      {/* Serial Input Modal */}
      {productToAddSerial && (
        <SerialInputModal
          open={isSerialModalOpen}
          onClose={() => {
            setIsSerialModalOpen(false);
            setProductToAddSerial(null);
          }}
          onConfirm={(serials) => {
            confirmAddToCart(productToAddSerial, serials);
            setIsSerialModalOpen(false);
            setProductToAddSerial(null);
          }}
          productName={productToAddSerial.name}
          quantity={1}
        />
      )}

      {/* Z-Report Modal */}
      <ZReportModal
        open={isZReportModalOpen}
        onClose={() => setIsZReportModalOpen(false)}
      />

      {/* Scale Reading Modal */}
      <Modal
        open={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        title={t('scale_reading')}
      >
        <Box>
          <Typography variant="h5">{t('weight')}: {scaleReading !== null ? `${scaleReading} kg` : t('no_reading')}</Typography>
        </Box>
        <DialogActions>
          <Button label={t('close')} onClick={() => setIsScaleModalOpen(false)} />
        </DialogActions>
      </Modal>

      {/* TEF Result Modal */}
      <Modal
        open={isTefModalOpen}
        onClose={() => setIsTefModalOpen(false)}
        title={t('tef_transaction_result')}
      >
        <Box>
          {tefResult && (
            <>
              <Typography variant="h6" color={tefResult.success ? 'success.main' : 'error.main'}>
                {tefResult.success ? t('transaction_approved') : t('transaction_failed')}
              </Typography>
              <Typography><strong>{t('message')}:</strong> {tefResult.message}</Typography>
              {tefResult.transactionId && <Typography><strong>{t('transaction_id')}:</strong> {tefResult.transactionId}</Typography>}
              {tefResult.authorizationCode && <Typography><strong>{t('authorization_code')}:</strong> {tefResult.authorizationCode}</Typography>}
              {tefResult.nsu && <Typography><strong>NSU:</strong> {tefResult.nsu}</Typography>}
            </>
          )}
        </Box>
        <DialogActions>
          <Button label={t('close')} onClick={() => setIsTefModalOpen(false)} />
        </DialogActions>
      </Modal>
    </React.Fragment>
  );
};

export default POSPage;