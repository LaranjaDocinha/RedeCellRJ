import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

const API_URL = '/api/kanban';

export const useKanbanApi = () => {
  const { token } = useAuth();

  const getBoard = useCallback(async () => {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch board');
    }
    return response.json();
  }, [token]);

  const moveCard = useCallback(async (data: { cardId: string | number; newColumnId: string | number; newPosition: number }) => {
    const response = await fetch(`${API_URL}/cards/move`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to move card');
    }
    return response.json();
  }, [token]);

  const moveColumn = useCallback(async (data: { columnId: string | number; newPosition: number }) => {
    const response = await fetch(`${API_URL}/columns/move`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to move column');
    }
    return response.json();
  }, [token]);

  const updateCard = useCallback(async (data: any) => {
    const response = await fetch(`${API_URL}/cards/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update card');
    }
    return response.json();
  }, [token]);

  const createCard = useCallback(async (data: { columnId: string | number; title: string; description?: string }) => {
    const response = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create card');
    }
    return response.json();
  }, [token]);

  const deleteCard = useCallback(async (cardId: string | number) => {
    const response = await fetch(`${API_URL}/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete card');
    }
    return response.json();
  }, [token]);

  return {
    getBoard,
    moveCard,
    moveColumn,
    updateCard,
    createCard,
    deleteCard,
  };
};