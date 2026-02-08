import React from 'react';
import { 
  Grid,
  Paper, 
  IconButton, 
  Tooltip, 
  Chip,
  Typography,
  Box,
  alpha,
  useTheme,
  Stack
} from '@mui/material';
import { FaEdit, FaTrash, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface TagListProps {
  tags: Tag[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TagList: React.FC<TagListProps> = ({ tags, onEdit, onDelete }) => {
  const theme = useTheme();

  if (tags.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'action.hover', borderRadius: '24px', border: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="body1" color="text.secondary">Nenhuma etiqueta encontrada.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {tags.map((tag, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={tag.id}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: tag.color,
                  boxShadow: `0 8px 24px -4px ${alpha(tag.color, 0.2)}`,
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Chip 
                  label={tag.name} 
                  size="small"
                  sx={{ 
                    bgcolor: tag.color, 
                    color: '#fff', 
                    fontWeight: 400,
                    fontSize: '0.7rem',
                    px: 1,
                    borderRadius: '6px'
                  }} 
                />
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(tag.id)}>
                      <FaEdit size={12} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => onDelete(tag.id)}>
                      <FaTrash size={12} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">USO NO SISTEMA</Typography>
                  <Typography variant="h6" fontWeight={400}>--</Typography>
                </Box>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '10px', 
                    bgcolor: alpha(tag.color, 0.1), 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <FaChartBar color={tag.color} size={16} />
                </Box>
              </Stack>
            </Paper>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};
