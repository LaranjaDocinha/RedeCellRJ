import api from './api';

export const fetchAllCategories = async () => {
  const response = await api.get('categories');
  return response.data.data || response.data;
};
