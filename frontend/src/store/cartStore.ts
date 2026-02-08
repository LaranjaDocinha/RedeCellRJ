import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  variation_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  sku?: string;
  color?: string;
  storage_capacity?: string;
  is_serialized?: boolean;
  serial_numbers?: string[];
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variationId: number) => void;
  updateQuantity: (variationId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.variation_id === item.variation_id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.variation_id === item.variation_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (variationId) => set((state) => ({
        items: state.items.filter((i) => i.variation_id !== variationId),
      })),

      updateQuantity: (variationId, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.variation_id === variationId ? { ...i, quantity: Math.max(0, quantity) } : i
        ).filter(i => i.quantity > 0),
      })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'redecell-cart-storage', // Nome da chave no localStorage
    }
  )
);
