import { API_BASE_URL } from '../config/constants';

// --- Type Definitions ---
export interface LoyaltyTier {
  id: number;
  name: string;
  min_points: number;
  benefits_description?: string;
  benefits?: Record<string, any>; // Flexible JSONB for benefits
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string; // UUID
  user_id?: string; // UUID
  customer_id?: string; // UUID
  points_change: number;
  transaction_type: string;
  related_entity_id?: string; // UUID
  created_at: string;
}

export interface UserLoyaltyInfo {
  loyalty_points: number;
  current_tier?: LoyaltyTier;
  next_tier?: LoyaltyTier;
  points_to_next_tier?: number;
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
 * Fetches the loyalty points and current tier information for the logged-in user.
 */
export const fetchUserLoyaltyInfo = async (token: string): Promise<UserLoyaltyInfo> => {
  const response = await fetch(`${API_BASE_URL}/api/loyalty/points`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

/**
 * Fetches the loyalty transaction history for the logged-in user.
 */
export const fetchLoyaltyTransactions = async (token: string): Promise<LoyaltyTransaction[]> => {
  const response = await fetch(`${API_BASE_URL}/api/loyalty/transactions`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

/**
 * Fetches all available loyalty tiers.
 */
export const fetchAllLoyaltyTiers = async (token: string): Promise<LoyaltyTier[]> => {
  const response = await fetch(`${API_BASE_URL}/api/loyalty-tiers`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

/**
 * Adds loyalty points to a specific user (admin/manager function).
 */
export const addLoyaltyPoints = async (token: string, userId: string, points: number, reason: string): Promise<{ loyalty_points: number }> => {
  const response = await fetch(`${API_BASE_URL}/api/loyalty/add-points`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ userId, points, reason }),
  });
  return handleResponse(response);
};

/**
 * Redeems loyalty points for the logged-in user.
 */
export const redeemLoyaltyPoints = async (token: string, points: number, reason: string): Promise<{ loyalty_points: number }> => {
  const response = await fetch(`${API_BASE_URL}/api/loyalty/redeem-points`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ points, reason }),
  });
  return handleResponse(response);
};

/**
 * Creates a new loyalty tier.
 */
export const createLoyaltyTier = async (token: string, tierData: Omit<LoyaltyTier, 'id' | 'created_at' | 'updated_at'>): Promise<LoyaltyTier> => {
  const response = await fetch(`${API_BASE_URL}/api/loyalty-tiers`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(tierData),
  });
  return handleResponse(response);
};

/**
 * Updates an existing loyalty tier.
 */
export const updateLoyaltyTier = async (token: string, tierId: number, tierData: Partial<Omit<LoyaltyTier, 'id' | 'created_at' | 'updated_at'>>): Promise<LoyaltyTier> => {
  const response = await fetch(`${API_BASE_URL}/api/loyalty-tiers/${tierId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(tierData),
  });
  return handleResponse(response);
};

/**
 * Deletes a loyalty tier.
 */
export const deleteLoyaltyTier = async (token: string, tierId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/loyalty-tiers/${tierId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  await handleResponse(response);
};
