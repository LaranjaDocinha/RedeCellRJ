import { Product } from '../types/product';
import api from './api';

export const fetchAllProducts = async (token: string, searchTerm?: string, category?: string, page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ products: Product[], totalCount: number }> => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (category) params.append('category', category);
  params.append('limit', limit.toString());
  params.append('offset', ((page - 1) * limit).toString());
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortDirection', sortOrder.toUpperCase());

  const response = await api.get(`products?${params.toString()}`);
  const data = response.data.data || response.data;
  
  return { 
    products: data.products || [], 
    totalCount: data.totalCount || 0 
  };
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`products/${id}`);
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`products/${id}`);
  return response.data.data || response.data;
};

export const createProduct = async (productData: any): Promise<Product> => {
  const response = await api.post('products', productData);
  return response.data.data || response.data;
};

export const updateProduct = async (id: number | string, productData: any): Promise<Product> => {
  const response = await api.put(`products/${id}`, productData);
  return response.data.data || response.data;
};
