
const API_URL = '/api/kanban'; // Assumes proxy is set up in package.json

export const getBoard = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch board');
  }
  return response.json();
};

export const moveCard = async (data: { cardId: string; newColumnId: string; newPosition: number }) => {
  const response = await fetch(`${API_URL}/cards/move`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to move card');
  }
  return response.json();
};

export const moveColumn = async (data: { columnId: string; newPosition: number }) => {
  const response = await fetch(`${API_URL}/columns/move`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to move column');
  }
  return response.json();
};

export const updateCard = async (data: any) => {
  const response = await fetch(`${API_URL}/cards/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update card');
  }
  return response.json();
};

export const createCard = async (data: { columnId: string; title: string; description?: string }) => {
  const response = await fetch(`${API_URL}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create card');
  }
  return response.json();
};

export const deleteCard = async (cardId: string) => {
  const response = await fetch(`${API_URL}/cards/${cardId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete card');
  }
  return response.json();
};
