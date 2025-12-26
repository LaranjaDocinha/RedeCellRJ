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
  params.append('limit', limit.toString());
  params.append('offset', ((page - 1) * limit).toString());
  if (sortBy) {
    params.append('sortBy', sortBy);
  }
  if (sortOrder) {
    params.append('sortDirection', sortOrder.toUpperCase());
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  // Backend returns { products, totalCount }
  return { 
    products: data.products || [], 
    totalCount: data.totalCount || 0 
  };
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

export const createProduct = async (productData: any, token: string): Promise<Product> => {

  const response = await fetch(`${API_BASE_URL}/api/products`, {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'Authorization': `Bearer ${token}`

    },

    body: JSON.stringify(productData),

  });

  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(errorData.message || 'Failed to create product');

  }

  return response.json();

};



export const updateProduct = async (id: number | string, productData: any, token: string): Promise<Product> => {

  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {

    method: 'PUT',

    headers: {

      'Content-Type': 'application/json',

      'Authorization': `Bearer ${token}`

    },

    body: JSON.stringify(productData),

  });

  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(errorData.message || 'Failed to update product');

  }

  return response.json();

};
