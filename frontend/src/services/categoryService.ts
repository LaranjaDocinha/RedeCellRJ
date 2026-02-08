import { API_BASE_URL } from '../config/constants';

export const fetchAllCategories = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  // Se o backend usar o ResponseHelper, os dados estarão em data.data
  return data.data || data;
};
