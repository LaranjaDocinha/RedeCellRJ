import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle, CardSubtitle, Badge, Button } from 'reactstrap';

const KanbanCard = ({ repair, provided, snapshot }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'danger';
      case 'Média': return 'warning';
      case 'Baixa': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <Card
      className="kanban-card mb-3"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        border: snapshot.isDragging ? '2px solid #007bff' : '1px solid #e9ecef',
        backgroundColor: snapshot.isDragging ? '#f0f8ff' : '#fff',
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
            <Badge color={getPriorityColor(repair.priority)} className="me-1">
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
  );
};

KanbanCard.propTypes = {
  repair: PropTypes.object.isRequired,
  provided: PropTypes.object.isRequired,
  snapshot: PropTypes.object.isRequired,
};

export default KanbanCard;