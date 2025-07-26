import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import classnames from 'classnames';
import { Badge } from 'reactstrap';

const KanbanCard = ({ item, index }) => {

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Urgente':
        return 'border-start border-danger border-4';
      case 'Alta':
        return 'border-start border-warning border-4';
      default:
        return 'border-start border-secondary border-4';
    }
  };

  return (
    <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={classnames('kanban-card', getPriorityClass(item.priority), { 'is-dragging': snapshot.isDragging })}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <strong className="mb-0">O.S. #{item.id}</strong>
            {item.priority && <Badge color={item.priority === 'Urgente' ? 'danger' : 'info'} pill>{item.priority}</Badge>}
          </div>
          <p className="mb-1 mt-2">{item.customer_name}</p>
          <small className="text-muted">{item.device_type}</small>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">{item.technician_name || 'Não atribuído'}</small>
            <small className="text-muted">{new Date(item.created_at).toLocaleDateString()}</small>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;