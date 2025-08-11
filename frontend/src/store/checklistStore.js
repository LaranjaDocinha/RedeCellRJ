import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useChecklistStore = create((set, get) => ({
  templates: [],
  loading: false,
  error: null,

  // Fetch all checklist templates
  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/checklists/templates`, {
        withCredentials: true, // Important for sending cookies
      });
      set({ templates: response.data, loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Create a new checklist template
  createTemplate: async (templateData) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/checklists/templates`, templateData, {
        withCredentials: true,
      });
      // Refresh the list after creating
      await get().fetchTemplates();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update a checklist template
  updateTemplate: async (templateId, templateData) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`${API_URL}/checklists/templates/${templateId}`, templateData, {
        withCredentials: true,
      });
      // Refresh the list after updating
      await get().fetchTemplates();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Delete a checklist template
  deleteTemplate: async (templateId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/checklists/templates/${templateId}`, {
        withCredentials: true,
      });
      // Refresh the list after deleting
      set(state => ({ templates: state.templates.filter(t => t.id !== templateId), loading: false }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));

export default useChecklistStore;
