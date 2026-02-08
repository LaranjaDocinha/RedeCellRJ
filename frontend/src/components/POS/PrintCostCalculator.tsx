import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, FormControlLabel, Switch, 
  Select, MenuItem, InputLabel, FormControl, 
  Typography, Box, Divider, CircularProgress 
} from '@mui/material';
import api from '../../services/api';
import { Print } from '@mui/icons-material';

interface PrintCostCalculatorProps {
  open: boolean;
  onClose: () => void;
  onAdd: (result: { description: string, price: number }) => void;
}

const PrintCostCalculator: React.FC<PrintCostCalculatorProps> = ({ open, onClose, onAdd }) => {
  const [pages, setPages] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [quality, setQuality] = useState<'eco' | 'high'>('eco');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (open) {
        calculate();
    }
  }, [pages, isColor, quality, open]);

  const calculate = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/print/calculate`, {
        params: { pages, isColor, quality }
      });
      setResults(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (results) {
        const desc = `${pages} fls ${isColor ? 'Color' : 'P&B'} (${quality === 'high' ? 'Foto' : 'Eco'})`;
        onAdd({
            description: desc,
            price: Number(results.suggestedPrice)
        });
        onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Print /> Calculadora de Impressão
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Número de Páginas"
            type="number"
            fullWidth
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            InputProps={{ inputProps: { min: 1 } }}
          />

          <FormControlLabel
            control={<Switch checked={isColor} onChange={(e) => setIsColor(e.target.checked)} />}
            label="Impressão Colorida?"
          />

          <FormControl fullWidth>
            <InputLabel>Qualidade</InputLabel>
            <Select
              value={quality}
              label="Qualidade"
              onChange={(e) => setQuality(e.target.value as any)}
            >
              <MenuItem value="eco">Econômica (Texto/Documento)</MenuItem>
              <MenuItem value="high">Alta (Foto/Gráfico Pesado)</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          {loading ? (
            <Box sx={{ textAlign: 'center', p: 2 }}><CircularProgress size={24} /></Box>
          ) : results && (
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">PREÇO SUGERIDO (MARGEM 200%)</Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                R$ {results.suggestedPrice}
              </Typography>
              <Typography variant="caption" color="text.secondary">Custo Insumos: R$ {results.totalCost}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!results}>Adicionar ao Carrinho</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintCostCalculator;
