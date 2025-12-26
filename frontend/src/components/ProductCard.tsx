import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Box, Chip, IconButton, Tooltip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { useCartAnimation } from '../contexts/CartAnimationContext';
import { useCart } from '../contexts/CartContext';
import { useRef, useCallback } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; 
import { useWishlist } from '../hooks/useWishlist';
import { useProductComparison } from '../hooks/useProductComparison';
import { FaShoppingCart, FaEye, FaEdit, FaTrash, FaImage } from 'react-icons/fa';

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
  const theme = useTheme();
  const { startAnimation } = useCartAnimation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const imageRef = useRef<HTMLImageElement>(null);

  const isDarkMode = theme.palette.mode === 'dark';

  const renderImage = () => {
    if (!imageUrl || imageUrl.includes('placehold.co')) {
      return (
        <Box 
          sx={{ 
            height: 160, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f2f5',
            color: theme.palette.text.disabled,
            gap: 1
          }}
        >
          <FaImage size={32} />
          <Typography variant="caption" sx={{ fontWeight: 400 }}>Sem imagem</Typography>
        </Box>
      );
    }
    return (
      <CardMedia
        ref={imageRef}
        component="img"
        height="160"
        image={imageUrl}
        alt={name}
        sx={{ 
          objectFit: 'contain', 
          p: 2, 
          bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fff',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' }
        }}
        loading="lazy"
      />
    );
  };

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

  const isFavorite = isInWishlist(id);

  return (
    <motion.div whileHover={{ y: -8 }} style={{ display: 'flex', justifyContent: 'center' }}>
      <Card 
        sx={{ 
          width: 260,
          minWidth: 260,
          maxWidth: 260,
          borderRadius: 4, 
          height: '100%', 
          position: 'relative', 
          border: `1px solid ${theme.palette.divider}`, 
          boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.paper,
        }}
      >
        {promotion && (
          <Chip
            label="Promoção!"
            color="secondary"
            size="small"
            sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, fontWeight: 400 }}
          />
        )}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <IconButton
                onClick={handleToggleWishlist}
                sx={{ 
                    bgcolor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)', 
                    backdropFilter: 'blur(4px)', 
                    '&:hover': { bgcolor: isDarkMode ? 'rgba(0,0,0,0.7)' : '#fff' }, 
                    color: isFavorite ? '#ff4d4f' : theme.palette.text.secondary 
                }}
                size="small"
            >
                {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
        </Box>

        <Box sx={{ position: 'relative', bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : '#fbfbfb', borderBottom: `1px solid ${theme.palette.divider}` }}>
            {renderImage()}
        </Box>

        <CardContent sx={{ flexGrow: 1, pt: 2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Tooltip title={name} arrow placement="top">
            <Typography 
                gutterBottom 
                variant="subtitle1" 
                component="div" 
                sx={{ 
                    fontWeight: 400, 
                    color: theme.palette.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    minHeight: '1.5em'
                }}
            >
                {name}
            </Typography>
          </Tooltip>
          
          {description && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, height: 32, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontWeight: 400, lineHeight: 1.4 }}>
              {description}
            </Typography>
          )}
          
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 400, color: theme.palette.primary.main, fontSize: '1.1rem' }}>
                R$ {price.toFixed(2)}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 400, color: '#faad14', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              ⭐ {rating.toFixed(1)}
            </Typography>
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button 
            fullWidth
            startIcon={<FaShoppingCart />}
            label="Adicionar" 
            onClick={handleAddToCart} 
            color="primary" 
            size="small" 
            sx={{ fontWeight: 400, borderRadius: '8px', py: 1, boxShadow: 'none' }}
          />
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            {onQuickView && (
              <Button 
                fullWidth
                variant="outlined"
                startIcon={<FaEye />}
                label="Ver" 
                onClick={() => onQuickView(id)} 
                size="small" 
                sx={{ 
                    fontWeight: 400, 
                    borderRadius: '8px', 
                    border: `1px solid ${theme.palette.divider}`, 
                    color: theme.palette.text.secondary,
                    '&:hover': { bgcolor: theme.palette.action.hover }
                }}
              />
            )}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {onEdit && (
                <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(id)} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', color: theme.palette.text.secondary }}><FaEdit size={14} /></IconButton>
                </Tooltip>
                )}
                {onDelete && (
                <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => onDelete(id)} sx={{ border: `1px solid ${isDarkMode ? 'rgba(255,77,79,0.2)' : '#fff1f0'}`, borderRadius: '8px' }}><FaTrash size={14} /></IconButton>
                </Tooltip>
                )}
            </Box>
          </Box>
        </CardActions>
      </Card>
    </motion.div>
  );
});