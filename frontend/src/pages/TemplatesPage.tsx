import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Template {
  id: number;
  name: string;
  type: string; // e.g., 'email', 'pdf', 'receipt'
  content: string;
}

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/templates', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setCurrentTemplate(null);
    setNewTemplateName('');
    setNewTemplateType('');
    setNewTemplateContent('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (template: Template) => {
    setCurrentTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateType(template.type);
    setNewTemplateContent(template.content);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveTemplate = async () => {
    if (!token || !newTemplateName || !newTemplateType || !newTemplateContent) return;
    setLoading(true);
    try {
      const method = currentTemplate ? 'PUT' : 'POST';
      const url = currentTemplate ? `/api/templates/${currentTemplate.id}` : '/api/templates';
      const body = JSON.stringify({
        name: newTemplateName,
        type: newTemplateType,
        content: newTemplateContent,
      });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (data.success) {
        alert(`Template ${currentTemplate ? 'atualizado' : 'criado'} com sucesso!`);
        handleCloseDialog();
        fetchTemplates();
      } else {
        alert(data.message || `Erro ao ${currentTemplate ? 'atualizar' : 'criar'} template.`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Erro ao ${currentTemplate ? 'atualizar' : 'criar'} template.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!token || !window.confirm('Tem certeza que deseja excluir este template?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert('Template excluído com sucesso!');
        fetchTemplates();
      } else {
        alert(data.message || 'Erro ao excluir template.');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Erro ao excluir template.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Templates Customizáveis</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Button variant="contained" onClick={handleOpenCreateDialog}>Criar Novo Template</Button>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Templates Existentes</Typography>
        <List>
          {templates.length > 0 ? (
            templates.map(template => (
              <ListItem
                key={template.id}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(template)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTemplate(template.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={template.name}
                  secondary={`Tipo: ${template.type}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="Nenhum template encontrado." /></ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentTemplate ? 'Editar Template' : 'Criar Novo Template'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Template"
            type="text"
            fullWidth
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tipo do Template (e.g., email, pdf, receipt)"
            type="text"
            fullWidth
            value={newTemplateType}
            onChange={(e) => setNewTemplateType(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Conteúdo do Template"
            type="text"
            fullWidth
            multiline
            rows={10}
            value={newTemplateContent}
            onChange={(e) => setNewTemplateContent(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveTemplate} variant="contained" disabled={loading}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesPage;