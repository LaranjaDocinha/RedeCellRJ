import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Grid, 
  TextField, 
  MenuItem, 
  Stack, 
  Typography, 
  Divider, 
  Autocomplete,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  createFilterOptions,
  alpha,
  useTheme,
  Alert,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    FaPlus, 
    FaTools, 
    FaMagic, 
    FaClock, 
    FaMoneyBillWave,
    FaUserPlus,
    FaTrash,
    FaPlusCircle,
    FaLightbulb
} from 'react-icons/fa';
import { Button } from './Button';
import api from '../services/api';
import moment from 'moment';

const filter = createFilterOptions<any>();

const serviceItemSchema = z.object({
    name: z.string().min(1, 'Serviço é obrigatório'),
    quality: z.string().min(1, 'Qualidade é obrigatória'),
    price: z.coerce.number().min(0, 'Preço inválido')
});

const serviceOrderSchema = z.object({
  customer_name: z.string().min(2, 'Nome do cliente é obrigatório'),
  customer_id: z.number().optional(),
  brand: z.string().min(1, 'Marca é obrigatória'),
  product_description: z.string().min(3, 'Aparelho é obrigatório'),
  imei: z.string().optional(),
  device_password: z.string().optional(),
  issue_description: z.string().min(5, 'Descreva o problema'),
  services: z.array(serviceItemSchema).min(1, 'Adicione ao menos um serviço'),
  estimated_cost: z.coerce.number().min(0, 'O valor não pode ser negativo'),
  down_payment: z.coerce.number().min(0, 'O sinal não pode ser negativo'),
  expected_delivery_date: z.string().optional(),
  observations: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
}).refine((data) => data.down_payment <= data.estimated_cost, {
  message: "O sinal não pode ser maior que o valor total",
  path: ["down_payment"],
});

type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;

const REPAIR_CATALOG = [
    "Troca de Tela", "Troca de Bateria", "Câmera Frontal", "Câmera Traseira", 
    "Alto Falante", "Conector de Carga", "Reparo em Placa", "Limpeza Química", 
    "Desoxidação", "Software / Atualização", "Vidro Traseiro", "Botão Power/Volume"
];

const UPSELL_MAP: Record<string, string[]> = {
    "Troca de Tela": ["Película 3D", "Película Cerâmica", "Película Privacidade", "Película Hidrogel", "Capa Anti-Impacto"],
    "Troca de Bateria": ["Cabo Lightning MFi", "Cabo USB-C Turbo", "Carregador 20W Original"],
    "Conector de Carga": ["Limpeza de Alto Falante", "Cabo Magnético"],
    "Reparo em Placa": ["Garantia Estendida 1 Ano", "Backup de Dados"]
};

const BRAND_OPTIONS = ["Apple", "Samsung", "Motorola", "Xiaomi", "Realme", "Google Pixel"];
const QUALITY_OPTIONS = ["Original", "Premium", "Primeira Linha", "Usada/OEM"];

