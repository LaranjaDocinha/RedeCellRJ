import { LoaderFunctionArgs } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const dashboardLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'thisMonth';
  const token = localStorage.getItem('token') || '';

  // Chamada ao endpoint do dashboard
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/dashboard?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Retornamos um objeto vazio ou erro para que o componente trate
    return null;
  }
};
