import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { Draggable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import { motion } from 'framer-motion';

const KanbanColumn = ({ column, repairs, provided, snapshot }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="kanban-column-wrapper"
    >
      <Card className="kanban-column mb-0">
        <CardBody>
          <CardTitle className="kanban-column-header h5 text-uppercase mb-4">
            {column.title} ({repairs.length})
          </CardTitle>
          <div
            className="kanban-cards-container"
            ref={provided.innerRef}
            style={{
              background: snapshot.isDraggingOver ? 'var(--color-hover-background)' : 'transparent',
            }}
            {...provided.droppableProps}
          >
            {repairs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="kanban-empty-state"
              >
                <i className="bx bx-info-circle"></i>
                <p>Nenhum cartão nesta coluna.</p>
              </motion.div>
            ) : (
              repairs.map((repair, index) => (
                <Draggable key={repair.id} draggableId={String(repair.id)} index={index}>
                  {(provided, snapshot) => (
                    <KanbanCard
                      repair={repair}
                      provided={provided}
                      snapshot={snapshot}
                    />
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        </CardBody>
      </Card>
    </motion.div>
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