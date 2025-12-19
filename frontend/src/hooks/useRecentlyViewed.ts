import { useState, useCallback } from 'react';

interface RecentlyViewedProduct {
    id: string;
    name: string;
    imageUrl: string;
}

const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_ITEMS = 5;

export const useRecentlyViewed = () => {
    const [items, setItems] = useState<RecentlyViewedProduct[]>(() => {
        try {
            const storedItems = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
            return storedItems ? JSON.parse(storedItems) : [];
        } catch (error) {
            console.error('Error reading from localStorage', error);
            return [];
        }
    });

    const addRecentlyViewed = useCallback((product: RecentlyViewedProduct) => {
        setItems(prevItems => {
            const newItems = [product, ...prevItems.filter(item => item.id !== product.id)];
            const limitedItems = newItems.slice(0, MAX_ITEMS);
            try {
                window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(limitedItems));
            } catch (error) {
                console.error('Error writing to localStorage', error);
            }
            return limitedItems;
        });
    }, []);

    return { recentlyViewedItems: items, addRecentlyViewed };
};