import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Stack, 
  Typography,
  Paper,
  alpha,
  useTheme,
  InputAdornment,
  Chip
} from '@mui/material';
import { FaTag, FaPalette } from 'react-icons/fa';
import { Button } from './Button';

interface TagFormData {
  name: string;
  color: string;
}

interface TagFormProps {
  initialData?: TagFormData & { id?: number };
  onSubmit: (data: TagFormData) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0', 
  '#0288d1', '#d32f2f', '#7b1fa2', '#f57c00', '#388e3c'
];

export const TagForm: React.FC<TagFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    color: '#1976d2',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        color: initialData.color || '#1976d2',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Nome da Etiqueta"
          placeholder="Ex: Urgente, VIP, Novo..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaTag color={formData.color} />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px' }
          }}
        />

        <Box>
          <Typography variant="caption" fontWeight={400} color="text.secondary" gutterBottom display="block" sx={{ mb: 1, ml: 1 }}>
            COR DA ETIQUETA
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {PRESET_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setFormData({ ...formData, color: c })}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: c,
                  cursor: 'pointer',
                  border: formData.color === c ? `3px solid ${theme.palette.text.primary}` : 'none',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              />
            ))}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <FaPalette size={12} color={theme.palette.text.secondary} />
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{
                  position: 'absolute',
                  top: -5,
                  left: -5,
                  width: 40,
                  height: 40,
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            borderRadius: '12px', 
            bgcolor: alpha(formData.color, 0.05), 
            border: `1px solid ${alpha(formData.color, 0.2)}`,
            textAlign: 'center'
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">PRÉ-VISUALIZAÇÃO</Typography>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={formData.name || 'Nome da Tag'} 
              sx={{ 
                bgcolor: formData.color, 
                color: '#fff', 
                fontWeight: 400,
                borderRadius: '8px'
              }} 
            />
          </Box>
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
          <Button onClick={onCancel} variant="outlined" label="Cancelar" />
          <Button 
            type="submit" 
            variant="contained" 
            label={initialData ? 'Atualizar Tag' : 'Criar Tag'} 
            sx={{ bgcolor: formData.color, '&:hover': { bgcolor: formData.color, opacity: 0.9 } }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};
