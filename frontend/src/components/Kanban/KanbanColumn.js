import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { Draggable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ column, repairs, provided, snapshot }) => {
  return (
    <Card className="kanban-column mb-0">
      <CardBody>
        <CardTitle className="h5 text-uppercase mb-4">{column.title} ({repairs.length})</CardTitle>
        <div
          ref={provided.innerRef}
          style={{
            background: snapshot.isDraggingOver ? 'lightgray' : '#f8f8f8',
            padding: 8,
            minHeight: 500,
          }}
          {...provided.droppableProps}
        >
          {repairs.map((repair, index) => (
            <Draggable key={repair.id} draggableId={String(repair.id)} index={index}>
              {(provided, snapshot) => (
                <KanbanCard
                  repair={repair}
                  provided={provided}
                  snapshot={snapshot}
                />
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      </CardBody>
    </Card>
  );
};

KanbanColumn.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  repairs: PropTypes.array.isRequired,
  provided: PropTypes.object.isRequired,
  snapshot: PropTypes.object.isRequired,
};

export default KanbanColumn;