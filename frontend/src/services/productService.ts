import { Product } from '../types/product'; // Assuming a product type exists or will be created
import { API_BASE_URL } from '../config/constants'; // Assuming a constants file for base URL

export const fetchAllProducts = async (token: string, searchTerm?: string, category?: string, page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ products: Product[], totalCount: number }> => {
  const params = new URLSearchParams();
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  if (category) {
    params.append('category', category);
  }
  params.append('_page', page.toString());
  params.append('_limit', limit.toString());
  if (sortBy) {
    params.append('_sort', sortBy);
  }
  if (sortOrder) {
    params.append('_order', sortOrder);
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
  const products: Product[] = await response.json();
  return { products, totalCount };
};

export const deleteProduct = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const fetchProductById = async (id: string, token: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Add other product-related API calls here as needed (e.g., createProduct, updateProduct)