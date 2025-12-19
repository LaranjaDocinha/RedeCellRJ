import axios from 'axios';
import type { ServiceOrder } from '../types/serviceOrder';

const API_URL = '/api/service-orders';

export const getServiceOrders = async (filters: { status?: string; customer_name?: string } = {}): Promise<ServiceOrder[]> => {
  try {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching service orders:', error);
    throw error;
  }
};

export const getServiceOrderById = async (id: string): Promise<ServiceOrder> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service order with id ${id}:`, error);
    throw error;
  }
};
