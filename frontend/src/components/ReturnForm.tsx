import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Stack,
  Divider,
  Paper,
  InputAdornment,
  Checkbox,
  Chip,
  Avatar,
  CircularProgress,
  IconButton,
  useTheme,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ArrowBack as BackIcon, 
  Save as SaveIcon, 
  ShoppingBag as ProductIcon
} from '@mui/icons-material';

// Tipos
interface ReturnItemFormData {
  product_id: number;
  variation_id: number;
  quantity: number;
  name?: string;
  sku?: string;
  price?: number;
  max_quantity?: number;
  selected?: boolean;
}

interface ReturnFormData {
  sale_id: number;
  reason?: string;
  items: ReturnItemFormData[];
}

interface ReturnFormProps {
  initialData?: ReturnFormData & { id?: number };
  onSubmit: (data: ReturnFormData) => void;
  onCancel: () => void;
}

// Mock de dados para simular a busca de uma venda
const mockFetchSaleItems = async (saleId: number) => {
  return new Promise<any[]>((resolve, reject) => {
    setTimeout(() => {
      if (saleId === 1024) {
        resolve([
          { product_id: 101, variation_id: 501, quantity: 1, name: 'iPhone 15 Pro - Titanium', sku: 'IP15P-TIT', price: 7500.00, image: null },
          { product_id: 102, variation_id: 502, quantity: 2, name: 'Capa MagSafe Transparente', sku: 'ACC-MAG-CLR', price: 149.90, image: null }
        ]);
      } else if (saleId === 1012) {
        resolve([
          { product_id: 201, variation_id: 601, quantity: 1, name: 'Samsung S23 Ultra', sku: 'S23U-BLK', price: 6200.00, image: null }
        ]);
      } else {
        reject(new Error('Venda não encontrada'));
      }
    }, 600);
  });
};

const COMMON_REASONS = [
  'Defeito de Fábrica',
  'Arrependimento (7 dias)',
  'Produto Errado',
  'Avaria no Transporte',
  'Incompatibilidade'
];

export const ReturnForm: React.FC<ReturnFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [saleId, setSaleId] = useState<string>(initialData?.sale_id?.toString() || '');
  const [saleItems, setSaleItems] = useState<ReturnItemFormData[]>([]);
  const [reason, setReason] = useState(initialData?.reason || '');

  const handleSearchSale = async () => {
    if (!saleId) {
      setError('Digite o número da venda');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const items = await mockFetchSaleItems(parseInt(saleId));
      const mappedItems = items.map(item => ({
        ...item,
        max_quantity: item.quantity,
        selected: false,
        quantity: 1
      }));
      setSaleItems(mappedItems);
      setStep(2);
    } catch (err) {
      setError('Venda não encontrada. Tente o ID 1024 ou 1012 para teste.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (index: number) => {
    const newItems = [...saleItems];
    newItems[index].selected = !newItems[index].selected;
    setSaleItems(newItems);
  };

  const updateQuantity = (index: number, val: number) => {
    const newItems = [...saleItems];
    const max = newItems[index].max_quantity || 1;
    newItems[index].quantity = Math.max(1, Math.min(val, max));
    setSaleItems(newItems);
  };

  const handleSubmit = () => {
    const selectedItems = saleItems.filter(i => i.selected);
    if (selectedItems.length === 0) {
      setError('Selecione pelo menos um item para devolver.');
      return;
    }
    if (!reason) {
      setError('Selecione ou digite um motivo.');
      return;
    }

    const payload: ReturnFormData = {
      sale_id: parseInt(saleId),
      reason,
      items: selectedItems.map(({ product_id, variation_id, quantity }) => ({
        product_id,
        variation_id,
        quantity
      }))
    };
    onSubmit(payload);
  };

  if (step === 1) {
    return (
      <Box p={2}>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Informe o código da venda para carregar os produtos disponíveis para devolução.
        </Typography>

        <TextField
          autoFocus
          fullWidth
          label="ID da Venda / Cupom Fiscal"
          value={saleId}
          onChange={(e) => setSaleId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSale()}
          placeholder="Ex: 1024"
          InputProps={{
            sx: { borderRadius: '12px' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearchSale} disabled={loading} color="primary">
                  {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button onClick={onCancel} sx={{ mr: 1, borderRadius: '8px' }} color="inherit">
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSearchSale} 
            disabled={loading || !saleId}
            sx={{ borderRadius: '8px', px: 4 }}
          >
            Buscar Venda
          </Button>
        </Box>
      </Box>
    );
  }

  const selectedCount = saleItems.filter(i => i.selected).length;
  const totalRefundEst = saleItems.filter(i => i.selected).reduce((acc, curr) => acc + ((curr.price || 0) * curr.quantity), 0);

  return (
    <Box p={1}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <IconButton onClick={() => setStep(1)} size="small" sx={{ bgcolor: 'action.hover' }}>
          <BackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="body2" color="text.secondary">Venda #{saleId}</Typography>
          <Typography variant="h6" color="primary">Selecione os itens</Typography>
        </Box>
      </Stack>

      <Stack spacing={2} mb={4} sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
        {saleItems.map((item, index) => (
          <Paper 
            key={`${item.product_id}-${item.variation_id}`}
            variant="outlined"
            sx={{ 
              p: 2, 
              borderRadius: '16px', 
              borderColor: item.selected ? 'primary.main' : 'divider',
              bgcolor: item.selected ? (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'primary.50') : 'background.paper',
              transition: 'all 0.2s',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: item.selected ? (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'primary.100') : 'action.hover'
              }
            }}
            onClick={() => toggleItemSelection(index)}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Checkbox 
                  checked={item.selected} 
                  color="primary"
                  sx={{ p: 0 }}
                />
              </Grid>
              <Grid item>
                <Avatar variant="rounded" sx={{ bgcolor: 'action.selected', color: 'text.secondary' }}>
                  <ProductIcon />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="body1">{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  SKU: {item.sku} • Valor Unit: R$ {item.price?.toFixed(2)}
                </Typography>
              </Grid>
              
              {item.selected && (
                <Grid item onClick={(e) => e.stopPropagation()}>
                  <TextField
                    type="number"
                    label="Qtd"
                    size="small"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                    InputProps={{ 
                      inputProps: { min: 1, max: item.max_quantity },
                      sx: { borderRadius: '8px' }
                    }}
                    sx={{ width: 80 }}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        ))}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="body2" color="text.secondary" mb={1}>
        Motivo da Devolução
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {COMMON_REASONS.map((r) => (
          <Chip
            key={r}
            label={r}
            onClick={() => setReason(r)}
            color={reason === r ? 'primary' : 'default'}
            variant={reason === r ? 'filled' : 'outlined'}
            sx={{ borderRadius: '8px' }}
          />
        ))}
      </Box>
      <TextField
        fullWidth
        placeholder="Outro motivo ou detalhes adicionais..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        size="small"
        multiline
        rows={2}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, mb: 1 }}
      />
      {error && <Typography color="error" variant="caption">{error}</Typography>}

      <Box 
        mt={3} 
        p={2} 
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
          borderRadius: '16px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">Estorno Estimado</Typography>
          <Typography variant="h6" color="primary">R$ {totalRefundEst.toFixed(2)}</Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={selectedCount === 0 || !reason}
          sx={{ borderRadius: '12px', px: 4 }}
        >
          Confirmar Devolução
        </Button>
      </Box>
    </Box>
  );
};
