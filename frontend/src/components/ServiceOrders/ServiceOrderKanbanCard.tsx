import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, Box, IconButton, useTheme } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { ServiceOrder } from '../../services/serviceOrderService';

interface ServiceOrderKanbanCardProps {
  id: string;
  serviceOrder: ServiceOrder;
  onEdit: (order: ServiceOrder) => void;
  onDelete: (orderId: number) => void;
}

const ServiceOrderKanbanCard: React.FC<ServiceOrderKanbanCardProps> = ({
  id,
  serviceOrder,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as 'relative', // Necessário para zIndex funcionar corretamente
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 1.5,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[2],
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          OS #{serviceOrder.id}
        </Typography>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {serviceOrder.product_description}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Cliente: {serviceOrder.customer_id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Issue: {serviceOrder.issue_description}
        </Typography>
        {/* Adicione mais detalhes da serviceOrder conforme necessário */}
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pt: 0 }}>
        <IconButton size="small" onClick={() => onEdit(serviceOrder)}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(serviceOrder.id)}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default ServiceOrderKanbanCard;
