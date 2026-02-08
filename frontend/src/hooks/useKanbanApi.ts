import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Column, Card } from '../types/kanban';

const API_URL = '/api/v1/kanban';

export const useKanbanApi = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const headers = { Authorization: `Bearer ${token}` };

  // 1. Hook de Busca (Query)
  const useBoard = () => useQuery<Column[]>({
    queryKey: ['kanbanBoard'],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, { headers });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  // 2. Mutação OTIMISTA para mover card
  const moveCardMutation = useMutation({
    mutationFn: async (data: { cardId: string | number; newColumnId: string | number; newPosition: number, assignee_id?: string }) => {
      const { data: response } = await axios.put(`${API_URL}/cards/move`, data, { headers });
      return response;
    },
    onMutate: async (moveData) => {
      await queryClient.cancelQueries({ queryKey: ['kanbanBoard'] });
      const previousBoard = queryClient.getQueryData<Column[]>(['kanbanBoard']);

      if (previousBoard) {
        queryClient.setQueryData(['kanbanBoard'], (old: Column[]) => {
          const newBoard = JSON.parse(JSON.stringify(old)) as Column[]; // Deep clone
          
          let movedCard: Card | undefined;
          // Remover do local de origem
          newBoard.forEach(col => {
            const cardIdx = col.cards.findIndex(c => String(c.id) === String(moveData.cardId));
            if (cardIdx !== -1) {
              movedCard = col.cards.splice(cardIdx, 1)[0];
            }
          });

          // Adicionar no destino
          if (movedCard) {
            const targetCol = newBoard.find(col => String(col.id) === String(moveData.newColumnId));
            if (targetCol) {
              movedCard.column_id = Number(moveData.newColumnId);
              if (moveData.assignee_id) movedCard.assignee_id = moveData.assignee_id;
              
              // Sugestão Sênior #21: Cronômetro Automático ao entrar em Reparo
              const colTitle = targetCol.title.toLowerCase();
              if ((colTitle.includes('reparo') || colTitle.includes('andamento')) && !movedCard.timer_started_at) {
                  movedCard.timer_started_at = new Date().toISOString();
              }
              
              targetCol.cards.splice(moveData.newPosition, 0, movedCard);
            }
          }
          return newBoard;
        });
      }
      return { previousBoard };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['kanbanBoard'], context?.previousBoard);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
    },
  });

  // 3. Mutação OTIMISTA para criar card
  const createCardMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post(`${API_URL}/cards`, data, { headers });
      return res.data;
    },
    onMutate: async (newCardData) => {
      await queryClient.cancelQueries({ queryKey: ['kanbanBoard'] });
      const previousBoard = queryClient.getQueryData<Column[]>(['kanbanBoard']);

      if (previousBoard) {
        queryClient.setQueryData(['kanbanBoard'], (old: Column[]) => {
          const newBoard = [...old];
          const colIdx = newBoard.findIndex(c => String(c.id) === String(newCardData.columnId));
          if (colIdx !== -1) {
             const tempCard = { 
               id: Math.random(), // Temp ID
               title: newCardData.title, 
               description: newCardData.description,
               column_id: newCardData.columnId,
               created_at: new Date().toISOString()
             };
             newBoard[colIdx].cards.push(tempCard as any);
          }
          return newBoard;
        });
      }
      return { previousBoard };
    },
    onError: (err, newCard, context) => {
      queryClient.setQueryData(['kanbanBoard'], context?.previousBoard);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
    },
  });

  // 4. Mutação OTIMISTA para deletar card
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axios.delete(`${API_URL}/cards/${id}`, { headers });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['kanbanBoard'] });
      const previousBoard = queryClient.getQueryData<Column[]>(['kanbanBoard']);

      if (previousBoard) {
        queryClient.setQueryData(['kanbanBoard'], (old: Column[]) => {
          return old.map(col => ({
            ...col,
            cards: col.cards.filter(c => String(c.id) !== String(id))
          }));
        });
      }
      return { previousBoard };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['kanbanBoard'], context?.previousBoard);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
    },
  });

  return {
    useBoard,
    moveCard: moveCardMutation.mutateAsync,
    createCard: createCardMutation.mutateAsync,
    deleteCard: deleteCardMutation.mutateAsync,
    // Column movement can be optimistic too if needed
    moveColumn: async (data: any) => {
        await axios.put(`${API_URL}/columns/move`, data, { headers });
        queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
    },
    updateCard: async (data: any) => {
        const res = await axios.put(`${API_URL}/cards/${data.id}`, data, { headers });
        queryClient.invalidateQueries({ queryKey: ['kanbanBoard'] });
        return res.data;
    }
  };
};