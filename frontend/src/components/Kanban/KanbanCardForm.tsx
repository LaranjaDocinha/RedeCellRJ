import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  TextField, 
  Button, 
  Stack, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Select, 
  Box,
  Typography 
} from '@mui/material';
import { motion } from 'framer-motion';
import { Card } from '../../types/kanban'; 

const kanbanCardFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(255, 'Máximo de 255 caracteres'),
  description: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
  due_date: z.string().datetime('Formato de data inválido (ISO 8601)').nullable().optional(),
  assignee_id: z.string().nullable().optional(), 
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  service_order_id: z.number().int().positive('ID da OS deve ser um número inteiro positivo').optional().nullable(),
  tags: z.string().optional() 
});

type KanbanCardFormData = z.infer<typeof kanbanCardFormSchema>;

interface KanbanCardFormProps {
  initialData?: Partial<Card>;
  onSubmit: (data: KanbanCardFormData) => void;
  onCancel: () => void;
  availableAssignees: Array<{ id: string; name: string }>;
  isNew?: boolean; 
}

export const KanbanCardForm: React.FC<KanbanCardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  availableAssignees,
  isNew = false
}) => {
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<KanbanCardFormData>({
    resolver: zodResolver(kanbanCardFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      due_date: initialData?.due_date 
        ? new Date(initialData.due_date).toISOString().slice(0, 16) 
        : null,
      assignee_id: initialData?.assignee_id ? String(initialData.assignee_id) : null,
      priority: initialData?.priority || 'normal',
      service_order_id: initialData?.service_order_id || null,
      tags: initialData?.tags ? initialData.tags.join(', ') : ''
    },
  });

  useEffect(() => {
    reset({
      title: initialData?.title || '',
      description: initialData?.description || '',
      due_date: initialData?.due_date 
        ? new Date(initialData.due_date).toISOString().slice(0, 16) 
        : null,
      assignee_id: initialData?.assignee_id ? String(initialData.assignee_id) : null,
      priority: initialData?.priority || 'normal',
      service_order_id: initialData?.service_order_id || null,
      tags: initialData?.tags ? initialData.tags.join(', ') : ''
    });
  }, [initialData, reset]);

  const mapDataForSubmit = (data: KanbanCardFormData) => {
    return {
      ...data,
      assignee_id: data.assignee_id ? String(data.assignee_id) : null,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
    };
  };

  return (
    <Box 
      component={motion.create('form')} 
      onSubmit={handleSubmit(data => onSubmit(mapDataForSubmit(data)))}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Stack spacing={2} sx={{ py: 2 }}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Título do Cartão"
              variant="outlined"
              fullWidth
              size="small"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Descrição"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              size="small"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />
        <Controller
          name="service_order_id"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="ID da Ordem de Serviço"
              variant="outlined"
              fullWidth
              type="number"
              size="small"
              error={!!errors.service_order_id}
              helperText={errors.service_order_id?.message || "Opcional. Vincule a uma OS existente."}
            />
          )}
        />
        <Controller
          name="due_date"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Data de Vencimento"
              type="datetime-local"
              variant="outlined"
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.due_date}
              helperText={errors.due_date?.message}
            />
          )}
        />
        <Controller
          name="assignee_id"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth variant="outlined" size="small" error={!!errors.assignee_id}>
              <InputLabel>Responsável</InputLabel>
              <Select
                {...field}
                label="Responsável"
                value={field.value || ''}
              >
                <MenuItem value="">
                  <em>Não Atribuído</em>
                </MenuItem>
                {availableAssignees.map((assignee) => (
                  <MenuItem key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.assignee_id && <Typography color="error" variant="caption">{errors.assignee_id?.message}</Typography>}
            </FormControl>
          )}
        />
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth variant="outlined" size="small" error={!!errors.priority}>
              <InputLabel>Prioridade</InputLabel>
              <Select
                {...field}
                label="Prioridade"
              >
                <MenuItem value="low">Baixa</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="critical">Crítica</MenuItem>
              </Select>
              {errors.priority && <Typography color="error" variant="caption">{errors.priority?.message}</Typography>}
            </FormControl>
          )}
        />
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Tags (separadas por vírgula)"
              variant="outlined"
              fullWidth
              size="small"
              error={!!errors.tags}
              helperText={errors.tags?.message || "Ex: 'urgente, bug, feature'"}
            />
          )}
        />
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="secondary">
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {isNew ? 'Adicionar Cartão' : 'Atualizar Cartão'}
        </Button>
      </Stack>
    </Box>
  );
};