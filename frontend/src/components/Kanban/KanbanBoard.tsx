import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  getBoard,
  moveCard,
  createCard,
  deleteCard,
  moveColumn,
  updateCard,
} from '../../hooks/useKanbanApi';
import { BoardContainer } from './Kanban.styled';
import KanbanColumn from './KanbanColumn';
import { v4 as uuidv4 } from 'uuid';
import useHapticFeedback from '../../hooks/useHapticFeedback';
import { useNotification } from '../../contexts/NotificationContext'; // Import the notification hook
import { useSocket } from '../../contexts/SocketContext'; // Import Socket Context
import { Modal } from '../Modal'; // Import Modal
import { KanbanCardForm } from './KanbanCardForm'; // Import KanbanCardForm
import Loading from '../Loading'; // Import Loading component
import { StyledEmptyState } from '../AuditLogList.styled'; // Reutilizando StyledEmptyState
import { FaExclamationTriangle, FaClipboardList } from 'react-icons/fa'; // Ícones para erro e vazio

const KanbanBoard: React.FC = () => {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [availableAssignees, setAvailableAssignees] = useState<Array<{ id: number; name: string }>>(
    [],
  );
  const triggerHapticFeedback = useHapticFeedback();
  const { addToast } = useNotification(); // Use the notification hook
  const { socket } = useSocket();

  const fetchBoardAndUsers = async () => {
      try {
        // Don't set loading to true on background refresh to avoid flickering
        // setLoading(true); 
        const boardData = await getBoard();
        setBoard(boardData);

        // Fetch users for assignees
        const usersResponse = await fetch('/api/users'); // Assuming /users endpoint exists and returns { id, name }
        if (!usersResponse.ok) throw new Error(`HTTP error! status: ${usersResponse.status}`);
        const usersData = await usersResponse.json();
        setAvailableAssignees(
          usersData.map((user: any) => ({ id: user.id, name: user.name || user.email })),
        );
      } catch (err: any) {
        setError('Falha ao carregar o quadro e usuários.');
        addToast('Could not load the board and users. Please try refreshing.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    setLoading(true); // Initial load only
    fetchBoardAndUsers();
  }, []);

  // Socket Listener for Real-Time Updates
  useEffect(() => {
    if (!socket) return;

    const handleKanbanUpdate = (data: any) => {
      console.log('Kanban update received via socket:', data);
      addToast(`Atualização: OS #${data.serviceOrderId} movida para ${data.newStatus}`, 'info');
      fetchBoardAndUsers(); // Refresh board
    };

    socket.on('kanban_card_moved', handleKanbanUpdate);

    return () => {
      socket.off('kanban_card_moved', handleKanbanUpdate);
    };
  }, [socket, addToast]); // Added addToast dependency

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    let originalBoard = board;

    // Handle column reordering
    if (active.data.current?.type === 'Column' && over.data.current?.type === 'Column') {
      const oldIndex = board.findIndex((col) => col.id === active.id);
      const newIndex = board.findIndex((col) => col.id === over.id);
      const newBoard = arrayMove(board, oldIndex, newIndex);
      setBoard(newBoard);

      // Call API to persist column order
      moveColumn({ columnId: active.id, newPosition: newIndex })
        .then(() => triggerHapticFeedback())
        .catch((err) => {
          console.error('Failed to move column:', err);
          addToast('Failed to move column. Reverting changes.', 'error');
          // Revert state on API failure
          setBoard(originalBoard);
        });
      return;
    }

    // Handle card movement (existing logic)
    setBoard((prevBoard) => {
      originalBoard = prevBoard; // Capture the state before the optimistic update
      const oldColumn = prevBoard.find((col) => col.cards.some((card) => card.id === active.id));
      const newColumn = prevBoard.find(
        (col) => col.id === over.id || col.cards.some((card) => card.id === over.id),
      );

      if (!oldColumn || !newColumn) return prevBoard;

      const activeCardIndex = oldColumn.cards.findIndex((card) => card.id === active.id);
      const activeCard = oldColumn.cards[activeCardIndex];

      let newCardIndex;
      if (newColumn.cards.some((card) => card.id === over.id)) {
        newCardIndex = newColumn.cards.findIndex((card) => card.id === over.id);
      } else {
        newCardIndex = newColumn.cards.length;
      }

      let newBoard = [...prevBoard];

      if (oldColumn.id === newColumn.id) {
        const updatedCards = arrayMove(oldColumn.cards, activeCardIndex, newCardIndex);
        const updatedColumn = { ...oldColumn, cards: updatedCards };
        newBoard = newBoard.map((col) => (col.id === oldColumn.id ? updatedColumn : col));
      } else {
        const oldColumnCards = [...oldColumn.cards];
        oldColumnCards.splice(activeCardIndex, 1);

        const newColumnCards = [...newColumn.cards];
        newColumnCards.splice(newCardIndex, 0, activeCard);

        newBoard = newBoard.map((col) => {
          if (col.id === oldColumn.id) return { ...col, cards: oldColumnCards };
          if (col.id === newColumn.id) return { ...col, cards: newColumnCards };
          return col;
        });
      }

      // Call API to persist changes
      moveCard({ cardId: active.id, newColumnId: newColumn.id, newPosition: newCardIndex })
        .then(() => triggerHapticFeedback())
        .catch((err) => {
          console.error('Failed to move card:', err);
          addToast('Failed to move card. Reverting changes.', 'error');
          // Revert state on API failure
          setBoard(originalBoard);
        });

      return newBoard;
    });
  };

  const handleCreateCard = async (columnId: string, title: string, description: string) => {
    const tempId = `temp-${uuidv4()}`;
    const newCard = { id: tempId, title, description, column_id: columnId, position: 9999 };

    const originalBoard = board;
    setBoard((prevBoard) => {
      return prevBoard.map((col) => {
        if (col.id === columnId) {
          return { ...col, cards: [...col.cards, newCard] };
        }
        return col;
      });
    });

    try {
      const createdCard = await createCard({ columnId, title, description });
      setBoard((prevBoard) => {
        return prevBoard.map((col) => {
          if (col.id === columnId) {
            const updatedCards = col.cards.map((card) =>
              card.id === tempId ? { ...createdCard, id: createdCard.id } : card,
            );
            return { ...col, cards: updatedCards };
          }
          return col;
        });
      });
      triggerHapticFeedback();
      addToast('Card created successfully!', 'success');
    } catch (err) {
      console.error('Failed to create card:', err);
      addToast('Failed to create card. Please try again.', 'error');
      setBoard(originalBoard);
    }
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setIsEditModalOpen(true);
  };

  const handleUpdateCard = async (updatedCardData: any) => {
    const originalBoard = board;
    setBoard((prevBoard) => {
      return prevBoard.map((col) => {
        if (col.id === updatedCardData.column_id) {
          return {
            ...col,
            cards: col.cards.map((card) =>
              card.id === updatedCardData.id ? updatedCardData : card,
            ),
          };
        }
        return col;
      });
    });

    try {
      await updateCard(updatedCardData);
      addToast('Card updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update card:', err);
      addToast('Failed to update card. Reverting changes.', 'error');
      setBoard(originalBoard);
    } finally {
      setIsEditModalOpen(false);
      setEditingCard(null);
    }
  };

  const handleDeleteCard = async (cardId: string, columnId: string) => {
    const originalBoard = board;
    setBoard((prevBoard) => {
      return prevBoard.map((col) => {
        if (col.id === columnId) {
          return { ...col, cards: col.cards.filter((card) => card.id !== cardId) };
        }
        return col;
      });
    });

    try {
      await deleteCard(cardId);
      triggerHapticFeedback();
      addToast('Card deleted.', 'info');
    } catch (err) {
      console.error('Failed to delete card:', err);
      addToast('Failed to delete card.', 'error');
      setBoard(originalBoard);
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <StyledEmptyState
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FaExclamationTriangle />
        <p>{error}</p>
      </StyledEmptyState>
    );
  if (!board.length)
    return (
      <StyledEmptyState
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FaClipboardList />
        <p>Nenhum dado encontrado.</p>
      </StyledEmptyState>
    );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <BoardContainer>
        {board.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onCreateCard={handleCreateCard}
            onDeleteCard={handleDeleteCard}
            onEditCard={handleEditCard} // Pass handleEditCard
          />
        ))}
      </BoardContainer>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Kanban Card"
      >
        {editingCard && (
          <KanbanCardForm
            initialData={editingCard}
            onSubmit={handleUpdateCard}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingCard(null);
            }}
            availableAssignees={availableAssignees}
          />
        )}
      </Modal>
    </DndContext>
  );
};

export default KanbanBoard;
