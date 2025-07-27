import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { get, post } from '../../helpers/api_helper';
import { useReactToPrint } from "react-to-print";
import { Container, Row, Col, Button, Alert, Spinner } from 'reactstrap';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from "../../store/authStore";

// Importa a nova estrutura de layout
import SearchColumn from "./components/layout/SearchColumn";
import ProductGrid from "./components/layout/ProductGrid";
import SaleColumn from "./components/layout/SaleColumn";

// Importa componentes de modal e recibo
import Receipt from "./components/Receipt";
import CashierModal from "./components/CashierModal";
import PaymentModal from "./components/PaymentModal"; // Importa o novo Modal de Pagamento
import SuccessModal from "./components/SuccessModal"; // Importa o Modal de Sucesso
import "./components/Receipt.css";

const Pdv = () => {
  document.title = "PDV | Skote PDV";

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Refs
  const productSearchInputRef = useRef(null);
  const barcodeSearchInputRef = useRef(null);
  const receiptRef = useRef();

  // State - Venda e Carrinho
  const [cart, setCart] = useState([]);
  // const [payments, setPayments] = useState([]); // Movido para o Modal de Pagamento
  const [saleDiscount, setSaleDiscount] = useState({ type: 'fixed', value: 0 });
  const [notes, setNotes] = useState("");

  // State - Busca de Cliente
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  // State - Busca de Produto
  const [productSearch, setProductSearch] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [productResults, setProductResults] = useState([]);

  // State - UI e Status
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [suspendedSales, setSuspendedSales] = useState([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false); // Estado para o novo modal
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false); // Estado para o modal de sucesso
  const [saleSuccessModalData, setSaleSuccessModalData] = useState(null); // Dados para o modal de sucesso
  
  // State - Caixa e Devolução
  const [cashierModalOpen, setCashierModalOpen] = useState(false);
  const [cashierStatus, setCashierStatus] = useState({ loading: true, isOpen: false, session: null });
  const [returnMode, setReturnMode] = useState(null); // Armazena o ID da venda original

  // Variáveis de controle de UI
  const isCashierOpen = cashierStatus.isOpen;
  const isPdvDisabled = !isCashierOpen || loading || !!returnMode;
  const isCartDisabled = !isCashierOpen || loading;

  const togglePaymentModal = () => setPaymentModalOpen(!isPaymentModalOpen);

  // --- Funções de Caixa ---
  const fetchCashierStatus = useCallback(async (userId) => {
    setCashierStatus(prev => ({ ...prev, loading: true }));
    try {
      const data = await get(`/api/cashier/status?userId=${userId}`);
      setCashierStatus({ loading: false, isOpen: data.isOpen, session: data.session });
    } catch (err) {
      toast.error("Falha ao verificar o status do caixa.");
      setCashierStatus({ loading: false, isOpen: false, session: null });
    }
  }, []);

  const toggleCashierModal = useCallback(() => {
    if (cashierStatus.loading) return; // Impede abrir o modal se ainda estiver carregando
    setCashierModalOpen(prevState => !prevState);
  }, [cashierStatus.loading]);

  const onCashierUpdate = useCallback(() => {
    if (user?.id) {
      fetchCashierStatus(user.id);
    }
    setCashierModalOpen(false);
    toast.success("Status do caixa atualizado!");
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
      toast.error("Falha ao carregar métodos de pagamento.");
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
    setNotes(""); setSelectedCustomer(null); setCustomerSearch("");
    setProductSearch(""); setBarcodeSearch(""); setReturnMode(null);
    toast("Venda limpa.");
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
      const itemsToReturn = saleToReturn.items.map(item => ({
        ...item,
        variationId: item.variationId || item.itemId,
        quantity: -Math.abs(item.quantity),
        unitPrice: parseFloat(item.unit_price),
        stockQuantity: Infinity,
        discount: { type: item.discount_type || 'fixed', value: item.discount_value || 0 },
        manualPrice: parseFloat(item.unit_price)
      }));
      setCart(itemsToReturn);
      if (saleToReturn.customer_name) {
        setSelectedCustomer({ id: saleToReturn.customer_id, name: saleToReturn.customer_name });
      }
      toast.warn("Modo de Devolução Ativado.");
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
    const targetX = targetRect.left + (targetRect.width / 2) - cardRect.left;
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
  const addToCart = useCallback((variation, product, event) => {
    if (isPdvDisabled) return;

    // Dispara a animação
    if (event?.currentTarget) {
      const productCardElement = event.currentTarget.closest('.product-card');
      handleAddToCartAnimation(productCardElement);
    }
    
    setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(item => item.variationId === variation.id);
        if (existingItemIndex > -1) {
            const updatedCart = [...prevCart];
            const newQuantity = updatedCart[existingItemIndex].quantity + 1;
            if (newQuantity <= variation.stockQuantity) {
                updatedCart[existingItemIndex].quantity = newQuantity;
            } else {
                toast.error(`Estoque máximo atingido para ${product.name}`);
            }
            return updatedCart;
        } else {
            if (1 <= variation.stockQuantity) {
                const newItem = {
                    productId: product.id,
                    productName: product.name,
                    variationId: variation.id,
                    quantity: 1,
                    unitPrice: parseFloat(variation.price || product.unit_price),
                    stockQuantity: variation.stock_quantity,
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
    setProductSearch("");
    setProductResults([]);
    barcodeSearchInputRef.current?.focus();

  }, [isPdvDisabled]);

  const handleRemoveItem = useCallback((indexToRemove) => {
    setCart(prevCart => {
        const removedItem = prevCart[indexToRemove];
        toast.error(`${removedItem.product_name} removido.`);
        return prevCart.filter((_, index) => index !== indexToRemove)
    });
  }, []);

  const handleUpdateQuantity = useCallback((indexToUpdate, newQuantity) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      const item = { ...updatedCart[indexToUpdate] };
      if (newQuantity < 0 && !returnMode) return prevCart;
      if (newQuantity === 0) {
          toast.error(`${item.product_name} removido.`);
          return prevCart.filter((_, index) => index !== indexToUpdate);
      }
      if (!returnMode && newQuantity > item.stock_quantity) {
        toast.error(`Quantidade máxima para ${item.product_name} é ${item.stock_quantity}.`);
        return prevCart;
      }
      item.quantity = newQuantity;
      updatedCart[indexToUpdate] = item;
      return updatedCart;
    });
  }, [returnMode]);

  const handleUpdateItemDiscount = useCallback((indexToUpdate, newDiscountValue, newDiscountType = 'fixed') => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      updatedCart[indexToUpdate].discount = { type: newDiscountType, value: newDiscountValue };
      return updatedCart;
    });
  }, []);

  // --- Funções de Cálculo ---
  const calculateItemTotal = useCallback((item) => {
    const price = parseFloat(item.manualPrice || item.unitPrice);
    const quantity = item.quantity;
    const discountValue = item.discount?.value || 0;
    const discountType = item.discount?.type || 'fixed';
    let itemTotal = price * quantity;
    if (discountType === 'fixed') itemTotal -= discountValue;
    else if (discountType === 'percentage') itemTotal *= (1 - discountValue / 100);
    return itemTotal;
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.manualPrice || item.unitPrice) * item.quantity), 0);

  const calculateTotalDiscount = useCallback(() => {
    const itemDiscounts = cart.reduce((acc, item) => {
      const price = parseFloat(item.manual_price || item.unit_price);
      const quantity = item.quantity;
      const discountValue = item.discount?.value || 0;
      const discountType = item.discount?.type || 'fixed';
      if (discountType === 'fixed') return acc + discountValue;
      if (discountType === 'percentage') return acc + (price * quantity * (discountValue / 100));
      return acc;
    }, 0);
    let saleDiscountValue = saleDiscount.value || 0;
    if (saleDiscount.type === 'percentage') saleDiscountValue = subtotal * (saleDiscount.value / 100);
    return itemDiscounts + saleDiscountValue;
  }, [cart, saleDiscount, subtotal]);

  const totalAmount = useCallback(() => {
    const total = subtotal - calculateTotalDiscount();
    return returnMode ? total : (total > 0 ? total : 0);
  }, [subtotal, calculateTotalDiscount, returnMode]);

  // --- Funções de Busca ---
  const searchProducts = useCallback(debounce(async (query, isBarcode = false) => {
    if (isPdvDisabled || (query.length < 2 && !isBarcode)) { 
        if(query.length === 0) setProductResults([]);
        return; 
    }
    try {
        const data = await get(`/api/products/search?query=${query}`);
        if (isBarcode && data.length === 1) {
            addToCart(data[0].variations?.[0] || data[0], data[0]);
            setBarcodeSearch("");
            setProductResults([]);
        } else {
            setProductResults(data);
        }
    } catch (err) {
        console.error("Error searching products:", err);
        toast.error("Erro ao buscar produtos.");
    }
  }, 300), [isPdvDisabled, addToCart]);

  // --- Funções de Finalização de Venda ---
  const handleSuspendSale = useCallback(async () => {
    if (isCartDisabled || cart.length === 0) return;
    setLoading(true);
    try {
      await post('/api/sales/suspend', {
        customerId: selectedCustomer?.id || null,
        items: cart, saleDiscount: saleDiscount, notes, status: 'suspended',
      });
      handleClearSale();
      toast('Venda suspensa com sucesso.');
    } catch (err) {
      toast.error(err.response?.data?.message || "Falha ao suspender a venda.");
    } finally {
      setLoading(false);
    }
  }, [cart, selectedCustomer, saleDiscount, notes, handleClearSale, isCartDisabled]);

  const handleFinalizeSale = useCallback(async (payments) => {
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
            setSaleSuccessModalData({ ...data, items: cart, customer: selectedCustomer, saleDiscount: saleDiscount, notes, timestamp: new Date().toISOString(), saleType: returnMode ? 'return' : 'sale' });
      setPaymentModalOpen(false);
      setSuccessModalOpen(true);
      toast.success(returnMode ? "Devolução finalizada com sucesso!" : "Venda finalizada com sucesso!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Falha ao registrar a transação.");
    } finally {
      setLoading(false);
    }
  }, [cart, saleDiscount, notes, selectedCustomer, handleClearSale, isCartDisabled, returnMode]);

  // --- Atalhos de Teclado ---
  useEffect(() => {
    const handleKeyDown = (event) => {
        if (isPdvDisabled) return;
        if (isPaymentModalOpen) return; // Desativa atalhos quando o modal de pagamento está aberto

        const fkey = event.key;

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
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPdvDisabled, isPaymentModalOpen, handleSuspendSale, handleClearSale, cart]);

  const renderContent = () => {
    if (cashierStatus.loading) {
      return (
        <div className="text-center my-5">
          <Spinner />
          <p className="mt-2">Verificando status do caixa...</p>
        </div>
      );
    }

    if (!isCashierOpen) {
      return (
        <div className="text-center my-5">
          <p className="font-size-18">O caixa está fechado. Por favor, abra o caixa para iniciar as operações.</p>
          <Button color="primary" onClick={toggleCashierModal} disabled={cashierStatus.loading}>
            <i className="bx bx-wallet-alt me-1"></i> Abrir Caixa
          </Button>
        </div>
      );
    }

    return (
      <>
        {returnMode && (
          <Alert color="warning" className="text-center">
            <h4 className="alert-heading">Modo de Devolução</h4>
            <p>Processando devolução para a Venda ID: <strong>#{returnMode}</strong>.</p>
            <Button color="danger" outline onClick={handleClearSale}>Cancelar Devolução</Button>
          </Alert>
        )}
        
        <Row className="g-3" style={{ filter: isCartDisabled ? 'blur(2px)' : 'none', pointerEvents: isCartDisabled ? 'none' : 'auto' }}>
          {/* Coluna da Esquerda: Busca e Ações */}
          <Col lg={3}>
            <SearchColumn
              isPdvDisabled={isPdvDisabled}
              selectedCustomer={selectedCustomer}
              customerSearch={customerSearch}
              setCustomerSearch={setCustomerSearch}
              setSelectedCustomer={setSelectedCustomer}
              setCustomerModalOpen={setCustomerModalOpen}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              searchProducts={searchProducts}
              barcodeSearch={barcodeSearch}
              setBarcodeSearch={setBarcodeSearch}
              barcodeSearchInputRef={barcodeSearchInputRef}
              productSearchInputRef={productSearchInputRef}
            />
          </Col>

          {/* Coluna Central: Grid de Produtos */}
          <Col lg={5}>
            <ProductGrid
              products={productResults}
              addToCart={addToCart}
              isPdvDisabled={isPdvDisabled}
            />
          </Col>

          {/* Coluna da Direita: Venda Atual */}
          <div ref={saleColumnRef} className="col-lg-4">
            <SaleColumn
              cart={cart}
              returnMode={returnMode}
              handleUpdateQuantity={handleUpdateQuantity}
              handleUpdateItemDiscount={handleUpdateItemDiscount}
              calculateItemTotal={calculateItemTotal}
              handleRemoveItem={handleRemoveItem}
              isCartDisabled={isCartDisabled}
              subtotal={subtotal}
              calculateTotalDiscount={calculateTotalDiscount}
              totalAmount={totalAmount()}
              paymentMethods={paymentMethods}
              handleFinalizeSale={togglePaymentModal}
              handleSuspendSale={handleSuspendSale}
              handleClearSale={handleClearSale}
            />
          </div>
        </Row>
      </>
    );
  };

  return (
    <React.Fragment>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="page-content" style={{ padding: '15px' }}>
        <Container fluid>
          {renderContent()}
        </Container>
      </div>
      
      {/* Modais */}
      <CashierModal
        isOpen={cashierModalOpen}
        toggle={toggleCashierModal}
        cashierStatus={cashierStatus}
        onCashierUpdate={onCashierUpdate}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        toggle={togglePaymentModal}
        totalAmount={totalAmount()}
        finalizeSale={handleFinalizeSale}
        paymentMethods={paymentMethods}
        loading={loading}
        cart={cart}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        toggle={() => setSuccessModalOpen(false)}
        saleDetails={saleSuccessModalData}
        onPrintReceipt={handlePrintReceiptFromSuccessModal}
        onNewSale={handleNewSaleFromSuccessModal}
      />
    </React.Fragment>
  );
};

export default Pdv;
