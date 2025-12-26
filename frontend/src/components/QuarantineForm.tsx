import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  InputAdornment,
  Alert
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Close as CancelIcon, 
  Search as SearchIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface QuarantineFormData {
  product_name: string; // Simplificado para demo, idealmente seria product_id
  variation: string;
  reason: string;
  quantity: number;
  item_cost: number;
  is_battery_risk: boolean;
  physical_location: string;
}

interface QuarantineFormProps {
  onSubmit: (data: QuarantineFormData) => void;
  onCancel: () => void;
}

// Mock de produtos para o autocomplete
const MOCK_PRODUCTS = [
  { label: 'Tela iPhone 14 Pro Max', variation: 'OLED Original' },
  { label: 'Bateria iPhone 11', variation: 'Premium' },
  { label: 'Câmera Traseira S23 Ultra', variation: 'Original Retirada' },
  { label: 'Conector de Carga Motorola G52', variation: 'Original' }
];

export const QuarantineForm: React.FC<QuarantineFormProps> = ({ onSubmit, onCancel }) => {
  const [product, setProduct] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cost, setCost] = useState('');
  const [location, setLocation] = useState('');
  const [isBatteryRisk, setIsBatteryRisk] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!product) {
      setError('Selecione um produto.');
      return;
    }
    if (!reason) {
      setError('Informe o motivo do defeito.');
      return;
    }
    if (!cost || isNaN(parseFloat(cost))) {
      setError('Informe um custo válido.');
      return;
    }

    onSubmit({
      product_name: product.label,
      variation: product.variation,
      reason,
      quantity,
      item_cost: parseFloat(cost),
      is_battery_risk: isBatteryRisk,
      physical_location: location || 'Não definida'
    });
  };

  return (
    <Box p={1}>
      <Stack spacing={3}>
        <Alert severity="info" sx={{ borderRadius: '12px', mb: 1 }}>
          Itens adicionados à quarentena saem do estoque disponível e ficam bloqueados até resolução (RMA ou Descarte).
        </Alert>

        <Autocomplete
          options={MOCK_PRODUCTS}
          getOptionLabel={(option) => `${option.label} - ${option.variation}`}
          value={product}
          onChange={(_, newValue) => setProduct(newValue)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Produto Defeituoso" 
              placeholder="Busque por nome..."
              InputProps={{
                ...params.InputProps,
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                sx: { borderRadius: '12px' }
              }}
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="Quantidade"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            InputProps={{ inputProps: { min: 1 }, sx: { borderRadius: '12px' } }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Custo Unitário (R$)"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            InputProps={{ sx: { borderRadius: '12px' } }}
            sx={{ flex: 1 }}
          />
        </Stack>

        <TextField
          label="Diagnóstico / Motivo"
          placeholder="Ex: Tela com listras, Bateria inchada..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          rows={2}
          InputProps={{ sx: { borderRadius: '12px' } }}
        />

        <TextField
          label="Localização Física (Opcional)"
          placeholder="Ex: Gaveta A1, Caixa RMA 02"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          InputProps={{ sx: { borderRadius: '12px' } }}
        />

        <FormControlLabel
          control={
            <Checkbox 
              checked={isBatteryRisk} 
              onChange={(e) => setIsBatteryRisk(e.target.checked)} 
              color="error"
            />
          }
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography color={isBatteryRisk ? 'error' : 'text.primary'}>Risco de Segurança (Bateria/Inflamável)</Typography>
              {isBatteryRisk && <WarningIcon color="error" fontSize="small" />}
            </Box>
          }
          sx={{ border: '1px solid', borderColor: isBatteryRisk ? 'error.main' : 'divider', borderRadius: '12px', p: 1, m: 0 }}
        />

        {error && <Typography color="error" variant="caption">{error}</Typography>}

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button 
            onClick={onCancel} 
            color="inherit" 
            startIcon={<CancelIcon />}
            sx={{ borderRadius: '10px' }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            startIcon={<SaveIcon />}
            sx={{ borderRadius: '12px', px: 4 }}
          >
            Confirmar Entrada
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
