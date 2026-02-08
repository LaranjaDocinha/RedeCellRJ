import api from './api';
import type { ServiceOrder } from '../types/serviceOrder';

const API_URL = '/service-orders';

export const getServiceOrders = async (token?: string, filters: { status?: string; customer_name?: string } = {}): Promise<ServiceOrder[]> => {
  try {
    const response = await api.get(API_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching service orders:', error);
    throw error;
  }
};

export const getServiceOrderById = async (token: string, id: string): Promise<ServiceOrder> => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service order with id ${id}:`, error);
    throw error;
  }
};