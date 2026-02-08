import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from './CartContext';

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;

  it('should start with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartItems).toEqual([]);
  });

  it('should add items to cart and increment quantity if duplicate', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = { id: 1, name: 'Product 1', price: 100 };

    act(() => {
      result.current.addToCart(item);
    });
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(1);

    act(() => {
      result.current.addToCart(item);
    });
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = { id: 1, name: 'Product 1', price: 100 };

    act(() => {
      result.current.addToCart(item);
    });
    
    act(() => {
      // Use numeric ID as expected by context
      result.current.updateQuantity(1 as any, 5);
    });

    expect(result.current.cartItems[0].quantity).toBe(5);
  });

  it('should remove items from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = { id: 1, name: 'Product 1', price: 100 };

    act(() => {
      result.current.addToCart(item);
    });

    act(() => {
      // Use numeric ID
      result.current.removeFromCart(1 as any);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it('should clear all items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart({ id: 1, name: 'P1', price: 10 });
      result.current.addToCart({ id: 2, name: 'P2', price: 20 });
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
  });
});