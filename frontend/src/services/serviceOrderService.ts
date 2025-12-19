import { API_BASE_URL } from '../config/constants';

// --- Type Definitions ---
export interface ServiceOrder {
  id: number;
  customer_id: string; // UUID
  user_id: string; // UUID
  technician_id?: string; // UUID
  product_description: string;
  imei?: string;
  entry_checklist: Record<string, any>; // JSONB
  issue_description: string;
  technical_report?: string;
  budget_value?: number;
  status: string; // service_order_status enum
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderItem {
  id: number;
  service_order_id: number;
  part_id?: number;
  service_description?: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface ServiceOrderComment {
  id: number;
  service_order_id: number;
  user_id: string;
  comment_text: string;
  created_at: string;
}

export interface ServiceOrderAttachment {
  id: number;
  service_order_id: number;
  file_path: string;
  file_type: string;
  description?: string;
  uploaded_by_user_id: string;
  created_at: string;
}

// --- Helper Functions ---
const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) { // No Content
    return null;
  }
  return response.json();
};

// --- API Service Functions ---

/**
 * Fetches all service orders with optional filters.
 */
export const fetchAllServiceOrders = async (
  token: string,
  filters?: { status?: string; customerId?: string; technicianId?: string; startDate?: string; endDate?: string },
): Promise<ServiceOrder[]> => {
  const params = new URLSearchParams();
  if (filters) {
    for (const key in filters) {
      const value = (filters as any)[key];
      if (value) {
        params.append(key, value);
      }
    }
  }
  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/service-orders${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

/**
 * Fetches a single service order by ID.
 */
export const fetchServiceOrderById = async (token: string, id: number): Promise<ServiceOrder> => {
  const response = await fetch(`${API_BASE_URL}/api/service-orders/${id}`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

/**
 * Creates a new service order.
 */
export const createServiceOrder = async (
  token: string,
  serviceOrderData: Omit<ServiceOrder, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: string },
): Promise<ServiceOrder> => {
  const response = await fetch(`${API_BASE_URL}/api/service-orders`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(serviceOrderData),
  });
  return handleResponse(response);
};

/**
 * Updates an existing service order.
 */
export const updateServiceOrder = async (
  token: string,
  id: number,
  serviceOrderData: Partial<Omit<ServiceOrder, 'id' | 'created_at' | 'updated_at'>>,
): Promise<ServiceOrder> => {
  const response = await fetch(`${API_BASE_URL}/api/service-orders/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(serviceOrderData),
  });
  return handleResponse(response);
};

/**
 * Changes the status of a service order.
 */
export const changeServiceOrderStatus = async (token: string, id: number, status: string): Promise<ServiceOrder> => {
  const response = await fetch(`${API_BASE_URL}/api/service-orders/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

/**
 * Deletes a service order.
 */
export const deleteServiceOrder = async (token: string, id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/service-orders/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  await handleResponse(response);
};

/**
 * Fetches comments for a service order.
 */
export const fetchServiceOrderComments = async (token: string, id: number): Promise<ServiceOrderComment[]> => {
  const response = await fetch(`${API_BASE_URL}/api/service-orders/${id}/comments`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

/**
 * Adds a comment to a service order.
 */
export const addServiceOrderComment = async (token: string, id: number, commentText: string): Promise<ServiceOrderComment> => {
  const response = await fetch(`${API_BASE_URL}/api/service-orders/${id}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ comment_text: commentText }),
  });
  return handleResponse(response);
};

/**
 * Adds an item to a service order.
 */
export const addServiceOrderItem = async (token: string, id: number, itemData: Omit<ServiceOrderItem, 'id' | 'service_order_id' | 'created_at'>): Promise<ServiceOrderItem> => {
  const response = await fetch(`${API_BASE_URL}/api/service-orders/${id}/items`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(itemData),
  });
  return handleResponse(response);
};

// TODO: Add functions for attachments, technician suggestion, QR code, etc. as needed.
