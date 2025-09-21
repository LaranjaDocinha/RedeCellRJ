import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import {
  ColumnContainer,
  ColumnHeader,
  ColumnTitle,
  ColumnTitleInput,
  ColumnRemoveButton,
  CardList,
  AddCardSection,
  AddCardInput,
  AddCardButton,
  WipLimitMessage,
} from './Kanban.styled';

interface Card {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  cardIds: string[];
  wipLimit?: number;
}

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onRemove: (columnId: string) => void;
  onRename: (columnId: string, newTitle: string) => void;
  onAddCard: (columnId: string, cardContent: string) => void;
  onRemoveCard: (cardId: string, columnId: string) => void;
  onEditCard: (cardId: string, newContent: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  cards,
  onRemove,
  onRename,
  onAddCard,
  onRemoveCard,
  onEditCard,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);
  const [newCardContent, setNewCardContent] = useState('');
  const isWipLimitExceeded = !!(column.wipLimit && cards.length >= column.wipLimit);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    onRename(column.id, newTitle);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const handleAddCard = () => {
    if (newCardContent.trim() !== '' && !isWipLimitExceeded) {
      onAddCard(column.id, newCardContent);
      setNewCardContent('');
    }
  };

  return (
    <ColumnContainer
      data-testid={`column-${column.id}`}
      $isWipLimitExceeded={isWipLimitExceeded}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ColumnHeader>
        {isEditingTitle ? (
          <ColumnTitleInput
            type="text"
            value={newTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <ColumnTitle onClick={() => setIsEditingTitle(true)}>
            {column.title} {column.wipLimit && `(${cards.length}/${column.wipLimit})`}
          </ColumnTitle>
        )}
        <ColumnRemoveButton onClick={() => onRemove(column.id)} aria-label="Remove column">
          ×
        </ColumnRemoveButton>
      </ColumnHeader>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <CardList
            ref={provided.innerRef}
            {...provided.droppableProps}
            $isDraggingOver={snapshot.isDraggingOver}
          >
            {cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                onRemove={() => onRemoveCard(card.id, column.id)}
                onEdit={onEditCard}
              />
            ))}
            {provided.placeholder}
          </CardList>
        )}
      </Droppable>
      <AddCardSection>
        <AddCardInput
          type="text"
          placeholder="Adicionar novo cartão..."
          value={newCardContent}
          onChange={(e) => setNewCardContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddCard();
          }}
          disabled={isWipLimitExceeded}
        />
        <AddCardButton
          onClick={handleAddCard}
          disabled={isWipLimitExceeded}
        >
          +
        </AddCardButton>
      </AddCardSection>
      {isWipLimitExceeded && <WipLimitMessage>Limite de WIP atingido!</WipLimitMessage>}
    </ColumnContainer>
  );
};
