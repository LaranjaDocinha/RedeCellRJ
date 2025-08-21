import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ columns, repairsByStatus, onStatusChange }) => {
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Se não houver destino, ou se arrastou para o mesmo lugar
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    // Encontra o reparo que foi arrastado
    const repairId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;

    // Chama a função de mudança de status passada via props
    onStatusChange(repairId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <motion.div
        className="kanban-board-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Row className="flex-nowrap overflow-auto pb-3">
          {columns.map((column) => (
            <Col key={column.id} xs={12} sm={6} md={4} lg={3} xl={2} className="kanban-column-wrapper">
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <KanbanColumn
                    column={column}
                    repairs={repairsByStatus[column.id] || []}
                    provided={provided}
                    snapshot={snapshot}
                  />
                )}
              </Droppable>
            </Col>
          ))}
        </Row>
      </motion.div>
    </DragDropContext>
  );
};

KanbanBoard.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  repairsByStatus: PropTypes.object.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default KanbanBoard;