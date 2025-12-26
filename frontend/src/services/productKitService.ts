import { API_BASE_URL } from '../config/constants';
import { CreateProductKitDTO, ProductKit, UpdateProductKitDTO } from '../types/productKit';

export const productKitService = {
  getAllProductKits: async (token: string): Promise<ProductKit[]> => {
    const response = await fetch(`${API_BASE_URL}/api/product-kits`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getProductKitById: async (id: number, token: string): Promise<ProductKit> => {
    const response = await fetch(`${API_BASE_URL}/api/product-kits/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  createProductKit: async (data: CreateProductKitDTO, token: string): Promise<ProductKit> => {
    const response = await fetch(`${API_BASE_URL}/api/product-kits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  updateProductKit: async (id: number, data: UpdateProductKitDTO, token: string): Promise<ProductKit> => {
    const response = await fetch(`${API_BASE_URL}/api/product-kits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async deleteProductKit(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/product-kits/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete product kit');
  },

  async kitAssemble(id: number, quantity: number, branchId: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/product-kits/${id}/kit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity, branchId }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to assemble kit');
    }
  },

  async dekitDisassemble(id: number, quantity: number, branchId: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/product-kits/${id}/dekit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity, branchId }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to disassemble kit');
    }
  }
};
