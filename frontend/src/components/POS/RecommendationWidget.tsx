import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Part } from '../../types/part';
import { Add } from '@mui/icons-material';
import { Button } from '../Button';

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
        setRecommendations(response.data);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchRecommendations, 1000); // Wait 1s after cart change
    return () => clearTimeout(debounce);
  }, [cartItemIds]);

  if (cartItemIds.length === 0 || recommendations.length === 0) return null;

  return (
    <Box mt={2}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
        {t('recommended_for_you')} (IA)
      </Typography>
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <Grid container spacing={1}>
          {recommendations.map(product => (
            <Grid item xs={12} key={product.id}>
              <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: '#fff3e0' }}>
                <Box flexGrow={1}>
                  <Typography variant="body2" noWrap>{product.name}</Typography>
                  <Typography variant="caption" color="textSecondary">R$ {Number(product.price).toFixed(2)}</Typography>
                </Box>
                <Button 
                    label="" 
                    icon={<Add fontSize="small" />} 
                    onClick={() => onAddProduct(product)} 
                    size="small"
                    style={{ minWidth: '30px', padding: '4px' }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default RecommendationWidget;
