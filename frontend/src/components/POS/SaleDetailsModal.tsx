import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

interface SaleItem {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface SalePayment {
  method: string;
  amount: string;
  details: any; // Adjust type as per actual transaction_details structure
}

interface SaleDetails {
  id: string;
  total_amount: string;
  sale_date: string;
  user_name: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  items: SaleItem[];
  payments: SalePayment[];
}

interface SaleDetailsModalProps {
  open: boolean;
  onClose: () => void;
  saleId: string | null;
}

const fetchSaleDetails = async (saleId: string): Promise<SaleDetails> => {
  const response = await axios.get(`/api/sales/history/${saleId}`);
  return response.data;
};

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ open, onClose, saleId }) => {
  const { data, isLoading, error } = useQuery<SaleDetails, Error>(
    ['saleDetails', saleId],
    () => fetchSaleDetails(saleId as string),
    {
      enabled: open && !!saleId, // Only fetch when modal is open and saleId is available
    }
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes da Venda {saleId}</DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            Erro ao carregar detalhes da venda: {error.message}
          </Typography>
        )}
        {data && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Informações Gerais
            </Typography>
            <Typography>
              <strong>ID da Venda:</strong> {data.id}
            </Typography>
            <Typography>
              <strong>Data da Venda:</strong> {format(new Date(data.sale_date), 'dd/MM/yyyy HH:mm:ss')}
            </Typography>
            <Typography>
              <strong>Vendedor:</strong> {data.user_name}
            </Typography>
            <Typography>
              <strong>Total da Venda:</strong> R$ {parseFloat(data.total_amount).toFixed(2)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Cliente
            </Typography>
            {data.customer_name ? (
              <>
                <Typography>
                  <strong>Nome:</strong> {data.customer_name}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {data.customer_email || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Telefone:</strong> {data.customer_phone || 'N/A'}
                </Typography>
              </>
            ) : (
              <Typography>Cliente não associado a esta venda.</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Itens da Venda
            </Typography>
            <List dense>
              {data.items && data.items.length > 0 ? (
                data.items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${item.product_name} (SKU: ${item.sku})`}
                      secondary={`Quantidade: ${item.quantity} x R$ ${parseFloat(item.unit_price).toFixed(2)} = R$ ${parseFloat(item.total_price).toFixed(2)}`}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography>Nenhum item encontrado para esta venda.</Typography>
              )}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Pagamentos
            </Typography>
            <List dense>
              {data.payments && data.payments.length > 0 ? (
                data.payments.map((payment, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Método: ${payment.method}`}
                      secondary={`Valor: R$ ${parseFloat(payment.amount).toFixed(2)}`}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography>Nenhum pagamento registrado para esta venda.</Typography>
              )}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaleDetailsModal;
