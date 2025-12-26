import { useState, useCallback, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Product } from '../types/product'; // Assuming Product type is available

const COMPARISON_STORAGE_KEY = 'productComparison';
const MAX_COMPARISON_ITEMS = 4; // Limit to 4 products for comparison

export const useProductComparison = () => {
  const [comparisonList, setComparisonList] = useState<Product[]>(() => {
    try {
      const storedList = localStorage.getItem(COMPARISON_STORAGE_KEY);
      return storedList ? JSON.parse(storedList) : [];
    } catch (error) {
      console.error('Failed to parse product comparison list from localStorage', error);
      return [];
    }
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(comparisonList));
    } catch (error) {
      console.error('Failed to save product comparison list to localStorage', error);
    }
  }, [comparisonList]);

  const addProductToComparison = useCallback((product: Product) => {
    setComparisonList((prevList) => {
      if (prevList.some((item) => item.id === product.id)) {
        showNotification(`${product.name} já está na lista de comparação.`, 'info');
        return prevList;
      }
      if (prevList.length >= MAX_COMPARISON_ITEMS) {
        showNotification(`Você pode comparar no máximo ${MAX_COMPARISON_ITEMS} produtos.`, 'warning');
        return prevList;
      }
      showNotification(`${product.name} adicionado para comparação!`, 'success');
      return [...prevList, product];
    });
  }, [showNotification]);

  const removeProductFromComparison = useCallback((productId: number) => {
    setComparisonList((prevList) => {
      const updatedList = prevList.filter((item) => item.id !== productId);
      if (updatedList.length < prevList.length) {
        showNotification('Produto removido da lista de comparação.', 'info');
      }
      return updatedList;
    });
  }, [showNotification]);

  const clearComparisonList = useCallback(() => {
    setComparisonList([]);
    showNotification('Lista de comparação limpa.', 'info');
  }, [showNotification]);

  const isInComparisonList = useCallback((productId: number) => {
    return comparisonList.some((item) => item.id === productId);
  }, [comparisonList]);

  return {
    comparisonList,
    addProductToComparison,
    removeProductFromComparison,
    clearComparisonList,
    isInComparisonList,
    MAX_COMPARISON_ITEMS,
  };
};
