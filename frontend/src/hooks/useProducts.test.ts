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
import { useProducts } from './useProducts';
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

describe('useProducts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(authContext, 'useAuth').mockReturnValue({ token: 'test-token', isAuthenticated: true, user: { id: '1', name: 'test' }, login: vi.fn(), logout: vi.fn(), loading: false });
        vi.spyOn(notificationContext, 'useNotification').mockReturnValue({ addToast: vi.fn() });
    });

    it('should fetch products successfully', async () => {
        const mockProducts = [
          { id: 1, name: 'Product 1', sku: 'SKU001', branch_id: 1, variations: [{ price: 100, image_url: 'img1.jpg' }] },
          { id: 2, name: 'Product 2', sku: 'SKU002', branch_id: 1, variations: [{ price: 200, image_url: 'img2.jpg' }] },
        ];
        vi.spyOn(productService, 'fetchAllProducts').mockResolvedValue(mockProducts);
    
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

        const { result } = renderHook(() => useProducts(), { wrapper });
    
        await waitFor(() => expect(result.current.isLoading).toBe(false));
    
        expect(result.current.products).toEqual(mockProducts);
        expect(result.current.isError).toBe(false);
    });

    it('should handle fetch products error', async () => {
        const errorMessage = 'Failed to fetch products';
        vi.spyOn(productService, 'fetchAllProducts').mockRejectedValue(new Error(errorMessage));

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

        const { result } = renderHook(() => useProducts(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.products).toBeUndefined();
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe(errorMessage);

        await waitFor(() => {
            expect(notificationContext.useNotification().addToast).toHaveBeenCalledWith(
            `Falha ao buscar produtos: ${errorMessage}`,
            'error'
            );
        });
    });

    it('should delete a product successfully', async () => {
        const mockProducts = [
          { id: 1, name: 'Product 1', sku: 'SKU001', branch_id: 1, variations: [{ price: 100, image_url: 'img1.jpg' }] },
        ];
        const fetchAllSpy = vi.spyOn(productService, 'fetchAllProducts').mockResolvedValue(mockProducts);
        const deleteSpy = vi.spyOn(productService, 'deleteProduct').mockResolvedValue(undefined);

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

        const { result } = renderHook(() => useProducts(), { wrapper });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await result.current.deleteProduct(1);

        await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith(1, 'test-token'));
        await waitFor(() => {
            expect(notificationContext.useNotification().addToast).toHaveBeenCalledWith(
            'Produto excluído com sucesso!',
            'success'
          );
        });
        
        await waitFor(() => expect(fetchAllSpy).toHaveBeenCalledTimes(2));
    });

    it('should handle delete product error', async () => {
        const errorMessage = 'Failed to delete product';
        const fetchAllSpy = vi.spyOn(productService, 'fetchAllProducts').mockResolvedValue([]);
        const deleteSpy = vi.spyOn(productService, 'deleteProduct').mockRejectedValue(new Error(errorMessage));

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

        const { result } = renderHook(() => useProducts(), { wrapper });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await result.current.deleteProduct(1);

        await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith(1, 'test-token'));
        await waitFor(() => {
            expect(notificationContext.useNotification().addToast).toHaveBeenCalledWith(
            `Falha ao excluir produto: ${errorMessage}`,
            'error'
          );
        });

        expect(fetchAllSpy).toHaveBeenCalledTimes(1);
    });
});