import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  alpha,
  useTheme,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  PhoneIphone,
  TabletMac,
  LaptopMac,
  Watch,
  Headset,
  Dvr,
  Usb,
  ElectricBolt,
  Memory,
  Construction,
  Category as CategoryIcon,
  AutoAwesome,
  Add
} from '@mui/icons-material';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

interface CategoryFormData {
  id?: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  slug?: string;
}

interface CategoryFormProps {
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}

const ICON_OPTIONS = [
  { id: 'PhoneIphone', icon: <PhoneIphone />, label: 'Smartphone' },
  { id: 'TabletMac', icon: <TabletMac />, label: 'Tablet' },
  { id: 'LaptopMac', icon: <LaptopMac />, label: 'Laptop' },
  { id: 'Watch', icon: <Watch />, label: 'Watch' },
  { id: 'Headset', icon: <Headset />, label: 'Audio' },
  { id: 'Dvr', icon: <Dvr />, label: 'Hardware' },
  { id: 'Usb', icon: <Usb />, label: 'Acessórios' },
  { id: 'ElectricBolt', icon: <ElectricBolt />, label: 'Energia' },
  { id: 'Memory', icon: <Memory />, label: 'Peças' },
  { id: 'Construction', icon: <Construction />, label: 'Serviços' },
];

const COLOR_OPTIONS = [
  '#007aff', '#1428a0', '#34c759', '#ff9500', '#ff3b30', 
  '#af52de', '#5856d6', '#ff2d55', '#000000', '#8e8e93'
];

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const theme = useTheme();
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_id: null,
    icon: 'CategoryIcon',
    color: '#007aff',
    slug: ''
  });

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.filter((c: any) => c.id !== initialData?.id));
      }
    } catch (e) {
      console.error(e);
    }
  }, [token, initialData]);

  useEffect(() => {
    fetchCategories();
    if (initialData) {
      setFormData({
        ...initialData,
        parent_id: initialData.parent_id || null,
        icon: initialData.icon || 'CategoryIcon',
        color: initialData.color || '#007aff',
        slug: initialData.slug || ''
      });
    }
  }, [initialData, fetchCategories]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    if (name === 'name') {
      newFormData.slug = value.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              fullWidth
              label="Nome da Categoria"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth
              label="Slug SEO"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              variant="outlined"
              size="small"
              disabled
              InputProps={{ startAdornment: <InputAdornment position="start">/</InputAdornment> }}
            />
          </Grid>
        </Grid>

        <FormControl fullWidth size="small">
          <InputLabel>Categoria Pai (Opcional)</InputLabel>
          <Select
            name="parent_id"
            value={formData.parent_id || ''}
            onChange={handleChange}
            label="Categoria Pai (Opcional)"
          >
            <MenuItem value=""><em>Nenhuma (Categoria Raiz)</em></MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Descrição"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          multiline
          rows={3}
          variant="outlined"
          size="small"
        />

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
          <Typography variant="overline" sx={{ mb: 2, display: 'block', color: 'text.secondary' }}>Personalização Visual</Typography>
          
          <Stack spacing={3}>
            <Box>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Ícone Representativo</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ICON_OPTIONS.map((opt) => (
                  <Tooltip key={opt.id} title={opt.label}>
                    <IconButton 
                      onClick={() => setFormData({ ...formData, icon: opt.id })}
                      sx={{ 
                        border: '1px solid', 
                        borderColor: formData.icon === opt.id ? formData.color : 'divider',
                        bgcolor: formData.icon === opt.id ? alpha(formData.color!, 0.1) : 'transparent',
                        color: formData.icon === opt.id ? formData.color : 'text.disabled',
                        '&:hover': { bgcolor: alpha(formData.color!, 0.05) }
                      }}
                    >
                      {opt.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Cor Temática</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {COLOR_OPTIONS.map((c) => (
                  <Box 
                    key={c}
                    onClick={() => setFormData({ ...formData, color: c })}
                    sx={{ 
                      width: 28, height: 28, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                      border: '2px solid', borderColor: formData.color === c ? 'text.primary' : 'transparent',
                      transform: formData.color === c ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </Paper>

        <Divider />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={onCancel}
            variant="outlined"
            color="secondary"
            label="Cancelar"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={initialData ? <AutoAwesome /> : <Add />}
            label={initialData ? 'Atualizar Catálogo' : 'Adicionar Categoria'}
            sx={{ px: 4 }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};