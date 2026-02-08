import { LoaderFunctionArgs } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const cashFlowLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate') || undefined;
  const endDate = url.searchParams.get('endDate') || undefined;
  const token = localStorage.getItem('token') || '';

  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await axios.get(`${API_BASE_URL}/api/v1/cash-flow?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const commissionsLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate') || undefined;
  const endDate = url.searchParams.get('endDate') || undefined;
  const token = localStorage.getItem('token') || '';

  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await axios.get(`${API_BASE_URL}/api/v1/commissions/my-performance?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
