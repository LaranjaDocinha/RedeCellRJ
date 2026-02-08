import { LoaderFunctionArgs } from 'react-router-dom';
import api from '../services/api';

export const customerLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const page = url.searchParams.get('page') || '1';

  try {
    const response = await api.get(`customers?searchTerm=${search}&page=${page}`);
    // If backend returns data wrapped in data: { ... }
    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to load customers:', error);
    return { customers: [], totalCustomers: 0 };
  }
};
