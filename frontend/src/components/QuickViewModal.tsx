import React from 'react';
import { Modal, Box, Typography, IconButton, CircularProgress, Grid, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useProduct } from '../hooks/useProduct';
import { ImageGallery } from './ImageGallery';
import { ProductInfo } from './ProductInfo';
import { Button } from './Button'; // Assuming this is the MUI Button

interface QuickViewModalProps {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 900,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ productId, open, onClose }) => {
  const { product, isLoading, isError } = useProduct(productId || '');

  if (isError) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2">
            Erro ao carregar produto
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Não foi possível carregar os detalhes do produto. Por favor, tente novamente.
          </Typography>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="quick-view-modal-title"
      aria-describedby="quick-view-modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          product && (
            <>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <ImageGallery images={product.variations.map(v => v.image_url || '/placeholder.png')} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ProductInfo product={product} />
                  {/* Add to cart button or other quick actions */}
                  <Box sx={{ mt: 2 }}>
                    <Button label="Adicionar ao Carrinho" onClick={() => { /* Add to cart logic */ }} color="primary" fullWidth />
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Descrição Detalhada
              </Typography>
              <Typography variant="body1">
                {product.description || 'Nenhuma descrição disponível.'}
              </Typography>
              {/* Potentially add more sections like reviews summary, related products (limited) */}
            </>
          )
        )}
      </Box>
    </Modal>
  );
};
