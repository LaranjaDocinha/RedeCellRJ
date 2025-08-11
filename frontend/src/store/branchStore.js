import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useBranchStore = create((set, get) => ({
  branches: [],
  loading: false,
  error: null,

  fetchBranches: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/branches`, {
        withCredentials: true,
      });
      set({ branches: response.data, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));

export default useBranchStore;
