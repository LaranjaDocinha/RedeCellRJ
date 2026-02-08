import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  Grid,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  FaTags, 
  FaPlus,
  FaSearch,
  FaTimes,
  FaFilter,
  FaSync
} from 'react-icons/fa';
import { TagList } from '../components/TagList';
import { TagForm } from '../components/TagForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from '../components/Button';

const StyledPageContainer = styled(motion.div)`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const StyledPageTitle = styled(motion.h1)`
  font-size: 2.2rem;
  font-weight: 400;
  margin-bottom: 8px;
  letter-spacing: -1px;
  background: linear-gradient(45deg, #1976d2, #9c27b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

interface Tag {
  id: number;
  name: string;
  color: string;
}

const TagsPage: React.FC = () => {
  const theme = useTheme();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);
  const [search, setSearch] = useState('');
  
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const fetchTags = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/tags', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao carregar etiquetas');
      const data = await response.json();
      setTags(data);
    } catch (err: any) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const filteredTags = useMemo(() => {
    return tags.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [tags, search]);

  const handleOpenModal = (tag?: Tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(undefined);
  };

  const handleSave = async (tagData: Omit<Tag, 'id'>) => {
    try {
      const method = editingTag ? 'PUT' : 'POST';
      const url = editingTag ? `/api/tags/${editingTag.id}` : '/api/tags';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Erro ao salvar etiqueta');
      }

      addNotification(`Etiqueta ${editingTag ? 'atualizada' : 'criada'} com sucesso!`, 'success');
      handleCloseModal();
      fetchTags();
    } catch (error: any) {
      addNotification(error.message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta etiqueta? Ela será removida de todos os itens associados.')) {
      return;
    }
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao excluir etiqueta');
      
      addNotification('Etiqueta excluída com sucesso!', 'success');
      fetchTags();
    } catch (error: any) {
      addNotification(error.message, 'error');
    }
  };

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
        <Box>
            <StyledPageTitle>Centro de Etiquetas</StyledPageTitle>
            <Typography variant="body2" color="text.secondary">
                Organize seu fluxo de trabalho, clientes e produtos com tags inteligentes.
            </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
            <Tooltip title="Sincronizar">
                <IconButton onClick={fetchTags} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <FaSync size={14} className={loading ? 'fa-spin' : ''} />
                </IconButton>
            </Tooltip>
            <Button 
                variant="contained" 
                startIcon={<FaPlus />} 
                onClick={() => handleOpenModal()}
                sx={{ borderRadius: '12px', px: 3, py: 1.2, fontWeight: 400 }}
            >
                Nova Etiqueta
            </Button>
        </Stack>
      </Box>

      {/* Toolbar Estratégica */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '20px', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField 
              size="small"
              placeholder="Filtrar etiquetas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1, maxWidth: 400 }}
              InputProps={{
                  startAdornment: <InputAdornment position="start"><FaSearch size={14} /></InputAdornment>,
                  sx: { borderRadius: '12px', bgcolor: 'action.hover', border: 'none', '& fieldset': { border: 'none' } }
              }}
          />
          <Divider orientation="vertical" flexItem />
          <Box display="flex" gap={1} alignItems="center">
              <FaFilter size={12} color={theme.palette.text.disabled} />
              <Typography variant="caption" fontWeight={400} color="text.secondary">TOTAL: {tags.length}</Typography>
          </Box>
      </Paper>

      {loading && tags.length === 0 ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
      ) : (
        <TagList
          tags={filteredTags}
          onEdit={(id) => handleOpenModal(tags.find(t => t.id === id))}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Premium de Criação/Edição */}
      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        maxWidth="xs" 
        fullWidth 
        disableRestoreFocus
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 400, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={1.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTags color={theme.palette.primary.main} size={20} />
                </Box>
                {editingTag ? 'Editar Etiqueta' : 'Nova Etiqueta'}
            </Box>
            <IconButton onClick={handleCloseModal} size="small"><FaTimes /></IconButton>
        </DialogTitle>
        <DialogContent>
            <TagForm
                initialData={editingTag}
                onSubmit={handleSave}
                onCancel={handleCloseModal}
            />
        </DialogContent>
      </Dialog>
    </StyledPageContainer>
  );
};

export default TagsPage;