interface ServiceOrderFormProps {
  onSubmit: (data: ServiceOrderFormData) => Promise<void>;
  onCancel: () => void;
  token: string;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ onSubmit, onCancel, token }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: { 
        priority: 'normal', 
        estimated_cost: 0, 
        down_payment: 0, 
        services: [],
        customer_name: '',
        brand: '',
        product_description: '',
        expected_delivery_date: moment().add(24, 'hours').format('YYYY-MM-DDTHH:mm')
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'services' });
  const watchedServices = watch('services') || [];

  const activeUpsells = useMemo(() => {
    const suggestions = new Set<string>();
    const currentServiceNames = watchedServices.map(s => s.name);
    watchedServices.forEach(s => {
        if (UPSELL_MAP[s.name]) {
            UPSELL_MAP[s.name].forEach(item => {
                if (!currentServiceNames.includes(item)) suggestions.add(item);
            });
        }
    });
    return Array.from(suggestions);
  }, [watchedServices]);

  useEffect(() => {
    const total = watchedServices.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    setValue('estimated_cost', total);
  }, [watchedServices, setValue]);

  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data || []);
    } catch (e) { console.error('Error fetching customers:', e); }
    finally { setLoadingCustomers(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const sectionBox = {
    p: 2.5, borderRadius: '16px', border: `1px solid ${theme.palette.divider}`,
    bgcolor: isDarkMode ? alpha('#fff', 0.01) : '#fff'
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2.5}>
        
        {/* CLIENTE E APARELHO */}
        <Grid size={{ xs: 12 }}>
            <Box sx={sectionBox}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2} sx={{ opacity: 0.7 }}>
                    <FaUserPlus size={14} /><Typography variant="overline" sx={{ letterSpacing: 1, fontWeight: 400 }}>RECEPÇÃO</Typography>
                </Stack>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="customer_name" control={control}
                            render={({ field: { onChange, value } }) => (
                            <Autocomplete
                                size="small" freeSolo options={customers}
                                getOptionLabel={(option) => typeof option === 'string' ? option : option.name || ''}
                                value={value || ''}
                                onInputChange={(_, newValue) => onChange(newValue)}
                                onChange={(_, newValue) => {
                                    const val = typeof newValue === 'string' ? newValue : newValue?.name || '';
                                    onChange(val);
                                    if (typeof newValue !== 'string' && newValue?.id) setValue('customer_id', newValue.id);
                                }}
                                renderInput={(params) => <TextField {...params} label="Nome do Cliente" error={!!errors.customer_name} required />}
                            />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="brand" control={control}
                            render={({ field: { onChange, value } }) => (
                            <Autocomplete
                                size="small" freeSolo options={BRAND_OPTIONS}
                                value={value || ''}
                                onInputChange={(_, newValue) => onChange(newValue)}
                                onChange={(_, newValue) => onChange(newValue || '')}
                                renderInput={(params) => <TextField {...params} label="Marca" placeholder="Ex: Apple" error={!!errors.brand} required />}
                            />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}><TextField fullWidth label="Modelo do Aparelho" size="small" {...register('product_description')} error={!!errors.product_description} required /></Grid>
                    <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="IMEI / Serial" size="small" {...register('imei')} /></Grid>
                </Grid>
            </Box>
        </Grid>

        {/* LISTA DE SERVIÇOS */}
        <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ ...sectionBox, minHeight: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.7 }}>
                        <FaTools size={14} /><Typography variant="overline" sx={{ letterSpacing: 1, fontWeight: 400 }}>LISTA DE REPAROS</Typography>
                    </Stack>
                    <Autocomplete
                        size="small" options={REPAIR_CATALOG}
                        value={null}
                        onChange={(_, newValue) => { if (newValue) append({ name: newValue, quality: 'Premium', price: 0 }); }}
                        renderInput={(params) => <TextField {...params} label="Adicionar Serviço" sx={{ width: 250 }} InputProps={{ ...params.InputProps, startAdornment: <FaPlusCircle style={{ marginLeft: 8, opacity: 0.5 }} /> }} />}
                    />
                </Stack>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'transparent', mb: 2 }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: isDarkMode ? alpha('#fff', 0.03) : '#f8f9fa' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 400, fontSize: '0.75rem' }}>SERVIÇO</TableCell>
                                <TableCell sx={{ fontWeight: 400, fontSize: '0.75rem' }}>QUALIDADE</TableCell>
                                <TableCell sx={{ fontWeight: 400, fontSize: '0.75rem' }} align="right">VALOR (R$)</TableCell>
                                <TableCell sx={{ width: 40 }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell sx={{ py: 1.5 }}><Typography variant="body2" sx={{ fontWeight: 400 }}>{field.name}</Typography></TableCell>
                                    <TableCell>
                                        <Controller
                                            name={`services.${index}.quality`} control={control}
                                            render={({ field }) => (
                                                <Select {...field} variant="standard" size="small" fullWidth sx={{ fontSize: '0.85rem' }} disableUnderline>
                                                    {QUALITY_OPTIONS.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
                                                </Select>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <TextField 
                                            variant="standard" size="small" type="number" {...register(`services.${index}.price`)}
                                            InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem', textAlign: 'right' } }}
                                            inputProps={{ style: { textAlign: 'right' }, min: 0 }}
                                        />
                                    </TableCell>
                                    <TableCell><IconButton size="small" color="error" onClick={() => remove(index)}><FaTrash size={12} /></IconButton></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {activeUpsells.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.03), borderRadius: '12px', border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}`, mb: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1.5} color="info.main">
                            <FaLightbulb size={14} /><Typography variant="caption" sx={{ letterSpacing: 0.5 }}>SUGESTÕES DE UP-SELL</Typography>
                        </Stack>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {activeUpsells.map(item => (
                                <Chip 
                                    key={item} label={`+ ${item}`} size="small" color="info" variant="outlined" 
                                    onClick={() => append({ name: item, quality: 'Premium', price: 0 })}
                                    sx={{ cursor: 'pointer', fontWeight: 400, fontSize: '0.7rem' }}
                                    icon={<FaMagic size={10} />}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <TextField fullWidth label="Defeito Reclamado (Relato)" multiline rows={2} {...register('issue_description')} error={!!errors.issue_description} required />
            </Box>
        </Grid>

        {/* RESUMO FINANCEIRO */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ ...sectionBox, height: '100%', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="overline" sx={{ letterSpacing: 1, opacity: 0.7, fontWeight: 400 }}>VALORES E PRAZOS</Typography>
                <Stack spacing={2.5} mt={2}>
                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: '12px', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, textAlign: 'center' }}>
                        <Typography variant="caption" color="success.main">TOTAL ESTIMADO</Typography>
                        <TextField 
                            fullWidth variant="standard" type="number" {...register('estimated_cost')} 
                            InputProps={{ 
                                startAdornment: <Typography variant="h5" sx={{ mr: 1, fontWeight: 400, color: 'success.main' }}>R$</Typography>,
                                disableUnderline: true, sx: { fontSize: '1.8rem', fontWeight: 400, color: theme.palette.success.main } 
                            }}
                            inputProps={{ style: { textAlign: 'center' }, min: 0 }}
                        />
                    </Box>

                    <TextField 
                        fullWidth label="Sinal / Adiantamento" size="small" type="number" {...register('down_payment')}
                        InputProps={{ startAdornment: <InputAdornment position="start"><FaMoneyBillWave size={14} /></InputAdornment> }}
                        error={!!errors.down_payment} helperText={errors.down_payment?.message} inputProps={{ min: 0 }}
                    />

                    <TextField 
                        fullWidth label="Previsão de Entrega" size="small" type="datetime-local" {...register('expected_delivery_date')}
                        InputProps={{ startAdornment: <InputAdornment position="start"><FaClock size={14} /></InputAdornment> }}
                    />

                    <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} select fullWidth label="Prioridade" size="small">
                                <MenuItem value="low">Baixa</MenuItem>
                                <MenuItem value="normal">Normal</MenuItem>
                                <MenuItem value="high">Urgente</MenuItem>
                            </TextField>
                        )}
                    />
                </Stack>
            </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Observações Estéticas / Detalhes de Entrada" multiline rows={2} {...register('observations')} placeholder="Ex: Marcas de uso no aro..." />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel} variant="text" color="inherit" label="Cancelar" />
        <Button type="submit" variant="contained" loading={isSubmitting} label="Gerar Orçamento Profissional" />
      </Stack>
    </Box>
  );
};

export default ServiceOrderForm;