import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Divider,
  Container,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { whatsappService, WhatsappTemplate } from '../services/whatsappService';
import { WhatsAppPreview } from '../components/WhatsAppPreview';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

const MotionPaper = motion(Paper);

export const WhatsAppTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, watch, setValue } = useForm<{ name: string; content: string }>();
  const watchedContent = watch('content', '');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await whatsappService.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Erro ao carregar templates.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      reset({
        name: selectedTemplate.name,
        content: selectedTemplate.content,
      });
    } else {
      reset({ name: '', content: '' });
    }
  }, [selectedTemplate, reset]);

  const onSubmit = async (data: { name: string; content: string }) => {
    try {
      await whatsappService.upsertTemplate(data);
      await fetchTemplates();
      // Encontrar o template atualizado e selecioná-lo novamente para manter o foco
      const updated = templates.find(t => t.name === data.name) || { ...data, is_active: true }; 
      // Nota: o fetchTemplates é assíncrono, então a lista 'templates' aqui ainda é a antiga. 
      // Idealmente atualizamos o estado local otimisticamente ou esperamos o fetch.
      // Simplificando:
      setSelectedTemplate({ ...updated, ...data } as WhatsappTemplate);
      alert('Template salvo com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar template.');
    }
  };

  const handleDelete = async (name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o template "${name}"?`)) {
      try {
        await whatsappService.deleteTemplate(name);
        if (selectedTemplate?.name === name) {
          setSelectedTemplate(null);
        }
        await fetchTemplates();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir template.');
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    reset({ name: '', content: '' });
  };

  const insertVariable = (variable: string) => {
    const currentContent = watchedContent;
    setValue('content', currentContent + ` {{${variable}}} `);
  };

  const commonVariables = ['name', 'os_id', 'status', 'total', 'link', 'device'];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 'bold', color: '#128c7e' }}>
        Gerenciador de Templates WhatsApp
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Lista de Templates */}
        <Grid item xs={12} md={4}>
          <MotionPaper 
            elevation={3} 
            sx={{ height: '75vh', overflow: 'auto' }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Meus Templates</Typography>
              <Button startIcon={<AddIcon />} variant="contained" color="primary" onClick={handleCreateNew}>
                Novo
              </Button>
            </Box>
            <Divider />
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : (
              <List>
                <AnimatePresence>
                  {templates.map((template) => (
                    <ListItem 
                      key={template.name} 
                      button 
                      selected={selectedTemplate?.name === template.name}
                      onClick={() => setSelectedTemplate(template)}
                      component={motion.div}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ListItemText 
                        primary={template.name} 
                        secondary={template.content.substring(0, 40) + '...'} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(template.name)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </AnimatePresence>
              </List>
            )}
          </MotionPaper>
        </Grid>

        {/* Editor e Preview */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Editor */}
            <Grid item xs={12} lg={7}>
              <MotionPaper 
                elevation={3} 
                sx={{ p: 3, height: '100%' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Typography variant="h6" gutterBottom>
                  {selectedTemplate ? `Editando: ${selectedTemplate.name}` : 'Novo Template'}
                </Typography>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Nome é obrigatório' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Nome do Template (ex: pedido_pronto)"
                        fullWidth
                        margin="normal"
                        disabled={!!selectedTemplate} // Não permitir mudar nome na edição por simplicidade (chave primária lógica)
                        error={!!fieldState.error}
                        helperText={selectedTemplate ? "O nome não pode ser alterado após criado." : fieldState.error?.message}
                      />
                    )}
                  />

                  <Box my={2}>
                    <Typography variant="subtitle2" gutterBottom>Variáveis Disponíveis:</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {commonVariables.map(v => (
                        <Chip 
                          key={v} 
                          label={v} 
                          onClick={() => insertVariable(v)} 
                          clickable 
                          icon={<CopyIcon />}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>

                  <Controller
                    name="content"
                    control={control}
                    rules={{ required: 'Conteúdo é obrigatório' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Conteúdo da Mensagem"
                        fullWidth
                        multiline
                        rows={8}
                        margin="normal"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />

                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      startIcon={<SaveIcon />}
                    >
                      Salvar Template
                    </Button>
                  </Box>
                </form>
              </MotionPaper>
            </Grid>

            {/* Preview */}
            <Grid item xs={12} lg={5}>
              <Box display="flex" justifyContent="center" alignItems="flex-start" height="100%">
                <WhatsAppPreview 
                  content={watchedContent || 'Selecione ou crie um template para visualizar...'} 
                  variables={{
                    name: 'Maria Silva',
                    os_id: '12345',
                    status: 'Pronto',
                    total: '150,00',
                    link: 'redercell.com.br/track/123',
                    device: 'iPhone 11'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
