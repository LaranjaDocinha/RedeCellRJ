import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Part } from '../../types/part';
import { Add } from '@mui/icons-material';
import { Button } from '../Button';
import { CompactSearchResult } from '../../styles/POSStyles';

interface RecommendationWidgetProps {
  cartItemIds: number[];
  onAddProduct: (product: Part) => void;
}

const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({ cartItemIds, onAddProduct }) => {
  const [recommendations, setRecommendations] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (cartItemIds.length === 0) {
        setRecommendations([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post('/api/recommendations/cart-upsell', { productIds: cartItemIds });
        setRecommendations(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchRecommendations, 1000);
    return () => clearTimeout(debounce);
  }, [cartItemIds]);

  if (cartItemIds.length === 0 || recommendations.length === 0) return null;

  return (
    <Box mt={2}>
      <Typography variant="caption" gutterBottom sx={{ fontWeight: 400, color: 'primary.main', letterSpacing: 1 }}>
        SUGESTÕES DE UPSELL (IA)
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={2}><CircularProgress size={20} /></Box>
      ) : (
        <Grid container spacing={1} sx={{ mt: 0.5 }}>
          {recommendations.map((product) => (
            <Grid item xs={12} key={product.id}>
              <CompactSearchResult onClick={() => onAddProduct(product)} whileHover={{ x: 5 }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={400} noWrap>{product.name}</Typography>
                  <Typography variant="caption" color="text.secondary">R$ {Number(product.price || 0).toFixed(2)}</Typography>
                </Box>
                <IconButton 
                    size="small" 
                    color="primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddProduct(product);
                    }}
                    sx={{ bgcolor: 'primary.50' }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </CompactSearchResult>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

import { IconButton } from '@mui/material';

export default RecommendationWidget;
