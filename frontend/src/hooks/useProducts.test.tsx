import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProducts } from './useProducts';
import * as productService from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock explicitamente as dependências
vi.mock('../services/productService');
vi.mock('../contexts/AuthContext');
vi.mock('../contexts/NotificationContext');

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('useProducts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    (useAuth as any).mockReturnValue({ token: 'fake-token' });
    (useNotification as any).mockReturnValue({ showNotification: vi.fn() });
  });

  it('should fetch and return products', async () => {
    const mockProducts = {
      products: [{ id: 1, name: 'iPhone' }],
      totalCount: 1
    };

    vi.spyOn(productService, 'fetchAllProducts').mockResolvedValue(mockProducts as any);

    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts.products);
    expect(result.current.totalCount).toBe(1);
  });

  it('should handle error during fetching', async () => {
    vi.spyOn(productService, 'fetchAllProducts').mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    
    expect(result.current.error).toBeDefined();
  });
});