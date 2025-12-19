import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface PurchaseSuggestionsProps {
  customerId: number;
}

const PurchaseSuggestions: React.FC<PurchaseSuggestionsProps> = ({ customerId }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!customerId || !token) return;
      try {
        const response = await fetch(`/api/recommendations/customer/${customerId}/personalized-recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch purchase suggestions');
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [customerId, token]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h6">Sugestões de Compra</Typography>
      {suggestions.length === 0 ? (
        <Typography>Nenhuma sugestão disponível.</Typography>
      ) : (
        <List>
          {suggestions.map(product => (
            <ListItem key={product.product_id}>
              <ListItemText primary={product.product_name} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default PurchaseSuggestions;
