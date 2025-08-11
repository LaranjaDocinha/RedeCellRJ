import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useReactToPrint } from 'react-to-print';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  Label,
  Input,
  Table,
  Badge,
} from 'reactstrap';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // Importa motion e AnimatePresence
import { NumericFormat } from 'react-number-format';

import { useAuthStore } from '../../../../store/authStore';
import { get, post } from '../../../../helpers/api_helper';

// Importa componentes de modal e recibo
import Receipt from '../Receipt';
import CashierModal from '../CashierModal';
import PaymentModal from '../PaymentModal'; // Importa o novo Modal de Pagamento
import SuccessModal from '../SuccessModal'; // Importa o Modal de Sucesso
import '../Receipt.css';
import './PdvUnifiedView.css'; // Novo CSS para o layout unificado

const PdvUnifiedView = () => {
  document.title = 'PDV | RedeCellRJ PDV';

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Refs
  const productSearchInputRef = useRef(null);
  const barcodeSearchInputRef = useRef(null);
  const receiptRef = useRef();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // State - Venda e Carrinho
  const [cart, setCart] = useState([]);
  const [saleDiscount, setSaleDiscount] = useState({ type: 'fixed', value: 0 });
  const [notes, setNotes] = useState('');

  // State - Busca de Cliente
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  // State - Busca de Produto
  const [productSearch, setProductSearch] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Novo estado para o índice destacado

  // State - UI e Status
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [suspendedSales, setSuspendedSales] = useState([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false); // Estado para o novo modal
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false); // Estado para o modal de sucesso
  const [saleSuccessModalData, setSaleSuccessModalData] = useState(null); // Dados para o modal de sucesso
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [pulseTotal, setPulseTotal] = useState(false); // Novo estado para animação de pulso

  // State - Caixa e Devolução
  const [cashierModalOpen, setCashierModalOpen] = useState(false);
  const [cashierStatus, setCashierStatus] = useState({
    loading: true,
    isOpen: false,
    session: null,
  });
  const [returnMode, setReturnMode] = useState(null); // Armazena o ID da venda original

  // Variáveis de controle de UI
  const isCashierOpen = cashierStatus.isOpen;
  const isPdvDisabled = !isCashierOpen || loading || !!returnMode;
  const isCartDisabled = !isCashierOpen || loading;

  const togglePaymentModal = () => setPaymentModalOpen(!isPaymentModalOpen);

  // --- Funções de Caixa ---
  const fetchCashierStatus = useCallback(async (userId) => {
    // Deferir a atualização do estado de loading
    setTimeout(() => {
      setCashierStatus((prev) => ({ ...prev, loading: true }));
    }, 0);
    try {
      const data = await get(`/api/cashier/status?userId=${userId}`);
      setCashierStatus({ loading: false, isOpen: data.isOpen, session: data.session });
    } catch (err) {
      toast.error('Falha ao verificar o status do caixa.');
      setCashierStatus({ loading: false, isOpen: false, session: null });
    }
  }, []);

  const toggleCashierModal = useCallback(() => {
    if (cashierStatus.loading) return; // Impede abrir o modal se ainda estiver carregando
    setCashierModalOpen((prevState) => !prevState);
  }, [cashierStatus.loading]);

  const onCashierUpdate = useCallback(() => {
    if (user?.id) {
      fetchCashierStatus(user.id);
    }
    setCashierModalOpen(false);
    toast.success('Status do caixa atualizado!');
  }, [user?.id, fetchCashierStatus]);

  // --- Funções de Impressão ---
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onBeforePrint: () => document.body.classList.add('receipt-print-wrapper'),
    onAfterPrint: () => document.body.classList.remove('receipt-print-wrapper'),
  });

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const data = await get('/api/payment-methods');
      setPaymentMethods(data);
    } catch (err) {
      toast.error('Falha ao carregar métodos de pagamento.');
    }
  }, []);

  // --- Efeitos ---
  useEffect(() => {
    if (user?.id) {
      fetchCashierStatus(user.id);
      fetchPaymentMethods();
    }
  }, [user?.id, fetchCashierStatus, fetchPaymentMethods]);

  useEffect(() => {
    if (isCashierOpen) {
      barcodeSearchInputRef.current?.focus();
    }
  }, [isCashierOpen]);

  const handleClearSale = useCallback(() => {
    setCart([]);
    setSaleDiscount({ type: 'fixed', value: 0 });
    setNotes('');
    setSelectedCustomer(null);
    setCustomerSearch('');
    setProductSearch('');
    setBarcodeSearch('');
    setReturnMode(null);
    toast('Venda limpa.');
  }, []);

  const handleNewSaleFromSuccessModal = useCallback(() => {
    setSuccessModalOpen(false);
    setSaleSuccessModalData(null);
    handleClearSale();
  }, [handleClearSale]);

  const handlePrintReceiptFromSuccessModal = useCallback(() => {
    handlePrint();
  }, [handlePrint]);

  useEffect(() => {
    if (location.state?.saleToReturn) {
      const { saleToReturn } = location.state;
      handleClearSale();
      setReturnMode(saleToReturn.id);
      const itemsToReturn = saleToReturn.items.map((item) => ({
        ...item,
        variationId: item.variationId || item.itemId,
        quantity: -Math.abs(item.quantity),
        unitPrice: parseFloat(item.unit_price),
        stockQuantity: Infinity,
        discount: { type: item.discount_type || 'fixed', value: item.discount_value || 0 },
        manualPrice: parseFloat(item.unit_price),
      }));
      setCart(itemsToReturn);
      if (saleToReturn.customer_name) {
        setSelectedCustomer({ id: saleToReturn.customer_id, name: saleToReturn.customer_name });
      }
      toast.warn('Modo de Devolução Ativado.');
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, handleClearSale]);

  // --- Animação e Refinamento ---
  const saleColumnRef = useRef(null); // Ref para a coluna de venda (alvo da animação)

  const handleAddToCartAnimation = (productCardElement) => {
    if (!productCardElement || !saleColumnRef.current) return;

    const cardRect = productCardElement.getBoundingClientRect();
    const targetRect = saleColumnRef.current.getBoundingClientRect();

    // Cria um elemento clone para animar
    const flyingImage = productCardElement.querySelector('img').cloneNode(true);
    flyingImage.classList.add('fly-to-cart-animation');
    document.body.appendChild(flyingImage);

    // Define a posição inicial
    flyingImage.style.left = `${cardRect.left}px`;
    flyingImage.style.top = `${cardRect.top}px`;
    flyingImage.style.width = `${cardRect.width}px`;
    flyingImage.style.height = `${cardRect.height}px`;

    // Define as variáveis CSS para o alvo da animação
    const targetX = targetRect.left + targetRect.width / 2 - cardRect.left;
    const targetY = targetRect.top - cardRect.top;
    flyingImage.style.setProperty('--target-x', `${targetX}px`);
    flyingImage.style.setProperty('--target-y', `${targetY}px`);

    // Remove o elemento após a animação ou após um tempo limite (fallback)
    flyingImage.addEventListener('animationend', () => {
      flyingImage.remove();
    });
    // Fallback para garantir a remoção caso a animação não dispare o evento
    setTimeout(() => {
      if (flyingImage.parentNode) {
        flyingImage.remove();
      }
    }, 1000); // Remove após 1 segundo (ajuste conforme a duração da sua animação)
  };

  // --- Funções do Carrinho ---
  const addToCart = useCallback(
    (productToAdd, event = null) => {
      if (isPdvDisabled) return;

      let variation = productToAdd.variations?.[0];
      const product = productToAdd;

      // Se não houver variação, e o produto não for um serviço, ou se for um produto sem variações mas com preço direto
      if (!variation && product.productType !== 'service') {
        // Tenta usar o próprio produto como uma variação padrão se tiver um unit_price
        if (product.unit_price !== undefined) {
          variation = {
            id: product.id, // Usar o ID do produto como ID da variação
            price: product.unit_price,
            stock_quantity: product.stock_quantity || Infinity, // Assume estoque infinito se não especificado
            reserved_quantity: product.reserved_quantity || 0, // Include reserved quantity
            color: null, // Sem cor para produtos sem variação
            size: null, // Sem tamanho para produtos sem variação
          };
        } else {
          toast.error(
            `Produto ${product.name} não possui variações e nem preço unitário definido.`,
          );
          return;
        }
      }

      if (!variation && product.productType === 'service') {
        variation = {
          id: product.id, // Usar o ID do produto como ID da variação
          price: product.unit_price || 0,
          stock_quantity: Infinity, // Serviços geralmente não têm estoque
          reserved_quantity: 0, // Services don't have reserved stock
          color: null,
          size: null,
        };
      }

      if (!variation) {
        toast.error(
          `Não foi possível adicionar ${product.name} ao carrinho. Nenhuma variação válida encontrada.`,
        );
        return;
      }

      // Dispara a animação apenas se o evento for fornecido
      if (event?.currentTarget) {
        const productCardElement = event.currentTarget.closest('.product-card');
        handleAddToCartAnimation(productCardElement);
      }

      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((item) => item.variationId === variation.id);
        const availableStock = (variation.stock_quantity || 0) - (variation.reserved_quantity || 0);

        if (existingItemIndex > -1) {
          const updatedCart = [...prevCart];
          const newQuantity = updatedCart[existingItemIndex].quantity + 1;
          if (newQuantity <= availableStock) { // Check against available stock
            updatedCart[existingItemIndex].quantity = newQuantity;
          } else {
            toast.error(`Estoque disponível máximo atingido para ${product.name}`);
          }
          return updatedCart;
        } else {
          if (1 <= availableStock) { // Check against available stock for initial add
            const newItem = {
              productId: product.id,
              productName: product.name,
              variationId: variation.id,
              quantity: 1,
              unitPrice: parseFloat(variation.price || product.unit_price),
              stock_quantity: variation.stock_quantity,
              reserved_quantity: variation.reserved_quantity,
              discount: { type: 'fixed', value: 0 },
              color: variation.color,
              size: variation.size,
            };
            toast.success(`${product.name} adicionado ao carrinho!`);
            return [...prevCart, newItem];
          } else {
            toast.error(`Estoque esgotado para ${product.name}`);
            return prevCart;
          }
        }
      });
      setPulseTotal(true); // Ativa a animação de pulso
      setTimeout(() => setPulseTotal(false), 500); // Desativa após 500ms
      setProductSearch('');
      setProductResults([]);
      barcodeSearchInputRef.current?.focus();

      // Fetch product suggestions
      const fetchSuggestions = async (variationId) => {
        try {
          const suggestions = await get(`/api/products/${variationId}/suggestions`);
          setProductSuggestions(suggestions);
        } catch (err) {
          console.error('Error fetching product suggestions:', err);
        }
      };

      fetchSuggestions(variation.id);
    },
    [isPdvDisabled, setProductSuggestions],
  );

  const handleRemoveItem = useCallback((indexToRemove) => {
    setCart((prevCart) => {
      const removedItem = prevCart[indexToRemove];
      toast.error(`${removedItem.product_name} removido.`);
      return prevCart.filter((_, index) => index !== indexToRemove);
    });
  }, []);

  const handleUpdateQuantity = useCallback(
    (indexToUpdate, newQuantity) => {
      setCart((prevCart) => {
        const updatedCart = [...prevCart];
        const item = { ...updatedCart[indexToUpdate] };
        const parsedNewQuantity = parseInt(newQuantity, 10);

        if (isNaN(parsedNewQuantity) || parsedNewQuantity < 0) {
          toast.error('Quantidade inválida.');
          return prevCart;
        }

        if (parsedNewQuantity === 0) {
          toast.error(`${item.product_name} removido.`);
          return prevCart.filter((_, index) => index !== indexToUpdate);
        }

        const availableStock = (item.stock_quantity || 0) - (item.reserved_quantity || 0);
        if (!returnMode && parsedNewQuantity > availableStock) { // Check against available stock
          toast.error(`Quantidade máxima disponível para ${item.product_name} é ${availableStock}.`);
          return prevCart;
        }
        item.quantity = parsedNewQuantity;
        updatedCart[indexToUpdate] = item;
        return updatedCart;
      });
    },
    [returnMode],
  );

  const handleUpdateItemDiscount = useCallback(
    (indexToUpdate, newDiscountValue, newDiscountType = 'fixed') => {
      setCart((prevCart) => {
        const updatedCart = [...prevCart];
        updatedCart[indexToUpdate].discount = { type: newDiscountType, value: newDiscountValue };
        return updatedCart;
      });
    },
    [],
  );

  // --- Funções de Cálculo ---
  const calculateItemTotal = useCallback((item) => {
    const price = parseFloat(item.manualPrice || item.unitPrice);
    const quantity = item.quantity;
    const discountValue = item.discount?.value || 0;
    const discountType = item.discount?.type || 'fixed';
    let itemTotal = price * quantity;
    if (discountType === 'fixed') itemTotal -= discountValue;
    else if (discountType === 'percentage') itemTotal *= 1 - discountValue / 100;
    return itemTotal;
  }, []);

  const subtotal = cart.reduce(
    (acc, item) => acc + parseFloat(item.manualPrice || item.unitPrice) * item.quantity,
    0,
  );

  const calculateTotalDiscount = useCallback(() => {
    const itemDiscounts = cart.reduce((acc, item) => {
      const price = parseFloat(item.manual_price || item.unit_price);
      const quantity = item.quantity;
      const discountValue = item.discount?.value || 0;
      const discountType = item.discount?.type || 'fixed';
      if (discountType === 'fixed') return acc + discountValue;
      if (discountType === 'percentage') return acc + price * quantity * (discountValue / 100);
      return acc;
    }, 0);
    let saleDiscountValue = saleDiscount.value || 0;
    if (saleDiscount.type === 'percentage')
      saleDiscountValue = subtotal * (saleDiscount.value / 100);
    return itemDiscounts + saleDiscountValue;
  }, [cart, saleDiscount, subtotal]);

  const totalAmount = useCallback(() => {
    const total = subtotal - calculateTotalDiscount();
    return returnMode ? total : total > 0 ? total : 0;
  }, [subtotal, calculateTotalDiscount, returnMode]);

  // --- Funções de Busca ---
  const searchProducts = useCallback(
    debounce(async (query, isBarcode = false) => {
      if (isPdvDisabled || (query.length < 2 && !isBarcode)) {
        if (query.length === 0) setProductResults([]);
        return;
      }
      try {
        const data = await get(`/api/products/search?query=${query}`);
        if (isBarcode && data.length === 1) {
          addToCart(data[0].variations?.[0] || data[0], data[0]);
          setBarcodeSearch('');
          setProductResults([]);
        } else {
          setProductResults(data);
        }
      } catch (err) {
        console.error('Error searching products:', err);
        toast.error('Erro ao buscar produtos.');
      }
    }, 300),
    [isPdvDisabled, addToCart],
  );

  // --- Funções de Finalização de Venda ---
  const handleSuspendSale = useCallback(async () => {
    if (isCartDisabled || cart.length === 0) return;
    setLoading(true);
    try {
      await post('/api/sales/suspend', {
        customerId: selectedCustomer?.id || null,
        items: cart,
        saleDiscount: saleDiscount,
        notes,
        status: 'suspended',
      });
      handleClearSale();
      toast('Venda suspensa com sucesso.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao suspender a venda.');
    } finally {
      setLoading(false);
    }
  }, [cart, selectedCustomer, saleDiscount, notes, handleClearSale, isCartDisabled]);

  const handleFinalizeSale = useCallback(
    async (payments) => {
      if (isCartDisabled) return;

      setLoading(true);
      const saleData = {
        customerId: selectedCustomer?.id || null,
        items: cart,
        payments: payments,
        saleDiscount: saleDiscount,
        notes,
        originalSaleId: returnMode,
      };
      try {
        const data = await post('/api/sales', saleData);
        setSaleSuccessModalData({
          ...data,
          items: cart,
          customer: selectedCustomer,
          saleDiscount: saleDiscount,
          notes,
          timestamp: new Date().toISOString(),
          saleType: returnMode ? 'return' : 'sale',
        });
        setPaymentModalOpen(false);
        setSuccessModalOpen(true);
        toast.success(
          returnMode ? 'Devolução finalizada com sucesso!' : 'Venda finalizada com sucesso!',
        );
      } catch (err) {
        toast.error(err.response?.data?.message || 'Falha ao registrar a transação.');
      } finally {
        setLoading(false);
      }
    },
    [cart, saleDiscount, notes, selectedCustomer, isCartDisabled, returnMode],
  );

  // --- Atalhos de Teclado ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('Key pressed:', event.key, 'Ctrl:', event.ctrlKey, 'isPdvDisabled:', isPdvDisabled, 'isPaymentModalOpen:', isPaymentModalOpen, 'cart.length:', cart.length);
      if (isPdvDisabled) {
        console.log('PDV is disabled, shortcuts are inactive.');
        return;
      }
      if (isPaymentModalOpen) {
        console.log('Payment modal is open, shortcuts are inactive.');
        return;
      } // Desativa atalhos quando o modal de pagamento está aberto

      const fkey = event.key;

      if (showProductDropdown && productResults.length > 0) {
        if (fkey === 'ArrowDown') {
          event.preventDefault();
          setHighlightedIndex((prevIndex) => (prevIndex + 1) % productResults.length);
        } else if (fkey === 'ArrowUp') {
          event.preventDefault();
          setHighlightedIndex(
            (prevIndex) => (prevIndex - 1 + productResults.length) % productResults.length,
          );
        } else if (fkey === 'Enter') {
          event.preventDefault();
          if (highlightedIndex > -1) {
            addToCart(productResults[highlightedIndex]);
            setShowProductDropdown(false);
            setProductSearch('');
            setHighlightedIndex(-1); // Resetar o destaque
          }
        }
      }

      if (fkey === 'F1') {
        event.preventDefault();
        productSearchInputRef.current?.focus();
      } else if (fkey === 'F2') {
        event.preventDefault();
        setCustomerModalOpen(true);
      } else if (fkey === 'F4') {
        event.preventDefault();
        if (cart.length > 0) togglePaymentModal();
      } else if (fkey === 'F9') {
        event.preventDefault();
        handleSuspendSale();
      } else if (fkey === 'Escape') {
        event.preventDefault();
        handleClearSale();
      } else if (event.ctrlKey && fkey === 'k') {
        event.preventDefault();
        productSearchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isPdvDisabled,
    isPaymentModalOpen,
    handleSuspendSale,
    handleClearSale,
    cart,
    showProductDropdown,
    productResults,
    highlightedIndex,
    addToCart,
  ]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className='pdv-unified-container'
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {returnMode && (
        <Alert className='text-center' color='warning'>
          <h4 className='alert-heading'>Modo de Devolução</h4>
          <p>
            Processando devolução para a Venda ID: <strong>#{returnMode}</strong>.
          </p>
          <Button outline color='danger' onClick={handleClearSale}>
            Cancelar Devolução
          </Button>
        </Alert>
      )}

      <Card className='pdv-search-section'>
        <CardBody className='p-3'>
          <div className='d-flex justify-content-end align-items-center mb-4'>
            <div>
              <Button outline className='me-2' size='sm' title='Vendas Suspensas'>
                <i className='bx bx-pause'></i>
              </Button>
              <Button outline size='sm' title='Tela Cheia' onClick={toggleFullscreen}>
                <i className='bx bx-fullscreen'></i>
              </Button>
            </div>
          </div>

          <Row className='g-3'>
            <Col md={4}>
              {/* Customer Search */}
              <FormGroup>
                <Label for='customerSearch'>
                  <i className='bx bx-user-circle me-1'></i>Cliente (F2)
                </Label>
                <Input
                  disabled={isPdvDisabled}
                  id='customerSearch'
                  placeholder='Nome ou CPF'
                  type='text'
                  value={selectedCustomer ? selectedCustomer.name : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomer(null);
                  }}
                  onFocus={() => setCustomerModalOpen(true)}
                />
                {selectedCustomer && (
                  <div className='mt-2'>
                    <p className='mb-1 font-size-14'>
                      Selecionado: <strong>{selectedCustomer.name}</strong>
                    </p>
                    <Button
                      close
                      title='Remover Cliente'
                      onClick={() => setSelectedCustomer(null)}
                    />
                  </div>
                )}
              </FormGroup>
            </Col>
            <Col md={4}>
              {/* Product Search */}
              <FormGroup className='position-relative'>
                {' '}
                {/* Adicionado position-relative */}
                <Label for='productSearch'>
                  <i className='bx bx-search-alt me-1'></i>Buscar Produto (F1)
                </Label>
                <Input
                  disabled={isPdvDisabled}
                  id='productSearch'
                  placeholder='Nome do produto'
                  type='text'
                  value={productSearch}
                  onBlur={() => setTimeout(() => setShowProductDropdown(false), 100)} // Pequeno delay para permitir o clique
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    searchProducts(e.target.value);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                />
                {showProductDropdown && productResults.length > 0 && (
                  <div
                    className='product-search-dropdown position-absolute w-100 bg-white border rounded shadow-sm'
                    style={{ zIndex: 1000 }}
                  >
                    <ul className='list-unstyled mb-0'>
                      {productResults.map((product, index) => (
                        <li
                          key={product.id}
                          aria-selected={index === highlightedIndex}
                          className={`p-2 border-bottom cursor-pointer hover-bg-light ${index === highlightedIndex ? 'highlighted' : ''} ${product.variations && (product.variations[0]?.stock_quantity - product.variations[0]?.reserved_quantity) <= 0 ? 'out-of-stock-product' : ''}`}
                          role='option'
                          tabIndex='0'
                          onClick={() => {
                            if (product.variations && (product.variations[0]?.stock_quantity - product.variations[0]?.reserved_quantity) <= 0) {
                              toast.error(`Produto ${product.name} está esgotado.`);
                              return;
                            }
                            addToCart(product);
                            setShowProductDropdown(false);
                            setProductSearch(''); // Limpa o campo após a seleção
                            setHighlightedIndex(-1); // Resetar o destaque
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              if (
                                product.variations &&
                                (product.variations[0]?.stock_quantity - product.variations[0]?.reserved_quantity) <= 0
                              ) {
                                toast.error(`Produto ${product.name} está esgotado.`);
                                return;
                              }
                              addToCart(product);
                              setShowProductDropdown(false);
                              setProductSearch('');
                              setHighlightedIndex(-1);
                            }
                          }}
                          onMouseEnter={() => setHighlightedIndex(index)} // Destacar ao passar o mouse
                        >
                          {product.name}{' '}
                          {product.variations &&
                            product.variations.length > 0 &&
                            `(${product.variations[0].color})`}{' '}
                          - R${' '}
                          {product.variations && product.variations.length > 0
                            ? product.variations[0].price
                            : 'N/A'}
                          {product.variations && (product.variations[0]?.stock_quantity - product.variations[0]?.reserved_quantity) <= 0 && (
                            <span className='text-danger ms-2'>(ESGOTADO)</span>
                          )}
                          {product.variations && product.variations[0]?.reserved_quantity > 0 && (
                            <span className='text-warning ms-2'>(Res: {product.variations[0].reserved_quantity})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for='barcodeSearch'>
                  <i className='bx bx-barcode-reader me-1'></i>Código de Barras
                </Label>
                <Input
                  disabled={isPdvDisabled}
                  id='barcodeSearch'
                  innerRef={barcodeSearchInputRef}
                  placeholder='Leia o código de barras'
                  type='text'
                  value={barcodeSearch}
                  onChange={(e) => {
                    setBarcodeSearch(e.target.value);
                    searchProducts(e.target.value, true);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchProducts(barcodeSearch, true);
                    }
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card className='flex-grow-1 d-flex flex-column pdv-cart-section'>
        <CardBody className='flex-grow-1 d-flex flex-column p-3'>
          <div
            className='table-responsive flex-grow-1 d-flex align-items-center justify-content-center'
            style={{ minHeight: '250px', maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}
          >
            {cart.length === 0 ? (
              <div className='text-center text-muted py-3 font-size-16'>
                <i className='bx bx-shopping-bag font-size-30 d-block mb-2'></i>
                Carrinho vazio
              </div>
            ) : (
              <Table className='table-nowrap pdv-cart-table mb-0'>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.tr
                      key={item.variation_id || item.product_id} // Usar uma key única para a animação
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td>
                        <div className='text-truncate font-size-18' style={{ maxWidth: '150px' }}>
                          {item.product_name}
                          {(item.color || item.size) && (
                            <small className='text-muted d-block font-size-16'>
                              {item.color}
                              {item.size && `, ${item.size}`}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <Input
                          bsSize='lg'
                          disabled={isCartDisabled}
                          min={returnMode ? -Infinity : 1}
                          style={{ width: '80px' }}
                          type='number'
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(index, parseInt(e.target.value, 10))
                          }
                        />
                      </td>
                      <td className='font-size-20 fw-bold'>
                        R$ {calculateItemTotal(item).toFixed(2)}
                      </td>
                      <td>
                        <Button
                          outline
                          color='danger'
                          disabled={isCartDisabled}
                          size='lg'
                          onClick={() => handleRemoveItem(index)}
                        >
                          <i className='bx bx-trash-alt'></i>
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </Table>
            )}
          </div>

          {/* Financial Summary */}
          <div className='mt-auto pt-3 border-top'>
            <div className='d-flex justify-content-between pdv-summary-item'>
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className='d-flex justify-content-between pdv-summary-item'>
              <span>Descontos:</span>
              <span className='text-danger'>- R$ {calculateTotalDiscount().toFixed(2)}</span>
            </div>
            <hr className='my-2' />
            <div className='d-flex justify-content-between pdv-summary-item total mt-2'>
              <span>Total:</span>
              <span className={`pdv-total-amount ${pulseTotal ? 'pulse-animation' : ''}`}>
                R$ {totalAmount().toFixed(2)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <Card className='pdv-action-buttons'>
        <CardBody className='p-3'>
          <div className='d-flex gap-2'>
            <Button
              className='w-100'
              color='success'
              disabled={isCartDisabled || cart.length === 0}
              size='sm'
              onClick={() => handleFinalizeSale(null)}
            >
              <i className='bx bx-check-double me-1'></i> Finalizar Venda (F4)
            </Button>
            <Button
              outline
              className='w-100'
              color='info'
              disabled={isCartDisabled || cart.length === 0}
              size='sm'
              onClick={handleSuspendSale}
            >
              <i className='bx bx-pause me-1'></i> Suspender (F9)
            </Button>
            <Button
              outline
              className='w-100'
              color='secondary'
              disabled={isCartDisabled && cart.length === 0}
              size='sm'
              onClick={handleClearSale}
            >
              <i className='bx bx-x me-1'></i> Limpar (ESC)
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modais */}
      <CashierModal
        cashierStatus={cashierStatus}
        isOpen={cashierModalOpen}
        toggle={toggleCashierModal}
        onCashierUpdate={onCashierUpdate}
      />
      <PaymentModal
        cart={cart}
        finalizeSale={handleFinalizeSale}
        isOpen={isPaymentModalOpen}
        loading={loading}
        paymentMethods={paymentMethods}
        toggle={togglePaymentModal}
        totalAmount={totalAmount()}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        saleDetails={saleSuccessModalData}
        toggle={() => setSuccessModalOpen(false)}
        onNewSale={handleNewSaleFromSuccessModal}
        onPrintReceipt={handlePrintReceiptFromSuccessModal}
      />
    </motion.div>
  );
};

export default PdvUnifiedView;