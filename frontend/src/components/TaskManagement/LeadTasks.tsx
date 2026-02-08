import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Task {
  id: string;
  leadId: string; // To associate with a lead
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed';
  assignedTo?: string; // User ID or name
}

interface LeadTasksProps {
  leadId: string;
}

const LeadTasks: React.FC<LeadTasksProps> = ({ leadId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const { showNotification } = useNotification();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // --- API Simulation/Integration ---
  // In a real scenario, these would call a backend API for tasks
  const fetchTasks = async (): Promise<Task[]> => {
    // Mock data for demonstration
    const mockTasks: Task[] = [
      { id: '1', leadId, description: 'Ligar para acompanhamento', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), status: 'pending', assignedTo: 'John Doe' },
      { id: '2', leadId, description: 'Enviar proposta de serviço X', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), status: 'pending', assignedTo: 'Jane Smith' },
      { id: '3', leadId, description: 'Verificar status do e-mail de boas-vindas', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'completed', assignedTo: 'John Doe' },
    ];
    return new Promise((resolve) => setTimeout(() => resolve(mockTasks.filter(task => task.leadId === leadId)), 500));
  };

  const createTaskMutation = useMutation({
    mutationFn: (newTask: Omit<Task, 'id' | 'leadId' | 'status'>) => {
      showNotification('Criando tarefa...', 'info');
      return new Promise<Task>((resolve) => setTimeout(() => {
        const createdTask: Task = { ...newTask, id: String(Date.now()), leadId, status: 'pending', dueDate: new Date(newTask.dueDate) };
        resolve(createdTask);
      }, 1000));
    },
    onSuccess: (newTask) => {
      showNotification('Tarefa criada com sucesso!', 'success');
      queryClient.setQueryData<Task[]>(['leadTasks', leadId], (oldTasks) => [...(oldTasks || []), newTask]);
      setIsModalOpen(false);
      setEditingTask(undefined);
    },
    onError: (err) => {
      showNotification(`Erro ao criar tarefa: ${err.message}`, 'error');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask: Task) => {
      showNotification('Atualizando tarefa...', 'info');
      return new Promise<Task>((resolve) => setTimeout(() => {
        resolve(updatedTask);
      }, 1000));
    },
    onSuccess: (updatedTask) => {
      showNotification('Tarefa atualizada com sucesso!', 'success');
      queryClient.setQueryData<Task[]>(['leadTasks', leadId], (oldTasks) =>
        oldTasks ? oldTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)) : [updatedTask]
      );
      setIsModalOpen(false);
      setEditingTask(undefined);
    },
    onError: (err) => {
      showNotification(`Erro ao atualizar tarefa: ${err.message}`, 'error');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => {
      showNotification('Excluindo tarefa...', 'info');
      return new Promise<void>((resolve) => setTimeout(() => {
        resolve();
      }, 1000));
    },
    onSuccess: (data, taskId) => {
      showNotification('Tarefa excluída com sucesso!', 'success');
      queryClient.setQueryData<Task[]>(['leadTasks', leadId], (oldTasks) =>
        oldTasks ? oldTasks.filter((task) => task.id !== taskId) : []
      );
    },
    onError: (err) => {
      showNotification(`Erro ao excluir tarefa: ${err.message}`, 'error');
    },
  });

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['leadTasks', leadId],
    queryFn: fetchTasks,
  });
  // --- End API Simulation/Integration ---

  const handleAddTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleToggleStatus = (taskId: string, newStatus: 'pending' | 'completed') => {
    const taskToUpdate = tasks?.find(task => task.id === taskId);
    if (taskToUpdate) {
      updateTaskMutation.mutate({ ...taskToUpdate, status: newStatus });
    }
  };

  const handleFormSubmit = (data: Omit<Task, 'id' | 'leadId'>) => {
    if (editingTask) {
      updateTaskMutation.mutate({ ...editingTask, ...data, dueDate: new Date(data.dueDate) });
    } else {
      createTaskMutation.mutate({ ...data, dueDate: new Date(data.dueDate) });
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Erro ao carregar tarefas.</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 400 }}>Tarefas do Lead</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddTask}>
          Nova Tarefa
        </Button>
      </Box>
      <Paper sx={{ p: 2, borderRadius: '8px', bgcolor: 'background.paper' }}>
        <List>
          {tasks && tasks.length > 0 ? (
            <AnimatePresence>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </AnimatePresence>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              Nenhuma tarefa encontrada para este lead.
            </Typography>
          )}
        </List>
      </Paper>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
        <DialogContent>
          <TaskForm
            initialData={editingTask ? { ...editingTask, dueDate: new Date(editingTask.dueDate) } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LeadTasks;

