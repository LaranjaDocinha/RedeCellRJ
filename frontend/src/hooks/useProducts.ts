import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllProducts, deleteProduct } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export const useProducts = (searchTerm?: string, category?: string, page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
  const { token } = useAuth();
  const { addToast } = useNotification();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', searchTerm, category, page, limit, sortBy, sortOrder],
    queryFn: () => fetchAllProducts(token!, searchTerm, category, page, limit, sortBy, sortOrder), // Ensure token is available
    enabled: !!token, // Only run query if token exists
  });

  return {
    products: productsQuery.data?.products,
    totalCount: productsQuery.data?.totalCount,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    refetch: productsQuery.refetch,
    deleteProduct: deleteProductMutation.mutate,
  };
};
