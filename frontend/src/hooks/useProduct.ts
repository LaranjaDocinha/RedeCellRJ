import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export const useProduct = (productId: string) => {
  const { token } = useAuth();
  const { addToast } = useNotification();

  const productQuery = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId, token!),
    enabled: !!token && !!productId, // Only run query if token and productId exist
    onError: (error: any) => {
      addToast(`Falha ao buscar detalhes do produto: ${error.message}`, 'error');
    },
  });

  return {
    product: productQuery.data,
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error,
    refetch: productQuery.refetch,
  };
};
