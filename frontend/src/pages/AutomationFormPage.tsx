import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Box, Typography, Button, TextField, Paper, Grid, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AutomationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();

  const { register, control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: '',
      trigger_type: '',
      trigger_config: {},
      steps: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steps',
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchAutomation = async () => {
        const response = await fetch(`/api/marketing-automations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        reset(data);
      };
      fetchAutomation();
    }
  }, [id, isEditMode, token, reset]);

  const onSubmit = async (data: any) => {
    const url = isEditMode ? `/api/marketing-automations/${id}` : '/api/marketing-automations';
    const method = isEditMode ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    navigate('/marketing-automations');
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>{isEditMode ? 'Editar Automação' : 'Criar Automação'}</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField {...register('name')} label="Nome da Automação" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Gatilho</InputLabel>
                <Select {...register('trigger_type')} label="Gatilho">
                  <MenuItem value="sale.completed">Venda Realizada</MenuItem>
                  <MenuItem value="customer.created">Cliente Criado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h5" gutterBottom>Passos</Typography>
        {fields.map((field, index) => (
          <Paper key={field.id} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Passo</InputLabel>
                  <Select {...register(`steps.${index}.type`)} label="Tipo de Passo">
                    <MenuItem value="wait">Esperar</MenuItem>
                    <MenuItem value="send_email">Enviar Email</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {/* Render payload fields based on step type */}
                {watch(`steps.${index}.type`) === 'wait' && (
                  <TextField {...register(`steps.${index}.payload.days`)} label="Dias" type="number" fullWidth />
                )}
                {watch(`steps.${index}.type`) === 'send_email' && (
                  <TextField {...register(`steps.${index}.payload.email_template_id`)} label="ID do Template de Email" type="number" fullWidth />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <IconButton onClick={() => remove(index)}><Delete /></IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
        <Button startIcon={<Add />} onClick={() => append({ type: 'wait', payload: { days: 1 } })}>Adicionar Passo</Button>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button type="submit" variant="contained">Salvar</Button>
        </Box>
      </form>
    </Box>
  );
};

export default AutomationFormPage;
