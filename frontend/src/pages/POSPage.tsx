import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/NotificationProvider';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector'; // Import PaymentMethodSelector
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface ProductVariation {
  id: number;
  product_id: number;
  color: string;
  price: string;
  stock_quantity: number;
  product_name?: string; // Adicionado para exibição
}

interface CartItem extends ProductVariation {
  quantity: number;
  subtotal: number;
}

const POSPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductVariation[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(''); // New state for payment method
  const [couponCode, setCouponCode] = useState<string>(''); // New state for coupon code
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // New state for applied discount amount
  const { addNotification } = useNotification();
  const { token, user } = useAuth();
  const { t } = useTranslation(); // Initialize useTranslation

  const fetchProducts = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      // Simular busca por variações de produtos
      const response = await fetch(`http://localhost:3000/products?search=${term}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      // Flatten variations and add product name
      const variations = products.flatMap((p: any) =>
        p.variations.map((v: any) => ({ ...v, product_name: p.name }))
      );
      setSearchResults(variations);
    } catch (error: any) {
      addNotification(t('search_failed', { message: error.message }), 'error');
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, t]); // Add t to dependency array

  const addToCart = (variation: ProductVariation) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === variation.id);
      if (existingItem) {
        const updatedCart = prevCart.map((item) =>
          item.id === variation.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * parseFloat(item.price) }
            : item
        );
        addNotification(t('added_another_to_cart', { productName: variation.product_name, color: variation.color }), 'info');
        return updatedCart;
      } else {
        const newItem: CartItem = {
          ...variation,
          quantity: 1,
          subtotal: parseFloat(variation.price),
        };
        addNotification(t('added_to_cart', { productName: variation.product_name, color: variation.color }), 'success');
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (variationId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== variationId);
      addNotification(t('item_removed_from_cart'), 'info');
      return updatedCart;
    });
  };

  const updateCartItemQuantity = (variationId: number, newQuantity: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === variationId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * parseFloat(item.price) }
          : item
      );
      return updatedCart.filter((item) => item.quantity > 0); // Remove if quantity is 0
    });
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    return (subtotal - appliedDiscount).toFixed(2);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      addNotification(t('enter_coupon_code'), 'warning');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/coupons/${couponCode}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('coupon_not_found'));
      }
      const coupon = await response.json();

      const currentSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
      let discountAmount = 0;

      if (coupon.type === 'percentage') {
        discountAmount = currentSubtotal * coupon.value;
      } else if (coupon.type === 'fixed_amount') {
        discountAmount = coupon.value;
      }

      if (coupon.min_purchase_amount && currentSubtotal < coupon.min_purchase_amount) {
        addNotification(t('min_purchase_not_met', { amount: coupon.min_purchase_amount }), 'warning');
        return;
      }

      setAppliedDiscount(discountAmount);
      addNotification(t('coupon_applied', { discount: discountAmount.toFixed(2) }), 'success');
    } catch (error: any) {
      addNotification(t('failed_to_apply_coupon', { message: error.message }), 'error');
      setAppliedDiscount(0);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      addNotification(t('cart_is_empty'), 'warning');
      return;
    }
    if (!selectedPaymentMethod) {
      addNotification(t('select_payment_method'), 'warning');
      return;
    }

    try {
      const saleItems = cart.map((item) => ({
        product_id: item.product_id,
        variation_id: item.id,
        quantity: item.quantity,
      }));

      const response = await fetch('http://localhost:3000/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ items: saleItems, paymentMethod: selectedPaymentMethod, couponCode: couponCode || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('failed_to_create_sale'));
      }

      addNotification(t('sale_completed_successfully'), 'success');
      setCart([]); // Clear cart
      setAppliedDiscount(0); // Clear applied discount
      setCouponCode(''); // Clear coupon code
      setSelectedPaymentMethod(''); // Clear selected payment method
    } catch (error: any) {
      addNotification(t('checkout_failed', { message: error.message }), 'error');
    }
  };

  const searchColumns = [
    { key: 'product_name', header: t('product') },
    { key: 'color', header: t('color') },
    { key: 'price', header: t('price') },
    { key: 'stock_quantity', header: t('stock') },
    {
      key: 'actions',
      header: t('actions'),
      render: (item: ProductVariation) => (
        <Button label={t('add')} size="small" onClick={() => addToCart(item)} />
      ),
    },
  ];

  const cartColumns = [
    { key: 'product_name', header: t('product') },
    { key: 'color', header: t('color') },
    { key: 'price', header: t('price') },
    {
      key: 'quantity',
      header: t('qty'),
      render: (item: CartItem) => (
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value))}
          style={{ width: '60px' }}
        />
      ),
    },
    { key: 'subtotal', header: t('subtotal') },
    {
      key: 'actions',
      header: t('actions'),
      render: (item: CartItem) => (
        <Button label={t('remove')} variant="danger" size="small" onClick={() => removeFromCart(item.id)} />
      ),
    },
  ];

  return (
    <POSContainer>
      <h1>{t('point_of_sale')}</h1>

      <POSLayout>
        <POSSection>
          <h2>{t('search_products')}</h2>
          <SearchInputWrapper>
            <Input
              placeholder={t('search_product_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputWrapper>
          <Table data={searchResults} columns={searchColumns} />
        </POSSection>

        <POSSection>
          <h2>{t('cart')}</h2>
          <Table data={cart} columns={cartColumns} />
          <CartSummary>
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder={t('coupon_code_placeholder')}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow"
                />
                <Button label={t('apply_coupon')} onClick={handleApplyCoupon} />
              </div>
              {appliedDiscount > 0 && (
                <p className="text-green-600">{t('discount_applied')}: -${appliedDiscount.toFixed(2)}</p>
              )}
            </div>
            <PaymentMethodSelector
              onSelect={setSelectedPaymentMethod}
              selectedMethod={selectedPaymentMethod}
              availableMethods={['credit_card', 'pix', 'cash']}
            />
            <h3>{t('total')}: ${calculateTotal()}</h3>
            <CheckoutButton onClick={handleCheckout} disabled={cart.length === 0 || !selectedPaymentMethod}>
              {t('checkout')}
            </CheckoutButton>
          </CartSummary>
        </POSSection>
      </POSLayout>
    </POSContainer>
  );
};