// Assuming API_BASE_URL is configured elsewhere, e.g., in '../config/constants'
import { API_BASE_URL } from '../config/constants';

// --- Type Definitions ---
export interface Permission {
  id: number;
  action: string;
  subject: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
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
 * Fetches all available permissions.
 */
export const fetchAllPermissions = async (token: string): Promise<Permission[]> => {
  const response = await fetch(`${API_BASE_URL}/api/permissions`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

/**
 * Fetches all roles, including their assigned permissions.
 */
export const fetchAllRoles = async (token: string): Promise<Role[]> => {
  const response = await fetch(`${API_BASE_URL}/api/roles`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

/**
 * Creates a new role.
 * @param token - The authentication token.
 * @param roleData - The data for the new role.
 */
export const createRole = async (token: string, roleData: { name: string; permissionIds?: number[] }): Promise<Role> => {
  const response = await fetch(`${API_BASE_URL}/api/roles`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(roleData),
  });
  return handleResponse(response);
};

/**
 * Updates an existing role.
 * @param token - The authentication token.
 * @param roleId - The ID of the role to update.
 * @param roleData - The data to update.
 */
export const updateRole = async (token: string, roleId: number, roleData: { name?: string; permissionIds?: number[] }): Promise<Role> => {
  const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(roleData),
  });
  return handleResponse(response);
};

/**
 * Deletes a role.
 * @param token - The authentication token.
 * @param roleId - The ID of the role to delete.
 */
export const deleteRole = async (token: string, roleId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  await handleResponse(response);
};
