import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Grid, 
  MenuItem, 
  FormControlLabel, 
  Switch, 
  Stack, 
  InputAdornment,
  Typography
} from '@mui/material';
import { Button } from '../components/Button';

interface CouponFormData {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  is_active?: boolean;
}

interface CouponFormProps {
  initialData?: CouponFormData & { id?: number };
  onSubmit: (data: CouponFormData) => void;
  onCancel: () => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    type: 'percentage',
    value: 0,
    start_date: new Date().toISOString().slice(0, 16),
    end_date: '',
    min_purchase_amount: 0,
    max_uses: 0,
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : '',
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField 
            fullWidth label="Código do Cupom" name="code" size="small" 
            value={formData.code} onChange={handleChange} required 
            placeholder="EX: NATAL10"
            inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField fullWidth select label="Tipo" name="type" size="small" value={formData.type} onChange={handleChange}>
            <MenuItem value="percentage">Porcentagem (%)</MenuItem>
            <MenuItem value="fixed_amount">Valor Fixo (R$)</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField 
            fullWidth label="Valor" name="value" type="number" size="small" 
            value={formData.value} onChange={handleChange} required
            InputProps={{ startAdornment: <InputAdornment position="start">{formData.type === 'percentage' ? '%' : 'R$'}</InputAdornment> }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField fullWidth label="Data Início" name="start_date" type="datetime-local" size="small" value={formData.start_date} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField fullWidth label="Data Fim" name="end_date" type="datetime-local" size="small" value={formData.end_date} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField fullWidth label="Compra Mínima" name="min_purchase_amount" type="number" size="small" value={formData.min_purchase_amount} onChange={handleChange} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField fullWidth label="Limite de Usos" name="max_uses" type="number" size="small" value={formData.max_uses} onChange={handleChange} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel control={<Switch name="is_active" checked={formData.is_active} onChange={handleChange} />} label={<Typography variant="body2" sx={{ fontWeight: 400 }}>Cupom Ativo</Typography>} />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button onClick={onCancel} variant="outlined" color="primary" label="Cancelar" />
        <Button type="submit" variant="contained" label={initialData ? 'Atualizar' : 'Salvar'} />
      </Stack>
    </Box>
  );
};
