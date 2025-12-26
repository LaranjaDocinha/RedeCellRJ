import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip, 
  Chip,
  Typography,
  useTheme,
  Stack
} from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface Discount {
  id: number;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
}

interface DiscountListProps {
  discounts: Discount[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DiscountList: React.FC<DiscountListProps> = ({ discounts, onEdit, onDelete }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 400 }}>NOME</TableCell>
            <TableCell sx={{ fontWeight: 400 }}>VALOR</TableCell>
            <TableCell sx={{ fontWeight: 400 }}>VALIDADE</TableCell>
            <TableCell align="center" sx={{ fontWeight: 400 }}>USOS</TableCell>
            <TableCell align="center" sx={{ fontWeight: 400 }}>STATUS</TableCell>
            <TableCell align="right" sx={{ fontWeight: 400 }}>AÇÕES</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {discounts.map((discount) => (
            <TableRow key={discount.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 400 }}>{discount.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {discount.type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="primary">
                    {discount.type === 'percentage' ? `${discount.value}%` : `R$ ${Number(discount.value).toFixed(2)}`}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ display: 'block' }}>De: {new Date(discount.start_date).toLocaleDateString()}</Typography>
                {discount.end_date && <Typography variant="caption">Até: {new Date(discount.end_date).toLocaleDateString()}</Typography>}
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">{discount.uses_count} / {discount.max_uses || '∞'}</Typography>
              </TableCell>
              <TableCell align="center">
                <Chip 
                    label={discount.is_active ? 'Ativo' : 'Inativo'} 
                    size="small" 
                    color={discount.is_active ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 400 }}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(discount.id)} sx={{ color: theme.palette.text.secondary }}>
                        <FaEdit size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => onDelete(discount.id)}>
                        <FaTrash size={14} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};