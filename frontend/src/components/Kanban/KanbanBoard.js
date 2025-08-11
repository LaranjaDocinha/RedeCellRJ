import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import styled from 'styled-components';

import KanbanColumn from './KanbanColumn';

const ColumnsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const KanbanBoard = ({
  columns,
  tasks,
  onTaskDrop,
  onTaskClick,
  onTaskAdd,
  onCardAction,
  columnOrder,
  kanbanViewMode,
  laneId,
}) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const sourceColumnId = active.data.current.sortable.containerId;
    const destinationColumnId = over.data.current.sortable.containerId;

    const sourceLaneId = sourceColumnId.split('-')[0];
    const destLaneId = destinationColumnId.split('-')[0];

    const sourceStatus = sourceColumnId.split('-')[1];
    const destStatus = destinationColumnId.split('-')[1];

    // Se o agrupamento for por técnico ou prioridade, e a tarefa for movida para outra swimlane
    // precisamos atualizar o technician_id ou priority no backend.
    const updatedFields = { newStatus: destStatus };
    if (sourceLaneId !== destLaneId) {
      if (sourceLaneId.startsWith('technician-')) {
        updatedFields.technicianId =
          destLaneId === 'technician-unassigned' ? null : destLaneId.replace('technician-', '');
      } else if (sourceLaneId.startsWith('priority-')) {
        updatedFields.priority = destLaneId.replace('priority-', '');
      }
    }

    onTaskDrop({
      draggableId: active.id,
      source: { droppableId: sourceColumnId, index: active.data.current.sortable.index },
      destination: { droppableId: destinationColumnId, index: over.data.current.sortable.index },
      updatedFields: updatedFields,
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <ColumnsContainer>
        <SortableContext items={columnOrder}>
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds.map((taskId) => tasks[taskId]).filter(Boolean);

            const droppableId = `${laneId}-${column.id}`;

            return (
              <KanbanColumn
                key={droppableId}
                column={column}
                droppableId={droppableId}
                kanbanViewMode={kanbanViewMode}
                tasks={columnTasks}
                onCardAction={onCardAction}
                onTaskAdd={onTaskAdd}
                onTaskClick={onTaskClick}
              />
            );
          })}
        </SortableContext>
      </ColumnsContainer>
      <DragOverlay>{/* Renderiza o item que está sendo arrastado */}</DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
