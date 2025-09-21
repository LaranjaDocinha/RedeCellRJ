
const API_URL = '/api/user-dashboard';

export const getSettings = async (token: string) => {
  const response = await fetch(`${API_URL}/settings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user dashboard settings');
  }
  return response.json();
};

export const updateSettings = async (token: string, settings: any) => {
  const response = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to update user dashboard settings');
  }
  return response.json();
};
