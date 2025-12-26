import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  Paper, 
  IconButton, 
  Divider, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Stack,
  alpha,
  useTheme,
  Popover,
  InputAdornment,
  Autocomplete,
  Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaBarcode, 
  FaBox, 
  FaTruck, 
  FaLayerGroup,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { fetchProductById, createProduct, updateProduct } from '../../services/productService';
import axios from 'axios';
import styled from 'styled-components';

const StyledSection = styled(Box)<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff'};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)'};
  margin-bottom: 12px;
`;

const SectionHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: ${props => props.theme.palette.text.secondary};
  & p { font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase; font-size: 0.7rem; }
`;

const VariationContainer = styled(Box)<{ isDarkMode: boolean }>`
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f0f0f0'};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  position: relative;
  background: ${props => props.isDarkMode ? 'rgba(0, 0, 0, 0.1)' : '#fafafa'};
`;

// --- Validation Schemas ---
const variationSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  sku: z.string().nonempty('Obrigatório'),
  price: z.coerce.number().positive('Inválido'),
  cost_price: z.coerce.number().min(0, 'Inválido'),
  stock_quantity: z.coerce.number().int().min(0),
});

const supplierSchema = z.object({
  supplier_id: z.coerce.number().positive(),
});

const productSchema = z.object({
  name: z.string().nonempty('Nome obrigatório'),
  branch_id: z.coerce.number().positive(),
  sku: z.string().nonempty('SKU obrigatório'),
  description: z.string().optional(),
  product_type: z.string().nonempty(),
  is_serialized: z.boolean().default(false),
  variations: z.array(variationSchema).min(1),
  suppliers: z.array(supplierSchema).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string | number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId, onSuccess, onCancel }) => {
  const isEditMode = Boolean(productId);
  const theme = useTheme();
  const { token } = useAuth();
  const { addNotification } = useNotification();
  
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLButtonElement | null>(null);

  const isDarkMode = theme.palette.mode === 'dark';

  const {
    register, control, handleSubmit, reset, watch, formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', sku: '', description: '', product_type: 'Celular',
      branch_id: 1, is_serialized: false,
      variations: [{ sku: '', price: 0, cost_price: 0, stock_quantity: 0 }],
      suppliers: [],
    },
  });

  const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
    control, name: 'variations',
  });

  const { fields: supplierFields, append: appendSupplier, remove: removeSupplier } = useFieldArray({
    control, name: 'suppliers',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [branchesRes, categoriesRes, suppliersRes] = await Promise.all([
          axios.get('/api/branches', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/suppliers', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setBranches(branchesRes.data);
        setCategories(categoriesRes.data);
        setSuppliers(suppliersRes.data);
        if (isEditMode && productId) {
          const product = await fetchProductById(String(productId), token!);
          reset(product);
        }
      } catch (error: any) {
        addNotification('Erro ao carregar dados.', 'error');
      } finally { setLoading(false); }
    };
    loadInitialData();
  }, [productId, isEditMode, token, reset, addNotification]);

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      if (isEditMode && productId) {
        await updateProduct(String(productId), data, token!);
        addNotification('Produto atualizado!', 'success');
      } else {
        await createProduct(data, token!);
        addNotification('Produto criado!', 'success');
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      addNotification(error.message || 'Erro ao salvar.', 'error');
    } finally { setSubmitting(false); }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress size={30} /></Box>;

  return (
    <Box sx={{ p: 0.5 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={1.5}>
          
          {/* IDENTIFICAÇÃO */}
          <Grid item xs={12}>
            <StyledSection isDarkMode={isDarkMode}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth label="Nome do Produto" size="small"
                    {...register('name')} error={!!errors.name}
                    InputProps={{ sx: { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label="SKU Base" size="small"
                    {...register('sku')} error={!!errors.sku}
                    InputProps={{ sx: { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Descrição" multiline rows={1} size="small"
                    {...register('description')}
                    InputProps={{ sx: { borderRadius: '8px' } }}
                  />
                </Grid>
              </Grid>
            </StyledSection>
          </Grid>

          {/* PREÇOS E ESTOQUE */}
          <Grid item xs={12}>
            <StyledSection isDarkMode={isDarkMode}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <SectionHeader sx={{ mb: 0 }}>
                  <FaLayerGroup />
                  <Typography>Preços e Estoque</Typography>
                </SectionHeader>
                <Button 
                  startIcon={<FaPlus />} size="small" variant="text" color="secondary"
                  onClick={() => appendVariation({ sku: '', price: 0, cost_price: 0, stock_quantity: 0 })}
                  sx={{ fontWeight: 400 }}
                >
                  Adicionar
                </Button>
              </Box>
              
              <Box sx={{ maxHeight: '300px', overflowY: 'auto', px: 0.5 }}>
                {variationFields.map((field, index) => (
                  <VariationContainer key={field.id} isDarkMode={isDarkMode}>
                    {variationFields.length > 1 && (
                      <IconButton 
                        size="small" color="error" 
                        onClick={() => removeVariation(index)}
                        sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
                      >
                        <FaTrash size={12} />
                      </IconButton>
                    )}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={7}>
                        <TextField 
                          fullWidth size="small" label="Modelo / Cor" variant="standard"
                          {...register(`variations.${index}.name`)} 
                          placeholder="Ex: 128GB Preto"
                          InputProps={{ sx: { fontSize: '0.9rem' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField 
                          fullWidth size="small" label="SKU Variação" variant="standard"
                          {...register(`variations.${index}.sku`)} 
                          error={!!errors.variations?.[index]?.sku}
                          InputProps={{ sx: { fontSize: '0.9rem' } }}
                        />
                      </Grid>
                      
                      <Grid item xs={4}>
                        <TextField 
                          fullWidth size="small" label="Compra (R$)" type="number" variant="standard"
                          {...register(`variations.${index}.cost_price`)} 
                          inputProps={{ style: { color: theme.palette.error.main, fontWeight: 400, fontSize: '0.85rem' } }} 
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField 
                          fullWidth size="small" label="Venda (R$)" type="number" variant="standard"
                          {...register(`variations.${index}.price`)} 
                          inputProps={{ style: { color: theme.palette.success.main, fontWeight: 400, fontSize: '0.85rem' } }} 
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField 
                          fullWidth size="small" label="Estoque" type="number" variant="standard"
                          {...register(`variations.${index}.stock_quantity`)} 
                          inputProps={{ style: { textAlign: 'center', fontSize: '0.85rem' } }} 
                        />
                      </Grid>
                    </Grid>
                  </VariationContainer>
                ))}
              </Box>
            </StyledSection>
          </Grid>

          {/* FORNECEDORES */}
          <Grid item xs={12}>
            <StyledSection isDarkMode={isDarkMode} sx={{ py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="caption" sx={{ fontWeight: 400, color: 'text.secondary', minWidth: '80px' }}>FORNECEDORES:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {supplierFields.map((field, index) => {
                    const supplier = suppliers.find(s => s.id === watch(`suppliers.${index}.supplier_id`));
                    return (
                      <Chip 
                        key={field.id} size="small" variant="outlined"
                        label={supplier?.name || '...'}
                        onDelete={() => removeSupplier(index)}
                        sx={{ borderRadius: '6px', fontSize: '0.7rem' }}
                      />
                    );
                  })}
                  <Autocomplete
                    size="small" options={suppliers}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, value) => value && appendSupplier({ supplier_id: value.id })}
                    sx={{ width: 140 }}
                    renderInput={(params) => (
                      <TextField {...params} variant="standard" placeholder="+ Vincular" 
                        sx={{ '& .MuiInputBase-root': { fontSize: '0.75rem', py: 0 } }} 
                      />
                    )}
                    ListboxProps={{ sx: { fontSize: '0.75rem' } }}
                  />
                </Box>
              </Box>
            </StyledSection>
          </Grid>
        </Grid>

        {/* FOOTER */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={2} sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
          <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)} color="primary" size="small"><FaCog /></IconButton>
          <Box display="flex" gap={1}>
            <Button onClick={onCancel} size="small" color="inherit" sx={{ fontWeight: 400 }}>Cancelar</Button>
            <Button type="submit" variant="contained" size="small" disabled={submitting} sx={{ px: 3, borderRadius: '6px', fontWeight: 400 }}>
                {isEditMode ? 'Salvar' : 'Finalizar'}
            </Button>
          </Box>
        </Box>

        <Popover
            open={Boolean(settingsAnchor)} anchorEl={settingsAnchor}
            onClose={() => setSettingsAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ 
                sx: { 
                    p: 2, 
                    width: 260, 
                    borderRadius: '12px',
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[10]
                } 
            }}
        >
            <Stack spacing={2}>
                <Typography variant="caption" fontWeight="400" sx={{ color: theme.palette.text.secondary }}>CONFIGURAÇÕES</Typography>
                <FormControl fullWidth size="small">
                    <InputLabel>Filial</InputLabel>
                    <Controller name="branch_id" control={control} render={({ field }) => (
                        <Select {...field} label="Filial">{branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</Select>
                    )}/>
                </FormControl>
                <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Controller name="product_type" control={control} render={({ field }) => (
                        <Select {...field} label="Tipo">
                          <MenuItem value="Celular">📱 Celular</MenuItem>
                          <MenuItem value="Peça">🔧 Peça</MenuItem>
                          <MenuItem value="Acessório">🎧 Acessório</MenuItem>
                        </Select>
                    )}/>
                </FormControl>
                <FormControlLabel control={<Switch size="small" {...register('is_serialized')} />}
                    label={<Typography variant="caption">Controle por Serial/IMEI</Typography>}
                />
            </Stack>
        </Popover>
      </form>
    </Box>
  );
};

export default ProductForm;