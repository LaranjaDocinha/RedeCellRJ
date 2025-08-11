import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useRepairStore = create((set, get) => ({
  repairDetails: null,
  checklists: [],
  loading: false,
  error: null,

  // Fetch all data for a single repair
  fetchRepairData: async (repairId) => {
    set({ loading: true, error: null });
    try {
      const detailsPromise = axios.get(`${API_URL}/repairs/${repairId}`, { withCredentials: true });
      const checklistsPromise = axios.get(`${API_URL}/repairs/${repairId}/checklists`, { withCredentials: true });

      const [detailsResponse, checklistsResponse] = await Promise.all([detailsPromise, checklistsPromise]);

      set({
        repairDetails: detailsResponse.data,
        checklists: checklistsResponse.data,
        loading: false,
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Assign a checklist template to the current repair
  assignChecklist: async (repairId, templateId, type) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/repairs/${repairId}/checklists`, { template_id: templateId, type }, {
        withCredentials: true,
      });
      // Refresh the checklists for the repair
      await get().fetchRepairData(repairId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Save answers for a specific checklist instance
  saveChecklistAnswers: async (repairId, instanceId, answers) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`${API_URL}/repairs/${repairId}/checklists/${instanceId}`, { answers }, {
        withCredentials: true,
      });
      // Refresh data to show updated answers and status
      await get().fetchRepairData(repairId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

}));

export default useRepairStore;
