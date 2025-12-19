import { API_BASE_URL } from '../config/constants';

// --- Type Definitions ---
export interface ProductVariation {
  id: number;
  product_id: number;
  sku: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  color?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  price?: number; // Base price, variations might have their own
  stock_quantity?: number; // Base stock, variations might have their own
  branch_id?: number;
  category_id?: number;
  variations?: ProductVariation[]; // Array of variations
  is_used?: boolean;
  condition?: string;
  acquisition_date?: string;
}

// --- Helper Functions ---
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// --- API Service Functions ---

/**
 * Fetches all public products with optional search term.
 */
export const fetchAllPublicProducts = async (searchTerm?: string): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/public-products${queryString ? `?${queryString}` : ''}`);
  return handleResponse(response);
};

/**
 * Fetches a single public product by ID.
 */
export const fetchPublicProductById = async (id: number): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/public-products/${id}`);
  return handleResponse(response);
};

// TODO: Add other public product-related API calls here as needed (e.g., by category, filters)
