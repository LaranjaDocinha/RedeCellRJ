vi.mock('../services/productService');
vi.mock('../contexts/AuthContext');
vi.mock('../contexts/NotificationContext');

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { useProduct } from './useProduct';
import * as authContext from '../contexts/AuthContext';
import * as notificationContext from '../contexts/NotificationContext';
import * as productService from '../services/productService';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
});

describe('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContext, 'useAuth').mockReturnValue({ token: 'test-token', isAuthenticated: true, user: { id: '1', name: 'test' }, login: vi.fn(), logout: vi.fn(), loading: false });
    vi.spyOn(notificationContext, 'useNotification').mockReturnValue({ addToast: vi.fn() });
  });

  it('should fetch a single product successfully', async () => {
    const mockProduct = { id: '1', name: 'Product 1', sku: 'SKU001', branch_id: 1, variations: [{ price: 100, image_url: 'img1.jpg' }] };
    vi.spyOn(productService, 'fetchProductById').mockResolvedValue(mockProduct);

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );

    const { result } = renderHook(() => useProduct('1'), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.product).toEqual(mockProduct);
    expect(result.current.isError).toBe(false);
  });

  it('should handle fetch single product error', async () => {
    const errorMessage = 'Failed to fetch product';
    vi.spyOn(productService, 'fetchProductById').mockRejectedValue(new Error(errorMessage));

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );

    const { result } = renderHook(() => useProduct('1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.product).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    
    await waitFor(() => {
        expect(notificationContext.useNotification().addToast).toHaveBeenCalledWith(
        `Falha ao buscar produto: ${errorMessage}`,
        'error'
        );
    });
  });

  it('should not fetch if productId is empty', () => {
    const fetchSpy = vi.spyOn(productService, 'fetchProductById');

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );

    const { result } = renderHook(() => useProduct(''), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.product).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});