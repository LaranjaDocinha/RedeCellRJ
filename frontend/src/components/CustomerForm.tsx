import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  StyledForm,
  StyledFormField,
  StyledLabel,
  StyledInput,
  StyledTextArea,
  StyledButtonContainer,
} from './CustomerForm.styled';
import { Button } from '../components/Button';
import { Box, Chip, Stack, FormHelperText } from '@mui/material';

// Schema de Validação Profissional
const customerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
  birth_date: z.string().optional(),
  referral_code: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: any;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || { tags: [] }
  });

  const tags = watch('tags') || [];
  const [tagInput, setTagInput] = React.useState('');

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key: any) => {
        setValue(key, initialData[key]);
      });
    }
  }, [initialData, setValue]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setValue('tags', [...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToDelete: string) => {
    setValue('tags', tags.filter(t => t !== tagToDelete));
  };

  // Funções de Máscara
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
    setValue('phone', masked);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = e.target.value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').slice(0, 14);
    setValue('cpf', masked);
  };

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <StyledFormField>
        <StyledLabel>Nome Completo</StyledLabel>
        <StyledInput {...register('name')} placeholder="Ex: João Silva" autoFocus />
        {errors.name && <FormHelperText error sx={{ ml: 1 }}>{errors.name.message}</FormHelperText>}
      </StyledFormField>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>E-mail</StyledLabel>
          <StyledInput {...register('email')} type="email" placeholder="joao@email.com" />
          {errors.email && <FormHelperText error sx={{ ml: 1 }}>{errors.email.message}</FormHelperText>}
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>WhatsApp</StyledLabel>
          <StyledInput {...register('phone')} onChange={handlePhoneChange} placeholder="(00) 00000-0000" value={watch('phone') || ''} />
          {errors.phone && <FormHelperText error sx={{ ml: 1 }}>{errors.phone.message}</FormHelperText>}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>CPF</StyledLabel>
          <StyledInput name="cpf" onChange={handleCPFChange} placeholder="000.000.000-00" value={watch('cpf') || ''} />
          {errors.cpf && <FormHelperText error sx={{ ml: 1 }}>{errors.cpf.message}</FormHelperText>}
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>Data de Nascimento</StyledLabel>
          <StyledInput {...register('birth_date')} type="date" />
        </Box>
      </Box>

      <StyledFormField>
        <StyledLabel>Endereço</StyledLabel>
        <StyledTextArea {...register('address')} rows={2} placeholder="Rua, Número, Bairro..." />
      </StyledFormField>

      <StyledFormField>
        <StyledLabel>Tags de Interesse</StyledLabel>
        <StyledInput 
          placeholder="Pressione Enter para adicionar" 
          value={tagInput} 
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
          {tags.map(tag => (
            <Chip key={tag} label={tag} onDelete={() => removeTag(tag)} size="small" color="primary" variant="outlined" />
          ))}
        </Stack>
      </StyledFormField>

      <StyledButtonContainer>
        <Button onClick={onCancel} variant="outlined" color="secondary" label="Cancelar" />
        <Button type="submit" loading={loading} label={initialData?.id ? 'Atualizar' : 'Cadastrar'} />
      </StyledButtonContainer>
    </StyledForm>
  );
};