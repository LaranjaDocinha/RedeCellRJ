import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { FaSave, FaTimes, FaCalculator, FaPercent } from 'react-icons/fa';
import { Product } from '../../types/product';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface ProductBulkEditModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onSuccess: () => void;
}

export const ProductBulkEditModal: React.FC<ProductBulkEditModalProps> = ({ open, onClose, products, onSuccess }) => {
  const theme = useTheme();
  const { addNotification } = useNotification();
  const { token } = useAuth();
  const [editedProducts, setEditedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Flatten products to variations for easier editing
      const flattened = products.flatMap(p => 
        (p.variations || []).map(v => ({
          productId: p.id,
          variationId: v.id,
          name: p.name + (v.name ? ` - ${v.name}` : ''),
          sku: v.sku,
          cost_price: Number(v.cost_price || 0),
          price: Number(v.price || 0),
          stock_quantity: Number(v.stock_quantity || 0),
          changed: false
        }))
      );
      setEditedProducts(flattened);
    }
  }, [open, products]);

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...editedProducts];
    updated[index] = { ...updated[index], [field]: value, changed: true };
    setEditedProducts(updated);
  };

  const calculateMargin = (cost: number, price: number) => {
    if (!price || price <= 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const handleSave = async () => {
    const toUpdate = editedProducts.filter(p => p.changed);
    if (toUpdate.length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      // Para simplificar no protótipo, fazemos um por um ou criamos um endpoint de bulk no futuro
      // Aqui usaremos o endpoint de atualização de variação se disponível, ou o de produto
      for (const item of toUpdate) {
        await axios.put(`/api/products/${item.productId}`, {
          variations: [{
            id: item.variationId,
            cost_price: item.cost_price,
            price: item.price,
            stock_quantity: item.stock_quantity,
            sku: item.sku
          }]
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      addNotification(`${toUpdate.length} itens atualizados com sucesso!`, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      addNotification('Erro ao atualizar alguns itens.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
            <FaCalculator color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={400}>Edição Expressa de Inventário</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><FaTimes /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 400 }}>PRODUTO / VARIAÇÃO</TableCell>
                <TableCell sx={{ fontWeight: 400 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 400 }} width={120}>CUSTO (R$)</TableCell>
                <TableCell sx={{ fontWeight: 400 }} width={120}>VENDA (R$)</TableCell>
                <TableCell sx={{ fontWeight: 400 }} width={100}>MARGEM</TableCell>
                <TableCell sx={{ fontWeight: 400 }} width={100}>ESTOQUE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {editedProducts.map((item, index) => {
                const margin = calculateMargin(item.cost_price, item.price);
                return (
                  <TableRow key={`${item.productId}-${item.variationId}`} hover sx={{ bgcolor: item.changed ? alpha(theme.palette.primary.main, 0.02) : 'inherit' }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 400 }}>{item.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{item.sku}</Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number" size="small" variant="standard"
                        value={item.cost_price}
                        onChange={(e) => handleChange(index, 'cost_price', Number(e.target.value))}
                        inputProps={{ style: { fontSize: '0.85rem', color: theme.palette.error.main } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number" size="small" variant="standard"
                        value={item.price}
                        onChange={(e) => handleChange(index, 'price', Number(e.target.value))}
                        inputProps={{ style: { fontSize: '0.85rem', color: theme.palette.success.main } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${margin.toFixed(1)}%`} 
                        size="small" 
                        variant="outlined"
                        color={margin < 30 ? 'error' : margin < 50 ? 'warning' : 'success'}
                        sx={{ fontSize: '0.65rem', fontWeight: 400, height: 20 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number" size="small" variant="standard"
                        value={item.stock_quantity}
                        onChange={(e) => handleChange(index, 'stock_quantity', Number(e.target.value))}
                        inputProps={{ style: { fontSize: '0.85rem', textAlign: 'center' } }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 400 }}>Cancelar</Button>
        <Button 
            variant="contained" 
            startIcon={loading ? <FaSave className="fa-spin" /> : <FaSave />} 
            onClick={handleSave}
            disabled={loading}
            sx={{ borderRadius: '8px', px: 4, fontWeight: 400 }}
        >
          Salvar Alterações
        </Button>
      </DialogActions>
    </Dialog>
  );
};
