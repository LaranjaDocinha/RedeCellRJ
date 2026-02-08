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
import { Box, Chip, Stack, FormHelperText, CircularProgress, InputAdornment } from '@mui/material';
import { fetchAddressByCep } from '../utils/addressUtils';

// Schema de Validação Profissional
const customerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().optional().or(z.literal('')),
  cep: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
// ...
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
            const address = await fetchAddressByCep(cepValue);
            if (address) {
                setValue('address', `${address.street}, - ${address.neighborhood}, ${address.city} - ${address.state}`);
            }
            setIsCepLoading(false);
        }
    };
    
    const timeout = setTimeout(handleCepBlur, 1000);
    return () => clearTimeout(timeout);
  }, [cepValue, setValue]);
// ...
      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
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