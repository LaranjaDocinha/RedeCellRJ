import React, { useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Add } from '@mui/icons-material';
import { Button } from '../../components/Button'; // Assuming your Button component

interface Product {
  id: number;
  name: string;
  price: number;
  // Add other relevant product fields
}

interface CollaborativeRecommendationsProps {
  customerId: string;
  onAddProductToCart?: (product: Product) => void;
  // Optional: products already owned by the customer or in current cart to exclude
  excludeProductIds?: number[];
}

const CollaborativeRecommendations: React.FC<CollaborativeRecommendationsProps> = ({ 
  customerId, 
  onAddProductToCart, 
  excludeProductIds = [] 
}) => {
  const { t } = useTranslation();

  // Fetch customer's purchase history to use as customerHistoryProductIds
  const { data: customerHistory, isLoading: isLoadingHistory, error: errorHistory } = useQuery<any[]>({
    queryKey: ['customerPurchaseHistory', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/customers/${customerId}/sales-history`); // Assuming this endpoint exists
      return response.data.flatMap((sale: any) => sale.items.map((item: any) => item.product_id));
    },
    enabled: !!customerId,
  });

  const { data: recommendations, isLoading: isLoadingRecommendations, error: errorRecommendations } = useQuery<Product[]>({
    queryKey: ['collaborativeRecommendations', customerId, customerHistory, excludeProductIds],
    queryFn: async () => {
      if (!customerHistory || customerHistory.length === 0) return [];

      const response = await axios.post('/api/recommendations/collaborative', {
        customerHistoryProductIds: customerHistory,
        excludeProductIds: excludeProductIds,
      });
      return response.data;
    },
    enabled: !!customerId && !isLoadingHistory && !!customerHistory && customerHistory.length > 0,
  });

  if (isLoadingHistory || isLoadingRecommendations) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (errorHistory || errorRecommendations || !recommendations || recommendations.length === 0) {
    return (
      <Box mt={2} p={2} bgcolor="background.paper">
        <Typography variant="h6" gutterBottom>{t('collaborative_recommendations')}</Typography>
        <Typography variant="body2" color="textSecondary">
          {errorHistory || errorRecommendations ? t('failed_to_load_recommendations') : t('no_collaborative_recommendations')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>{t('collaborative_recommendations')}</Typography>
      <Grid container spacing={1}>
        {recommendations.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: '#e8f5e9' }}>
              <Box flexGrow={1}>
                <Typography variant="body2" noWrap>{product.name}</Typography>
                <Typography variant="caption" color="textSecondary">R$ {Number(product.price).toFixed(2)}</Typography>
              </Box>
              {onAddProductToCart && (
                <Button 
                    label="" 
                    icon={<Add fontSize="small" />} 
                    onClick={() => onAddProductToCart(product)} 
                    size="small"
                    style={{ minWidth: '30px', padding: '4px' }}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CollaborativeRecommendations;
