import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Divider,
  Stack,
  useTheme,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Rule as RuleIcon,
  AutoFixHigh as MagicIcon,
  SettingsSuggest as LogicIcon,
  PlayCircleOutline as RunIcon,
  Block as StopIcon,
  ArrowForward as ArrowIcon,
  Code as CodeIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';

// Interfaces (must match backend service)
interface Condition {
  fact: string;
  operator: 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'greaterThanInclusive' | 'lessThanInclusive' | 'contains' | 'notContains';
  value: any;
}

interface Action {
  type: string;
  params: Record<string, any>;
}

interface Rule {
  id: string;
  name: string;
  description?: string;
  eventType: string;
  conditions: Condition[];
  actions: Action[];
  isActive: boolean;
}

const RuleEnginePage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const {
    data: rules,
    isLoading,
    error,
  } = useQuery<Rule[]>({
    queryKey: ['rules'],
    queryFn: async () => {
      const response = await axios.get('/api/rules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

  const createOrUpdateRuleMutation = useMutation({
    mutationFn: (ruleData: Rule) =>
      axios.post('/api/rules', ruleData, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => {
      showNotification('Regra salva com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      setIsModalOpen(false);
      setEditingRule(null);
    },
    onError: (err: any) => {
      showNotification(`Erro ao salvar regra: ${err.response?.data?.message || err.message}`, 'error');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) =>
      axios.delete(`/api/rules/${ruleId}`, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => {
      showNotification('Regra excluída com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (err: any) => {
      showNotification(`Erro ao excluir regra: ${err.response?.data?.message || err.message}`, 'error');
    },
  });

  const handleCreateNew = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta regra?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  // --- Rule Form Logic ---
  const [formState, setFormState] = useState<Rule>(() => ({
    id: editingRule?.id || '',
    name: editingRule?.name || '',
    description: editingRule?.description || '',
    eventType: editingRule?.eventType || '',
    conditions: editingRule?.conditions || [],
    actions: editingRule?.actions || [],
    isActive: editingRule?.isActive ?? true,
  }));

  useEffect(() => {
    setFormState({
      id: editingRule?.id || `rule-${Date.now()}`,
      name: editingRule?.name || '',
      description: editingRule?.description || '',
      eventType: editingRule?.eventType || '',
      conditions: editingRule?.conditions || [],
      actions: editingRule?.actions || [],
      isActive: editingRule?.isActive ?? true,
    });
  }, [editingRule]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const addCondition = () => {
    setFormState((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { fact: '', operator: 'equal', value: '' }],
    }));
  };

  const updateCondition = (index: number, field: keyof Condition, value: any) => {
    setFormState((prev) => {
      const newConditions = [...prev.conditions];
      newConditions[index] = { ...newConditions[index], [field]: value };
      return { ...prev, conditions: newConditions };
    });
  };

  const removeCondition = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const addAction = () => {
    setFormState((prev) => ({
      ...prev,
      actions: [...prev.actions, { type: '', params: {} }],
    }));
  };

  const updateAction = (index: number, field: keyof Action, value: any) => {
    setFormState((prev) => {
      const newActions = [...prev.actions];
      newActions[index] = { ...newActions[index], [field]: value };
      return { ...prev, actions: newActions };
    });
  };
  
  const handleActionParamChange = (actionIndex: number, value: string) => {
    try {
      const parsed = JSON.parse(value);
      setFormState((prev) => {
        const newActions = [...prev.actions];
        newActions[actionIndex].params = parsed;
        return { ...prev, actions: newActions };
      });
    } catch (e) {
      // Ignora erro temporário de digitação de JSON
    }
  };

  const removeAction = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateRuleMutation.mutate(formState);
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', m: 'auto', mt: 10 }} />;

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'warning.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <LogicIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'warning.main', letterSpacing: 2 }}>
              AUTOMAÇÃO INTELIGENTE
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Motor de Regras
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Crie fluxos lógicos para automatizar descontos, notificações e comportamentos do sistema.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<AddIcon />} 
          onClick={handleCreateNew}
          sx={{ borderRadius: '14px', px: 4, py: 1.5, fontWeight: 800, textTransform: 'none', bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
        >
          Nova Regra
        </Button>
      </Box>

      <Stack spacing={3}>
        <AnimatePresence>
          {(rules || []).map((rule, idx) => (
            <motion.div key={rule.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Paper sx={{ 
                p: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid', borderColor: 'divider',
                bgcolor: rule.isActive ? 'background.paper' : 'action.hover',
                '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.05)', borderColor: 'warning.light' }
              }}>
                <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={3} width="100%" pr={2}>
                      <Avatar sx={{ bgcolor: rule.isActive ? 'warning.light' : 'action.disabled', color: 'white', borderRadius: '12px' }}>
                        <RuleIcon />
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle1" fontWeight={800}>{rule.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <RunIcon sx={{ fontSize: 14 }} /> Gatilho: <strong>{rule.eventType}</strong>
                        </Typography>
                      </Box>
                      <Chip 
                        label={rule.isActive ? "ATIVA" : "DESATIVADA"} 
                        size="small" 
                        color={rule.isActive ? "success" : "default"}
                        sx={{ fontWeight: 900, borderRadius: '6px', fontSize: '0.65rem' }}
                      />
                      <Box>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditRule(rule); }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteRule(rule.id); }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 4, pb: 4 }}>
                    <Divider sx={{ mb: 3, opacity: 0.5 }} />
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="overline" fontWeight={800} color="text.secondary" display="block" mb={2}>Condições (IF)</Typography>
                        <Stack spacing={1}>
                          {rule.conditions.map((cond, i) => (
                            <Box key={i} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '12px', display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip label={cond.fact} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                              <Typography variant="body2" fontWeight={600} color="primary">{cond.operator}</Typography>
                              <Typography variant="body2" fontWeight={800}>"{cond.value}"</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="overline" fontWeight={800} color="text.secondary" display="block" mb={2}>Ações (THEN)</Typography>
                        <Stack spacing={1}>
                          {rule.actions.map((action, i) => (
                            <Box key={i} sx={{ p: 1.5, bgcolor: 'warning.50', borderRadius: '12px', display: 'flex', gap: 1, alignItems: 'center', border: '1px solid', borderColor: 'warning.100' }}>
                              <MagicIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                              <Typography variant="body2" fontWeight={800} sx={{ color: 'warning.dark' }}>{action.type}</Typography>
                              <Tooltip title={JSON.stringify(action.params)}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', cursor: 'help' }}>Ver parâmetros</Typography>
                              </Tooltip>
                            </Box>
                          ))}
                        </Stack>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
      </Stack>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 900, p: 4, pb: 2 }}>{editingRule ? 'Configurar Fluxo' : 'Novo Fluxo de Trabalho'}</DialogTitle>
        <DialogContent sx={{ p: 4, pt: 0 }}>
          <Box component="form" onSubmit={handleModalSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nome da Automação" name="name" value={formState.name} onChange={handleFormChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Evento de Gatilho" name="eventType" value={formState.eventType} onChange={handleFormChange} required placeholder="ex: cart.checkout" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Descrição Curta" name="description" value={formState.description} onChange={handleFormChange} multiline rows={2} />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
              <Typography variant="h6" fontWeight={800}>Se estas condições forem verdadeiras:</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addCondition}>Adicionar Filtro</Button>
            </Box>
            
            <Stack spacing={2}>
              {formState.conditions.map((cond, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField label="Fato" value={cond.fact} onChange={(e) => updateCondition(index, 'fact', e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField select label="Operador" value={cond.operator} onChange={(e) => updateCondition(index, 'operator', e.target.value as any)} fullWidth size="small">
                        <MenuItem value="equal">Igual</MenuItem>
                        <MenuItem value="greaterThan">Maior que</MenuItem>
                        <MenuItem value="contains">Contém</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField label="Valor" value={cond.value} onChange={(e) => updateCondition(index, 'value', e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={1} textAlign="right">
                      <IconButton color="error" size="small" onClick={() => removeCondition(index)}><DeleteIcon /></IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
              <Typography variant="h6" fontWeight={800}>Execute estas ações:</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addAction}>Adicionar Ação</Button>
            </Box>

            <Stack spacing={2}>
              {formState.actions.map((action, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: '16px', borderLeft: '4px solid', borderColor: 'warning.main' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField label="Tipo de Ação" value={action.type} onChange={(e) => updateAction(index, 'type', e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <TextField label="Parâmetros (JSON)" value={JSON.stringify(action.params)} onChange={(e) => handleActionParamChange(index, e.target.value)} fullWidth size="small" helperText="Configure os dados da ação em formato JSON." />
                    </Grid>
                    <Grid item xs={12} sm={1} textAlign="right">
                      <IconButton color="error" size="small" onClick={() => removeAction(index)}><DeleteIcon /></IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>

            <Divider sx={{ my: 4 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <FormControlLabel control={<Switch checked={formState.isActive} onChange={handleToggleActive} />} label="Regra em Produção" />
              <DialogActions>
                <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="contained" color="warning" sx={{ borderRadius: '10px', px: 4, fontWeight: 800 }}>Salvar Automação</Button>
              </DialogActions>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RuleEnginePage;