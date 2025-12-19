import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'shoppingCart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const storedCart = window.localStorage.getItem(CART_KEY);
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to localStorage', error);
        }
    }, [cartItems]);

    const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === itemToAdd.id);
            if (existingItem) {
                return prevItems.map(item => 
                    item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...itemToAdd, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
            ).filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};