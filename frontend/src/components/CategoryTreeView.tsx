import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Paper, Typography, IconButton, Stack, Avatar, alpha, useTheme } from '@mui/material';
import { Edit, Delete, AccountTree, DragHandle, Label } from '@mui/icons-material';

interface Category {
  id: number;
  name: string;
  color?: string;
  product_count?: number;
}

interface CategoryTreeViewProps {
  categories: Category[];
  onReorder: (newList: Category[]) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: number) => void;
}

export const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({ categories, onReorder, onEdit, onDelete }) => {
  const theme = useTheme();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="categories">
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef}>
            {categories.map((cat, index) => (
              <Draggable key={cat.id} draggableId={String(cat.id)} index={index}>
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: snapshot.isDragging ? 'primary.main' : 'divider',
                      boxShadow: snapshot.isDragging ? theme.shadows[10] : 'none',
                      bgcolor: snapshot.isDragging ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box {...provided.dragHandleProps} sx={{ display: 'flex', color: 'text.disabled' }}>
                        <DragHandle />
                    </Box>
                    
                    <Avatar sx={{ bgcolor: alpha(cat.color || theme.palette.primary.main, 0.1), color: cat.color || theme.palette.primary.main }}>
                        <Label />
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={400}>{cat.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{cat.product_count || 0} Produtos vinculados</Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => onEdit(cat)} color="primary"><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => onDelete(cat.id)} color="error"><Delete fontSize="small" /></IconButton>
                    </Stack>
                  </Paper>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

