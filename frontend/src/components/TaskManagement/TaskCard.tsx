import React from 'react';
import {
  Paper,
  Typography,
  Checkbox,
  IconButton,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AssignmentTurnedIn as CompletedIcon,
  Assignment as PendingIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
  assignedTo?: string; // User name
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'pending' | 'completed') => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Paper
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          bgcolor: isCompleted ? 'action.hover' : 'background.paper',
          borderLeft: `4px solid ${isCompleted ? '#4CAF50' : '#2196F3'}`,
          opacity: isCompleted ? 0.8 : 1,
          transition: 'all 0.3s ease',
        }}
      >
        <Checkbox
          checked={isCompleted}
          onChange={() => onToggleStatus(task.id, isCompleted ? 'pending' : 'completed')}
          color="primary"
          icon={<PendingIcon />}
          checkedIcon={<CompletedIcon />}
        />
        <Box sx={{ flexGrow: 1, ml: 1 }}>
          <Typography
            variant="body1"
            sx={{
              textDecoration: isCompleted ? 'line-through' : 'none',
              fontWeight: 400,
              color: isCompleted ? 'text.secondary' : 'text.primary',
            }}
          >
            {task.description}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Tooltip title="Data de Vencimento">
              <Chip
                icon={<EventIcon fontSize="small" />}
                label={new Date(task.dueDate).toLocaleDateString()}
                size="small"
                variant="outlined"
                color="default"
              />
            </Tooltip>
            {task.assignedTo && (
              <Tooltip title="Atribuído a">
                <Chip
                  icon={<PersonIcon fontSize="small" />}
                  label={task.assignedTo}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box>
          <Tooltip title="Editar Tarefa">
            <IconButton onClick={() => onEdit(task)} size="small" color="info">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir Tarefa">
            <IconButton onClick={() => onDelete(task.id)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default TaskCard;

