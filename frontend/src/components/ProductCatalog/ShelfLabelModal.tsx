import React, { useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid } from '@mui/material';
import QRCode from 'qrcode'; // Importar a biblioteca qrcode. Necessário instalar: npm install qrcode @types/qrcode
// Se @types/qrcode não estiver disponível, criar um d.ts. Mas geralmente está.
// Se qrcode não for uma opção leve, usar react-qr-code.
// Vamos usar 'qrcode' pois é padrão e versátil para gerar dataURL.

import { useReactToPrint } from 'react-to-print'; // npm install react-to-print

interface ShelfLabelModalProps {
  open: boolean;
  onClose: () => void;
  products: any[]; // Products to print
}

const ShelfLabelModal: React.FC<ShelfLabelModalProps> = ({ open, onClose, products }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});

  React.useEffect(() => {
    if (open && products.length > 0) {
      const generateQRs = async () => {
        const codes: { [key: number]: string } = {};
        for (const p of products) {
          // URL pública do produto (ex: e-commerce ou página de detalhes)
          // Como não temos e-commerce público configurado, vamos apontar para uma URL genérica ou local
          const url = `https://loja.redecellrj.com.br/products/${p.id}`; 
          try {
            codes[p.id] = await QRCode.toDataURL(url, { width: 100, margin: 1 });
          } catch (err) {
            console.error(err);
          }
        }
        setQrCodes(codes);
      };
      generateQRs();
    }
  }, [open, products]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Etiquetas de Gondola',
    onAfterPrint: onClose
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Etiquetas de Gôndola (QR Code)</DialogTitle>
      <DialogContent>
        <Box ref={componentRef} sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Layout de impressão: Grid de etiquetas */}
          <style type="text/css" media="print">
            {`
              @page { size: auto; margin: 10mm; }
              .label-container { page-break-inside: avoid; }
            `}
          </style>
          
          {products.map(p => {
             const price = p.variations?.[0]?.price || p.price || 0;
             return (
              <Box 
                key={p.id} 
                className="label-container"
                sx={{ 
                  width: '200px', 
                  height: '120px', 
                  border: '1px solid #000', 
                  p: 1, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 1
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '0.8rem', lineHeight: 1.1, mb: 1 }}>
                    {p.name.substring(0, 40)}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 400 }}>
                    R$ {Number(price).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {p.sku}
                  </Typography>
                </Box>
                <Box sx={{ width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {qrCodes[p.id] && <img src={qrCodes[p.id]} alt="QR" style={{ width: '100%' }} />}
                </Box>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handlePrint} variant="contained" color="primary">
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShelfLabelModal;

