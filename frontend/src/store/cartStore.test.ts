import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('CartStore (Zustand)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  const mockItem = {
    id: 1,
    variation_id: 101,
    name: 'iPhone 15 Case',
    price: 100,
    quantity: 1
  };

  it('should add items and increment quantity for existing variations', () => {
    useCartStore.getState().addItem(mockItem);
    expect(useCartStore.getState().items).toHaveLength(1);
    
    useCartStore.getState().addItem({ ...mockItem, quantity: 2 });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('should correctly calculate total price', () => {
    useCartStore.getState().addItem(mockItem); // 100
    useCartStore.getState().addItem({ ...mockItem, variation_id: 102, price: 50, quantity: 2 }); // 100
    
    expect(useCartStore.getState().getTotal()).toBe(200);
  });

  it('should correctly count items', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem({ ...mockItem, variation_id: 102, quantity: 5 });
    
    expect(useCartStore.getState().getItemCount()).toBe(6);
  });

  it('should remove items correctly', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().removeItem(101);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('should update quantity and remove if quantity is 0', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQuantity(101, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    
    useCartStore.getState().updateQuantity(101, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
