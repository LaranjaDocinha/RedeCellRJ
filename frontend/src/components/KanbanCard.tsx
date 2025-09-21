import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { 
  CardContainer, 
  CardContentWrapper, 
  CardTextarea, 
  CardRemoveButton 
} from './Kanban.styled';

interface Card {
  id: string;
  content: string;
}

interface KanbanCardProps {
  card: Card;
  index: number;
  onRemove: (cardId: string) => void;
  onEdit: (cardId: string, newContent: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, index, onRemove, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(card.content);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewContent(e.target.value);
  };

  const handleContentBlur = () => {
    onEdit(card.id, newContent);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleContentBlur();
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <CardContainer
            data-testid={`card-${card.id}`}
            $isDragging={snapshot.isDragging}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            whileDrag={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)' }}
          >
            <CardContentWrapper>
              {isEditing ? (
                <CardTextarea
                  value={newContent}
                  onChange={handleContentChange}
                  onBlur={handleContentBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <p onClick={() => setIsEditing(true)}>{card.content}</p>
              )}
              <CardRemoveButton onClick={() => onRemove(card.id)} aria-label="Remove card">
                ×
              </CardRemoveButton>
            </CardContentWrapper>
          </CardContainer>
        </div>
      )}
    </Draggable>
  );
};
