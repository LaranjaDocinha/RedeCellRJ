import { LoaderFunctionArgs } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const customerPortalLoader = async ({ params }: LoaderFunctionArgs) => {
  const { token } = params;
  if (!token) throw new Error('Token is required');

  try {
    const response = await axios.get(`${API_BASE_URL}/portal/orders/${token}`);
    return { order: response.data };
  } catch (error) {
    console.error('Failed to load customer portal data:', error);
    throw new Error('Failed to load order');
  }
};
