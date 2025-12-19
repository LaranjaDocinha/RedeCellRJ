import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import { connectToPrinter } from '../../utils/printer';

interface ServiceOrder {
  id: number;
  customer_id: string;
  product_description: string;
  imei: string;
  issue_description: string;
  created_at: string;
}

interface ServiceOrderLabelModalProps {
  open: boolean;
  onClose: () => void;
  serviceOrder: ServiceOrder;
}

const ServiceOrderLabelModal: React.FC<ServiceOrderLabelModalProps> = ({ open, onClose, serviceOrder }) => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const device = await connectToPrinter();
      const encoder = new TextEncoder();
      
      // Simple ZPL for OS Label (50x30mm approx)
      // Includes OS ID, Customer Info, Problem, and Barcode
      const zpl = `
^XA
^PW400
^LL240
^FO20,20^A0N,25,25^FDOS: ${serviceOrder.id}^FS
^FO200,20^A0N,25,25^FD${new Date().toLocaleDateString()}^FS
^FO20,60^A0N,30,30^FD${serviceOrder.product_description.substring(0, 20)}^FS
^FO20,100^A0N,25,25^FD${serviceOrder.issue_description.substring(0, 25)}^FS
^FO20,140^BCN,50,Y,N,N^FD${serviceOrder.id}^FS
^XZ
      `;

      const data = encoder.encode(zpl);
      await device.transferOut(1, data);
      addNotification('Etiqueta de OS impressa com sucesso!', 'success');
      onClose();

    } catch (error: any) {
      console.error('Print Error:', error);
      addNotification('Erro ao imprimir etiqueta. Verifique a conexão USB.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Imprimir Etiqueta de OS</DialogTitle>
      <DialogContent>
        <Typography>Confirma a impressão da etiqueta para a OS #{serviceOrder.id}?</Typography>
        <Box sx={{ mt: 2, p: 1, border: '1px dashed grey' }}>
          <Typography variant="caption">Preview (ZPL):</Typography>
          <Typography variant="body2">OS: {serviceOrder.id}</Typography>
          <Typography variant="body2">Produto: {serviceOrder.product_description}</Typography>
          <Typography variant="body2">Defeito: {serviceOrder.issue_description}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handlePrint} variant="contained" disabled={loading}>
          {loading ? 'Imprimindo...' : 'Imprimir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceOrderLabelModal;
