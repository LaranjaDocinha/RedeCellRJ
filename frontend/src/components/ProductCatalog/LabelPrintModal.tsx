import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, TextField } from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';
import { connectToPrinter } from '../../utils/printer'; // Reuse WebUSB logic if needed, but ZPL usually goes to backend

interface Product {
  id: number;
  name: string;
  sku: string;
  variations: any[];
}

interface LabelPrintModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[]; // Products to print labels for
}

const LabelPrintModal: React.FC<LabelPrintModalProps> = ({ open, onClose, products }) => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      // Prepare data for backend ZPL generation
      const itemsToPrint = products.map(p => {
        const variation = p.variations[0]; // Default to first variation for now
        return {
          name: p.name,
          price: variation ? variation.price : 0,
          sku: p.sku,
          barcode: p.sku // Assuming SKU as barcode for now
        };
      });

      const response = await axios.post('/api/labels/generate-zpl', {
        type: 'product',
        items: itemsToPrint
      }, { responseType: 'text' });

      const zpl = response.data;

      // Send ZPL to printer via WebUSB (Raw)
      // Note: Most browser printing via window.print() renders HTML/PDF. 
      // ZPL requires sending raw bytes to a label printer.
      // We will reuse connectToPrinter from utils but we need a function to send RAW string.
      
      try {
        const device = await connectToPrinter();
        const encoder = new TextEncoder();
        const data = encoder.encode(zpl);
        await device.transferOut(1, data);
        addNotification('Etiquetas enviadas para impressora!', 'success');
        onClose();
      } catch (usbError) {
        console.error('WebUSB Error:', usbError);
        // Fallback: Download ZPL file
        const blob = new Blob([zpl], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'labels.zpl';
        a.click();
        addNotification('Impressora não detectada. Arquivo ZPL baixado.', 'info');
      }

    } catch (error: any) {
      addNotification('Erro ao gerar etiquetas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Imprimir Etiquetas</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Serão impressas {products.length} etiquetas.
        </Typography>
        <Box sx={{ mt: 2 }}>
          {products.map(p => (
            <Typography key={p.id} variant="body2">- {p.name} ({p.sku})</Typography>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handlePrint} variant="contained" disabled={loading}>
          {loading ? 'Processando...' : 'Imprimir (ZPL)'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabelPrintModal;
