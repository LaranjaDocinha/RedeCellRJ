import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Paper,
  Grid,
  IconButton,
} from '@mui/material';
import { Save, Add, Delete, Preview, Mail, Message } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface Template {
  id?: string;
  name: string;
  type: 'email' | 'sms';
  subject: string | null;
  content: string;
}

interface TemplateEditorProps {
  initialTemplate?: Template;
  onSave: (template: Template) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onDelete,
}) => {
  const [template, setTemplate] = useState<Template>(
    initialTemplate || {
      name: '',
      type: 'email',
      subject: '',
      content: '',
    },
  );
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const { token } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: SelectChangeEvent<'email' | 'sms'>) => {
    setTemplate((prev) => ({ ...prev, type: e.target.value as 'email' | 'sms' }));
  };

  const handleSave = useCallback(async () => {
    if (!token) {
      showNotification('Erro de autenticação. Por favor, faça login novamente.', 'error');
      return;
    }
    if (!template.name || !template.content) {
      showNotification('Nome e conteúdo do template são obrigatórios.', 'error');
      return;
    }
    await onSave(template);
  }, [template, onSave, token, showNotification]);

  const handleDelete = useCallback(async () => {
    if (!token) {
      showNotification('Erro de autenticação. Por favor, faça login novamente.', 'error');
      return;
    }
    if (template.id && onDelete && window.confirm('Tem certeza que deseja excluir este template?')) {
      await onDelete(template.id);
    }
  }, [template.id, onDelete, token, showNotification]);

  const handlePreview = useCallback(async () => {
    if (!token) {
      showNotification('Erro de autenticação. Por favor, faça login novamente.', 'error');
      return;
    }
    if (!template.content) {
      showNotification('Conteúdo do template é necessário para pré-visualização.', 'error');
      return;
    }

    setLoadingPreview(true);
    try {
      // Mock context for preview (can be made dynamic later)
      const mockContext = {
        customer_name: 'João Silva',
        product_name: 'Produto X',
        order_number: '12345',
        // Adicione outras variáveis de contexto de exemplo aqui
      };

      const response = await fetch('/api/templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: template.content, context: mockContext }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPreviewContent(data.renderedContent);
    } catch (err: any) {
      console.error('Falha ao gerar pré-visualização:', err);
      showNotification(err.message || 'Falha ao gerar pré-visualização.', 'error');
    } finally {
      setLoadingPreview(false);
    }
  }, [template.content, token, showNotification]);

  const insertVariable = (variable: string) => {
    setTemplate((prev) => ({
      ...prev,
      content: prev.content + `{{ ${variable} }}`,
    }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialTemplate ? 'Editar Template' : 'Novo Template'}
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome do Template"
            name="name"
            value={template.name}
            onChange={handleInputChange}
            variant="outlined"
            size="small"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <Select
              name="type"
              value={template.type}
              label="Tipo"
              onChange={handleTypeChange}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {template.type === 'email' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Assunto do Email"
              name="subject"
              value={template.subject || ''}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Conteúdo do Template"
            name="content"
            value={template.content}
            onChange={handleInputChange}
            variant="outlined"
            multiline
            rows={10}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2">Variáveis Disponíveis:</Typography>
            <Button size="small" variant="outlined" onClick={() => insertVariable('customer_name')}>{{ customer_name }}</Button>
            <Button size="small" variant="outlined" onClick={() => insertVariable('product_name')}>{{ product_name }}</Button>
            <Button size="small" variant="outlined" onClick={() => insertVariable('order_number')}>{{ order_number }}</Button>
            {/* Adicionar mais variáveis conforme necessário */}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
            sx={{ mr: 1 }}
          >
            Salvar Template
          </Button>
          {onDelete && template.id && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              Excluir Template
            </Button>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={handlePreview}
          disabled={loadingPreview}
        >
          {loadingPreview ? <CircularProgress size={24} /> : 'Pré-visualizar'}
        </Button>
      </Box>

      {previewContent && (
        <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pré-visualização
          </Typography>
          {template.type === 'email' ? (
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {previewContent}
            </Typography>
          )}
        </Paper>
      )}
    </Paper>
  );
};

export default TemplateEditor;
