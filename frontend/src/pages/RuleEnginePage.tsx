import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
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
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

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
      addToast('Regra salva com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      setIsModalOpen(false);
      setEditingRule(null);
    },
    onError: (err: any) => {
      addToast(`Erro ao salvar regra: ${err.response?.data?.message || err.message}`, 'error');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) =>
      axios.delete(`/api/rules/${ruleId}`, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => {
      addToast('Regra excluída com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (err: any) => {
      addToast(`Erro ao excluir regra: ${err.response?.data?.message || err.message}`, 'error');
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
      id: editingRule?.id || `rule-${Date.now()}`, // Generate new ID for new rule
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

  const updateAction = (index: number, field: keyof Action | 'paramKey' | 'paramValue', value: any) => {
    setFormState((prev) => {
      const newActions = [...prev.actions];
      if (field === 'paramKey' && newActions[index]) {
          const oldParams = newActions[index].params || {};
          const newParams = { ...oldParams };
          delete newParams[value]; // Assuming value is the old key
          newActions[index].params = newParams;
      } else if (field === 'paramValue' && newActions[index]) {
          // This logic is more complex for dynamic params. Simplified for single param for now.
      } else {
          newActions[index] = { ...newActions[index], [field]: value };
      }
      return { ...prev, actions: newActions };
    });
  };
  
  const handleActionParamChange = (actionIndex: number, key: string, value: any) => {
    setFormState((prev) => {
      const newActions = [...prev.actions];
      newActions[actionIndex].params = { ...newActions[actionIndex].params, [key]: value };
      return { ...prev, actions: newActions };
    });
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
  // --- End Rule Form Logic ---

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Erro ao carregar regras.</Typography>;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Motor de Regras de Negócio</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Nova Regra
        </Button>
      </Box>

      <List>
        <AnimatePresence>
          {(rules || []).map((rule) => (
            <motion.div
              key={rule.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Paper elevation={1} sx={{ mb: 2 }}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant="h6">{rule.name}</Typography>
                        <Typography variant="body2" color="textSecondary">{rule.description}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Chip label={rule.eventType} color="primary" size="small" />
                      </Grid>
                      <Grid item xs={1}>
                        <Chip label={rule.isActive ? 'Ativa' : 'Inativa'} color={rule.isActive ? 'success' : 'default'} size="small" />
                      </Grid>
                      <Grid item xs={1}>
                        <IconButton onClick={(e) => { e.stopPropagation(); handleEditRule(rule); }} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteRule(rule.id); }} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box mb={2}>
                      <Typography variant="subtitle1">Condições:</Typography>
                      {rule.conditions.length > 0 ? (
                        <List dense>
                          {rule.conditions.map((cond, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={`Se ${cond.fact} ${cond.operator} ${cond.value}`} />
                            </ListItem>
                          ))}
                        </List>
                      ) : <Typography variant="body2">Nenhuma condição definida.</Typography>}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1">Ações:</Typography>
                      {rule.actions.length > 0 ? (
                        <List dense>
                          {rule.actions.map((action, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={`${action.type} (${JSON.stringify(action.params)})`} />
                            </ListItem>
                          ))}
                        </List>
                      ) : <Typography variant="body2">Nenhuma ação definida.</Typography>}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
      </List>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingRule ? 'Editar Regra' : 'Criar Nova Regra'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleModalSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="dense"
              name="id"
              label="ID da Regra (Único)"
              type="text"
              fullWidth
              value={formState.id}
              onChange={handleFormChange}
              required
              disabled={!!editingRule}
              helperText={editingRule ? "O ID não pode ser alterado após a criação." : "Gerado automaticamente para novas regras se deixado em branco."}
            />
            <TextField
              margin="dense"
              name="name"
              label="Nome da Regra"
              type="text"
              fullWidth
              value={formState.name}
              onChange={handleFormChange}
              required
            />
            <TextField
              margin="dense"
              name="description"
              label="Descrição"
              type="text"
              fullWidth
              multiline
              rows={2}
              value={formState.description}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              name="eventType"
              label="Tipo de Evento"
              type="text"
              fullWidth
              value={formState.eventType}
              onChange={handleFormChange}
              required
              helperText="Ex: cart.total_change, product.added, customer.created"
            />
            <FormControlLabel
                control={<Switch checked={formState.isActive} onChange={handleToggleActive} />}
                label="Ativa"
                sx={{ mt: 2 }}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Condições</Typography>
            {formState.conditions.map((cond, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={4}>
                    <TextField
                      label="Fato (Fact)"
                      value={cond.fact}
                      onChange={(e) => updateCondition(index, 'fact', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Operador"
                      select
                      value={cond.operator}
                      onChange={(e) => updateCondition(index, 'operator', e.target.value as Condition['operator'])}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="equal">Igual</MenuItem>
                      <MenuItem value="notEqual">Diferente</MenuItem>
                      <MenuItem value="greaterThan">Maior que</MenuItem>
                      <MenuItem value="lessThan">Menor que</MenuItem>
                      <MenuItem value="greaterThanInclusive">Maior ou Igual</MenuItem>
                      <MenuItem value="lessThanInclusive">Menor ou Igual</MenuItem>
                      <MenuItem value="contains">Contém</MenuItem>
                      <MenuItem value="notContains">Não Contém</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Valor"
                      value={cond.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton onClick={() => removeCondition(index)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button startIcon={<AddIcon />} onClick={addCondition} variant="outlined" sx={{ mt: 1 }}>
              Adicionar Condição
            </Button>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Ações</Typography>
            {formState.actions.map((action, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      label="Tipo de Ação"
                      value={action.type}
                      onChange={(e) => updateAction(index, 'type', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Parâmetros (JSON)"
                      value={JSON.stringify(action.params)}
                      onChange={(e) => {
                        try {
                          handleActionParamChange(index, 'params', JSON.parse(e.target.value));
                        } catch (err) {
                          // Handle invalid JSON input
                        }
                      }}
                      fullWidth
                      size="small"
                      helperText="Ex: { 'percentage': 10, 'reason': 'Bulk Discount' }"
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton onClick={() => removeAction(index)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button startIcon={<AddIcon />} onClick={addAction} variant="outlined" sx={{ mt: 1 }}>
              Adicionar Ação
            </Button>

            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={createOrUpdateRuleMutation.isPending}>
                Salvar Regra
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RuleEnginePage;
