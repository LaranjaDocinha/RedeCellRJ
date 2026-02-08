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
import { Box, Chip, Stack, CircularProgress, LinearProgress } from '@mui/material';
import { fetchAddressByCep } from '../utils/addressUtils';

// Schema de Validação Profissional
const customerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().optional().or(z.literal('')),
  cep: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
  tags: z.array(z.string()).default([]),
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
  const [isCepLoading, setIsCepLoading] = React.useState(false);

  const cepValue = watch('cep');

  useEffect(() => {
    const handleCepBlur = async () => {
        if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
            setIsCepLoading(true);
            try {
                const address = await fetchAddressByCep(cepValue);
                if (address) {
                    setValue('address', `${address.street}, ${address.neighborhood}, ${address.city} - ${address.state}`);
                }
            } catch (error) {
                console.error('Failed to fetch address:', error);
            } finally {
                setIsCepLoading(false);
            }
        }
    };
    
    const timeout = setTimeout(handleCepBlur, 1000);
    return () => clearTimeout(timeout);
  }, [cepValue, setValue]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput && !tags.includes(tagInput)) {
        setValue('tags', [...tags, tagInput]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(t => t !== tagToRemove));
  };

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>Nome Completo</StyledLabel>
          <StyledInput {...register('name')} placeholder="Ex: João Silva" />
          {errors.name && <Typography variant="caption" color="error">{errors.name.message}</Typography>}
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>CPF (Opcional)</StyledLabel>
          <StyledInput {...register('cpf')} placeholder="000.000.000-00" />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, mt: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>E-mail</StyledLabel>
          <StyledInput {...register('email')} placeholder="email@exemplo.com" />
          {errors.email && <Typography variant="caption" color="error">{errors.email.message}</Typography>}
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>WhatsApp / Telefone</StyledLabel>
          <StyledInput {...register('phone')} placeholder="(21) 99999-9999" />
          {errors.phone && <Typography variant="caption" color="error">{errors.phone.message}</Typography>}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, mt: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>CEP</StyledLabel>
          <StyledInput 
            {...register('cep')} 
            placeholder="00000-000" 
            onChange={(e) => {
                const masked = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
                setValue('cep', masked);
            }}
          />
        </Box>
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: { xs: '100%', sm: 0 } }}>
          <StyledLabel>Endereço Completo</StyledLabel>
          <StyledTextArea 
            {...register('address')} 
            rows={2} 
            placeholder="Rua, Número, Bairro..." 
            disabled={isCepLoading}
          />
          {isCepLoading && <LinearProgress sx={{ height: 2, borderRadius: 1 }} />}
        </Box>
      </Box>

      <StyledFormField sx={{ mt: 2 }}>
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

const Typography: React.FC<any> = ({ children, color, variant }) => (
    <Box component="span" sx={{ color: color === 'error' ? 'error.main' : 'inherit', fontSize: variant === 'caption' ? '0.75rem' : 'inherit' }}>
        {children}
    </Box>
);
