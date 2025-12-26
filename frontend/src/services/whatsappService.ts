import { API_BASE_URL } from '../config/constants';

export interface WhatsappTemplate {
  id?: number;
  name: string;
  content: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const whatsappService = {
  getTemplates: async (token: string): Promise<WhatsappTemplate[]> => {
    const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates`, {
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  upsertTemplate: async (data: { name: string; content: string }, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  deleteTemplate: async (name: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates/${name}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};