import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface WishlistItem {
  id: number;
  name: string;
  imageUrl: string;
}

const WISHLIST_STORAGE_KEY = 'wishlist';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return storedWishlist ? JSON.parse(storedWishlist) : [];
    } catch (error) {
      console.error('Failed to parse wishlist from localStorage', error);
      return [];
    }
  });
  const { addToast } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Failed to save wishlist to localStorage', error);
    }
  }, [wishlist]);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prevWishlist) => {
      if (!prevWishlist.some((wishlistItem) => wishlistItem.id === item.id)) {
        addToast(`${item.name} adicionado à lista de desejos!`, 'success');
        return [...prevWishlist, item];
      }
      addToast(`${item.name} já está na lista de desejos.`, 'info');
      return prevWishlist;
    });
  }, [addToast]);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlist((prevWishlist) => {
      const updatedWishlist = prevWishlist.filter((item) => item.id !== id);
      if (updatedWishlist.length < prevWishlist.length) {
        addToast('Produto removido da lista de desejos.', 'info');
      }
      return updatedWishlist;
    });
  }, [addToast]);

  const isInWishlist = useCallback((id: number) => {
    return wishlist.some((item) => item.id === id);
  }, [wishlist]);

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
};
