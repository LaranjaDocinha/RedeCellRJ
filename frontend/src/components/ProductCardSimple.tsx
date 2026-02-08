import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Box } from '@mui/material';

export interface ProductCardProps {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  rating: number;
  onAddToCart: () => void;
  onEdit?: (id: string) => void; // New prop for editing
  onDelete?: (id: string) => void; // New prop for deleting
}

export const ProductCardSimple: React.FC<ProductCardProps> = ({ id, imageUrl, name, price, rating, onAddToCart, onEdit, onDelete }) => {
  return (
    <Card sx={{ maxWidth: 345, borderRadius: 4, height: '100%' }}>
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={name}
        loading="lazy"
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ⭐ {rating.toFixed(1)}
          </Typography>
        </Box>
        <Typography variant="h5" component="p" fontWeight={400}>
          R$ {price.toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions sx={{ padding: '0 16px 16px', justifyContent: 'space-between' }}>
        <button onClick={onAddToCart}>Adicionar ao Carrinho</button>
        <Box sx={{ display: 'flex', gap: '8px' }}>
          {onEdit && <button onClick={() => onEdit(id)}>Editar</button>}
          {onDelete && <button onClick={() => onDelete(id)}>Excluir</button>}
        </Box>
      </CardActions>
    </Card>
  );
};

