import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Box, Button, Typography, Paper, IconButton } from '@mui/material';
import { Delete, Undo, Check } from '@mui/icons-material';
import styled from 'styled-components';

const CanvasWrapper = styled(Paper)`
  border: 2px dashed #ccc;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  margin-top: 10px;
`;

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  title?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, title = 'Assinatura do Cliente' }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleEnd = () => {
    setIsEmpty(sigCanvas.current?.isEmpty() || false);
  };

  const save = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, textAlign: 'center' }}>
        {title}
      </Typography>
      
      <CanvasWrapper elevation={0}>
        <SignatureCanvas
          ref={sigCanvas}
          onEnd={handleEnd}
          canvasProps={{
            width: 500,
            height: 200,
            className: 'signature-canvas'
          }}
          penColor="black"
        />
      </CanvasWrapper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Box>
            <IconButton onClick={clear} color="error" title="Limpar">
                <Delete />
            </IconButton>
        </Box>
        <Button 
            variant="contained" 
            color="primary" 
            onClick={save} 
            disabled={isEmpty}
            startIcon={<Check />}
            sx={{ borderRadius: '10px' }}
        >
            Confirmar Assinatura
        </Button>
      </Box>
    </Box>
  );
};

export default SignaturePad;
