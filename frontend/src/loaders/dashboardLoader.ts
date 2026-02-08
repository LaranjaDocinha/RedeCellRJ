import { LoaderFunctionArgs } from 'react-router-dom';
import api from '../services/api';

export const dashboardLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'thisMonth';

  // Chamada ao endpoint do dashboard usando nosso cliente padronizado
  try {
    const response = await api.get(`dashboard?period=${period}`);
    // Nossa API retorna { status: 'success', data: ... }
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return null;
  }
};
