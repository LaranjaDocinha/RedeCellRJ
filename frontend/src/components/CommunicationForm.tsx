import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface CommunicationFormProps {
  customerId: number;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CommunicationForm: React.FC<CommunicationFormProps> = ({ customerId, onSubmit, onCancel }) => {
  const { register, handleSubmit } = useForm();

  const handleFormSubmit = (data: any) => {
    onSubmit({ ...data, customer_id: customerId });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" mb={2}>Adicionar Registro de Comunicação</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Canal</InputLabel>
        <Select {...register('channel')} label="Canal" required>
          <MenuItem value="phone">Telefone</MenuItem>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="sms">SMS</MenuItem>
          <MenuItem value="whatsapp">WhatsApp</MenuItem>
          <MenuItem value="in-person">Presencial</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Direção</InputLabel>
        <Select {...register('direction')} label="Direção" required>
          <MenuItem value="inbound">Recebida</MenuItem>
          <MenuItem value="outbound">Enviada</MenuItem>
        </Select>
      </FormControl>
      <TextField {...register('summary')} label="Resumo" fullWidth required multiline rows={4} sx={{ mb: 2 }} />
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="contained">Salvar</Button>
      </Box>
    </form>
  );
};

export default CommunicationForm;
