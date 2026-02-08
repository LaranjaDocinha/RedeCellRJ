import { LoaderFunctionArgs } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const customerLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const page = url.searchParams.get('page') || '1';
  const token = localStorage.getItem('token') || '';

  try {
    const response = await axios.get(`${API_BASE_URL}/api/customers?searchTerm=${search}&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { customers, totalCustomers }
  } catch (error) {
    console.error('Failed to load customers:', error);
    return { customers: [], totalCustomers: 0 };
  }
};
