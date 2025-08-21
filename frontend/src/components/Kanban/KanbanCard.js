import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle, CardSubtitle, Badge, Button } from 'reactstrap';
import { motion } from 'framer-motion';

const KanbanCard = ({ repair, provided, snapshot }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'var(--priority-high)';
      case 'Média': return 'var(--priority-medium)';
      case 'Baixa': return 'var(--priority-low)';
      default: return 'var(--priority-default)';
    }
  };

  return (
    <motion.div
      ref={ref}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      layout // Enable smooth layout transitions
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} // For AnimatePresence when cards are removed
      whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }} // Lift and shadow on hover
      whileTap={{ scale: 0.98 }} // Slight shrink on tap/drag
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="kanban-card-wrapper"
    >
      <Card
        className="kanban-card mb-3"
        style={{
          border: snapshot.isDragging ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)',
          backgroundColor: snapshot.isDragging ? 'var(--color-hover-background)' : 'var(--color-background)',
          boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0, 0, 0, 0.3)' : 'var(--shadow-extra-small)',
        }}
      >
        <CardBody>
          <CardTitle tag="h6" className="mb-1">
            #{repair.id} - {repair.customer_name}
          </CardTitle>
          <CardSubtitle tag="small" className="text-muted mb-2">
            {repair.device_type} - {repair.model}
          </CardSubtitle>
          <p className="mb-2">{repair.problem_description}</p>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Badge style={{ backgroundColor: getPriorityColor(repair.priority) }} className="me-1">
                {repair.priority}
              </Badge>
              {repair.technician_name && (
                <Badge color="success" className="me-1">
                  {repair.technician_name}
                </Badge>
              )}
            </div>
            <Button color="info" size="sm" outline>
              <i className="bx bx-info-circle"></i>
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

KanbanCard.propTypes = {
  repair: PropTypes.object.isRequired,
  provided: PropTypes.object.isRequired,
  snapshot: PropTypes.object.isRequired,
};

export default KanbanCard;