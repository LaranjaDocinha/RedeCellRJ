import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { useKanbanStore } from '../store/kanbanStore';
import { BoardContainer, AddColumnButton } from './Kanban.styled';

export const KanbanBoard: React.FC = () => {
  const {
    columns,
    cards,
    columnOrder,
    addColumn,
    removeColumn,
    renameColumn,
    addCard,
    removeCard,
    editCard,
    moveCard,
  } = useKanbanStore();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    moveCard(source, destination, draggableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <BoardContainer>
        {columnOrder.map((columnId) => {
          const column = columns[columnId];
          const columnCards = column.cardIds.map((cardId) => cards[cardId]);

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={columnCards}
              onRemove={removeColumn}
              onRename={renameColumn}
              onAddCard={addCard}
              onRemoveCard={removeCard}
              onEditCard={editCard}
            />
          );
        })}
        <AddColumnButton onClick={() => addColumn('Nova Coluna')}>
          + Adicionar Coluna
        </AddColumnButton>
      </BoardContainer>
    </DragDropContext>
  );
};
