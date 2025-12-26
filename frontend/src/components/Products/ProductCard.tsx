import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: any; // Substituir 'any' pela interface Product real
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product.variations && product.variations.length > 0
    ? product.variations[0].image_url || 'https://placehold.co/150' // Usar a primeira variação ou placeholder
    : 'https://placehold.co/150';

  const price = product.variations && product.variations.length > 0
    ? `R$ ${product.variations[0].price.toFixed(2)}`
    : 'N/A';

  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3, borderRadius: 2 }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardMedia
          component="img"
          height="140"
          image={imageUrl}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.description || 'No description available.'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Chip label={price} color="primary" sx={{ fontWeight: 'bold' }} />
            <Button variant="contained" size="small" startIcon={<AddShoppingCart />}>
              Adicionar
            </Button>
          </Box>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;
