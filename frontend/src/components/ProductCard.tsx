import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Box, Chip, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { useCartAnimation } from '../contexts/CartAnimationContext';
import { useCart } from '../contexts/CartContext';
import { useRef, useCallback } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Import CompareArrowsIcon
import { useWishlist } from '../hooks/useWishlist';
import { useProductComparison } from '../hooks/useProductComparison'; // Import useProductComparison

export interface ProductCardProps {
  id: number;
  imageUrl: string;
  name: string;
  price: number;
  rating: number;
  description?: string;
  promotion?: boolean;
  onAddToCart: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onQuickView?: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  id,
  imageUrl,
  name,
  price,
  rating,
  description,
  promotion,
  onAddToCart,
  onEdit,
  onDelete,
  onQuickView,
}) => {
  const { startAnimation } = useCartAnimation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addProductToComparison, removeProductFromComparison, isInComparisonList } = useProductComparison(); // Use product comparison hook
  const imageRef = useRef<HTMLImageElement>(null);

  const handleAddToCart = useCallback(() => {
    if (imageRef.current) {
      const startRect = imageRef.current.getBoundingClientRect();
      startAnimation(imageUrl, startRect);
    }
    addToCart({ id: id.toString(), name, price, imageUrl });
    onAddToCart();
  }, [id, imageUrl, name, price, addToCart, onAddToCart, startAnimation]);

  const handleToggleWishlist = useCallback(() => {
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist({ id, name, imageUrl });
    }
  }, [id, name, imageUrl, isInWishlist, addToWishlist, removeFromWishlist]);

  const handleToggleComparison = useCallback(() => {
    const productForComparison = { id, name, price, imageUrl, description, promotion, variations: [{ price, image_url: imageUrl }] }; // Minimal product data for comparison
    if (isInComparisonList(id)) {
      removeProductFromComparison(id);
    } else {
      addProductToComparison(productForComparison);
    }
  }, [id, name, price, imageUrl, description, promotion, isInComparisonList, addProductToComparison, removeProductFromComparison]);

  const isFavorite = isInWishlist(id);
  const isCompared = isInComparisonList(id);

  return (
    <motion.div whileHover={{ y: -8, boxShadow: "0px 12px 20px rgba(0,0,0,0.15)" }}>
      <Card sx={{ maxWidth: 345, borderRadius: 4, height: '100%', position: 'relative' }}>
        {promotion && (
          <Chip
            label="Promoção!"
            color="secondary"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
          />
        )}
        <IconButton
          aria-label="adicionar à lista de desejos"
          onClick={handleToggleWishlist}
          sx={{
            position: 'absolute',
            top: 8,
            right: 40, // Adjust position to make space for compare button
            zIndex: 1,
            color: isFavorite ? 'red' : 'inherit',
          }}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <IconButton
          aria-label="adicionar para comparação"
          onClick={handleToggleComparison}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            color: isCompared ? 'primary.main' : 'inherit', // Highlight if in comparison
          }}
        >
          <CompareArrowsIcon />
        </IconButton>
        <CardMedia
          ref={imageRef}
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
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: 40, overflow: 'hidden' }}>
              {description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ⭐ {rating.toFixed(1)}
            </Typography>
          </Box>
          <Typography variant="h5" component="p" fontWeight="bold">
            R$ {price.toFixed(2)}
          </Typography>
        </CardContent>
        <CardActions sx={{ padding: '0 16px 16px', justifyContent: 'space-between' }}>
          <Button label="Adicionar ao Carrinho" onClick={handleAddToCart} color="primary" size="small" />
          <Box sx={{ display: 'flex', gap: '8px' }}>
            {onQuickView && <Button label="Visualizar" onClick={() => onQuickView(id)} size="small" />}
            {onEdit && <Button label="Editar" onClick={() => onEdit(id)} size="small" />}
            {onDelete && <Button label="Excluir" onClick={() => onDelete(id)} size="small" color="error" />}
          </Box>
        </CardActions>
      </Card>
    </motion.div>
  );
});