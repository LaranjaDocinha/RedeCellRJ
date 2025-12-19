import React from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { useProductComparison } from '../hooks/useProductComparison';
import { ProductInfo } from '../components/ProductInfo'; // Assuming ProductInfo can display details
import { ImageGallery } from '../components/ImageGallery'; // Assuming ImageGallery can display images
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

const ProductComparisonPage: React.FC = () => {
  const { comparisonList, removeProductFromComparison, clearComparisonList } = useProductComparison();
  const navigate = useNavigate();

  if (comparisonList.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Nenhum produto selecionado para comparação.
        </Typography>
        <Button label="Voltar para Produtos" onClick={() => navigate('/products')} color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Comparação de Produtos
      </Typography>
      <Button label="Limpar Comparação" onClick={clearComparisonList} color="error" sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {comparisonList.map((product) => (
          <Grid item xs={12} sm={6} md={12 / comparisonList.length} key={product.id}>
            <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <ImageGallery images={product.variations.map(v => v.image_url || '/placeholder.png')} />
              </Box>
              <Typography variant="h6" gutterBottom noWrap>
                {product.name}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <ProductInfo product={product} /> {/* Reusing ProductInfo component */}
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Button
                  label="Remover"
                  onClick={() => removeProductFromComparison(product.id)}
                  color="error"
                  fullWidth
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductComparisonPage;
