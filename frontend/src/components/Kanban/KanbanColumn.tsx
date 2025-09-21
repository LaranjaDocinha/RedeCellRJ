import React, { useState } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ColumnContainer, CardsContainer } from './Kanban.styled';
import KanbanCard from './KanbanCard';
import { FaPlus } from 'react-icons/fa';
import { AddCardForm, AddCardButton, AddCardTextArea, AddCardActions, AddCardActionButton } from './Kanban.styled';
import { motion } from 'framer-motion'; // Import motion

interface KanbanColumnProps {
  column: any;
  onCreateCard: (columnId: string, title: string, description: string) => void;
  onDeleteCard: (cardId: string, columnId: string) => void;
  triggerHapticFeedback: () => void; // Add triggerHapticFeedback
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onCreateCard, onDeleteCard, triggerHapticFeedback }) => {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id: column.id });
  const { attributes, listeners, setNodeRef: setSortableNodeRef, transform, transition } = useSortable({
    id: column.id,
    data: { type: 'Column' }, // Add type to data
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onCreateCard(column.id, newCardTitle.trim(), newCardDescription.trim());
      setNewCardTitle('');
      setNewCardDescription('');
      setIsAddingCard(false);
    }
  };

  return (
    <ColumnContainer ref={setDroppableNodeRef} as={motion.div} style={style} {...attributes} {...listeners}>
      <h3>{column.title}</h3>
      <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <CardsContainer>
          {column.cards.map(card => (
            <KanbanCard key={card.id} card={card} onDeleteCard={onDeleteCard} columnId={column.id} triggerHapticFeedback={triggerHapticFeedback} />
          ))}
        </CardsContainer>
      </SortableContext>
      {!isAddingCard ? (
        <AddCardButton onClick={() => setIsAddingCard(true)}>
          <FaPlus /> Add Card
        </AddCardButton>
      ) : (
        <AddCardForm>
          <AddCardTextArea
            placeholder="Card title"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            rows={1}
          />
          <AddCardTextArea
            placeholder="Description (optional)"
            value={newCardDescription}
            onChange={(e) => setNewCardDescription(e.target.value)}
            rows={3}
          />
          <AddCardActions>
            <AddCardActionButton onClick={handleAddCard}>Add</AddCardActionButton>
            <AddCardActionButton onClick={() => setIsAddingCard(false)} cancel>Cancel</AddCardActionButton>
          </AddCardActions>
        </AddCardForm>
      )}
    </ColumnContainer>
  );
};

export default KanbanColumn;