import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Col, Card, CardBody, CardTitle } from 'reactstrap';
import classnames from 'classnames';

import KanbanCard from './KanbanCard';

const KanbanColumn = ({ column }) => {
  return (
    <Col md={3} style={{ minWidth: '300px' }}>
      <Card>
        <CardBody>
          <CardTitle className='mb-4'>
            {column.name} ({column.items.length})
          </CardTitle>
          <Droppable key={column.name} droppableId={column.name}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={classnames('kanban-column-body', {
                  'is-dragging-over': snapshot.isDraggingOver,
                })}
              >
                {column.items.map((item, index) => (
                  <KanbanCard key={item.id} index={index} item={item} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CardBody>
      </Card>
    </Col>
  );
};

export default KanbanColumn;
