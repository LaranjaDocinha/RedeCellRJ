import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch all products with their variations
      const response = await axios.get(`${API_URL}/products?limit=9999`, { // Fetch a large number to get all
        withCredentials: true,
      });
      set({ products: response.data.products, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));

export default useProductStore;
