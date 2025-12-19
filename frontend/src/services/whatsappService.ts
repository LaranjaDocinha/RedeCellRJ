import api from './api';

export interface WhatsappTemplate {
  id?: number;
  name: string;
  content: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const whatsappService = {
  getTemplates: async (): Promise<WhatsappTemplate[]> => {
    const response = await api.get('/whatsapp/templates');
    return response.data;
  },

  upsertTemplate: async (data: { name: string; content: string }): Promise<void> => {
    await api.post('/whatsapp/templates', data);
  },

  deleteTemplate: async (name: string): Promise<void> => {
    await api.delete(`/whatsapp/templates/${name}`);
  },
};
