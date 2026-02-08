import { API_BASE_URL } from '../config/constants';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  loyalty_points?: number;
  store_credit_balance?: number;
}

export const fetchAllCustomers = async (token: string, search?: string): Promise<Customer[]> => {
  const url = new URL(`${API_BASE_URL}/api/customers`);
  if (search) url.searchParams.append('search', search);

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
};

export const createCustomer = async (data: Partial<Customer>, token: string): Promise<Customer> => {
  const response = await fetch(`${API_BASE_URL}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to create customer');
  return response.json();
};

export const updateCustomer = async (id: string, data: Partial<Customer>, token: string): Promise<Customer> => {
  const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update customer');
  return response.json();
};
