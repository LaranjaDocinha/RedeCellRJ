import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useStockTransferStore = create((set, get) => ({
  transfers: [],
  loading: false,
  error: null,

  // Fetch all stock transfers
  fetchTransfers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/stock/transfers`, {
        withCredentials: true,
      });
      set({ transfers: response.data, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Create a new stock transfer request
  createTransfer: async (transferData) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/stock/transfers`, transferData, {
        withCredentials: true,
      });
      await get().fetchTransfers(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Complete a stock transfer
  completeTransfer: async (transferId) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`${API_URL}/stock/transfers/${transferId}/complete`, {}, {
        withCredentials: true,
      });
      await get().fetchTransfers(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Cancel a stock transfer
  cancelTransfer: async (transferId) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`${API_URL}/stock/transfers/${transferId}/cancel`, {}, {
        withCredentials: true,
      });
      await get().fetchTransfers(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));

export default useStockTransferStore;
