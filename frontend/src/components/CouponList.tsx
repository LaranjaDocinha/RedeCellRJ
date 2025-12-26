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

interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
}

interface CouponListProps {
  coupons: Coupon[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const CouponList: React.FC<CouponListProps> = ({ coupons, onEdit, onDelete }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 400 }}>CÓDIGO</TableCell>
            <TableCell sx={{ fontWeight: 400 }}>VALOR</TableCell>
            <TableCell sx={{ fontWeight: 400 }}>REGRAS</TableCell>
            <TableCell align="center" sx={{ fontWeight: 400 }}>USOS</TableCell>
            <TableCell align="center" sx={{ fontWeight: 400 }}>STATUS</TableCell>
            <TableCell align="right" sx={{ fontWeight: 400 }}>AÇÕES</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 400, color: theme.palette.primary.main, fontFamily: 'monospace' }}>
                    {coupon.code}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${Number(coupon.value).toFixed(2)}`}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ display: 'block' }}>
                    Min: R$ {Number(coupon.min_purchase_amount || 0).toFixed(2)}
                </Typography>
                <Typography variant="caption">Validade: {new Date(coupon.start_date).toLocaleDateString()}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">{coupon.uses_count} / {coupon.max_uses || '∞'}</Typography>
              </TableCell>
              <TableCell align="center">
                <Chip 
                    label={coupon.is_active ? 'Ativo' : 'Inativo'} 
                    size="small" 
                    color={coupon.is_active ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 400 }}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(coupon.id)} sx={{ color: theme.palette.text.secondary }}>
                        <FaEdit size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => onDelete(coupon.id)}>
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