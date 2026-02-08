import React from 'react';
import { Box, Typography, Divider, Stack } from '@mui/material';
import styled from 'styled-components';

const PrintContainer = styled(Box)`
  width: 80mm;
  padding: 5mm;
  background: white;
  color: black;
  font-family: 'Courier New', Courier, monospace;
  
  @media print {
    width: 80mm;
    margin: 0;
    padding: 2mm;
  }
`;

interface ReceiptProps {
  orderId: string | number;
  customerName: string;
  items: any[];
  total: number;
  paymentMethod: string;
}

export const ThermalReceipt: React.FC<ReceiptProps> = ({ orderId, customerName, items, total, paymentMethod }) => {
  return (
    <PrintContainer>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 400 }}>REDECELL RJ</Typography>
        <Typography variant="caption">Acessórios e Reparos Especializados</Typography>
        <Typography variant="caption" display="block">CNPJ: 00.000.000/0001-00</Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
      
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="caption">PEDIDO: #{orderId}</Typography>
        <Typography variant="caption">{new Date().toLocaleDateString()}</Typography>
      </Stack>
      <Typography variant="caption" display="block">CLIENTE: {customerName}</Typography>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      <Box sx={{ my: 2 }}>
        {items.map((item, idx) => (
          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ flexGrow: 1 }}>{item.quantity}x {item.name}</Typography>
            <Typography variant="caption">R$ {Number(item.subtotal).toFixed(2)}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>TOTAL</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>R$ {total.toFixed(2)}</Typography>
      </Stack>
      <Typography variant="caption" display="block">PAGAMENTO: {paymentMethod.toUpperCase()}</Typography>

      <Box sx={{ textAlign: 'center', mt: 4, pt: 2, borderTop: '1px dashed #ccc' }}>
        <Typography variant="caption">Obrigado pela preferência!</Typography>
        <Typography variant="caption" display="block">www.redecellrj.com.br</Typography>
      </Box>
    </PrintContainer>
  );
};

