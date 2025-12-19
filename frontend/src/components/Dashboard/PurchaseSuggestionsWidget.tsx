import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { ShoppingCart, TrendingUp, Warning } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { motion } from 'framer-motion';

interface PurchaseSuggestion {
  productId: string;
  productName: string;
  variationId: number;
  variationColor: string;
  currentStock: number;
  predictedDemand: number;
  suggestedQuantity: number;
  reason: string;
}

const PurchaseSuggestionsWidget: React.FC = () => {
  const [suggestions, setSuggestions] = useState<PurchaseSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { addToast } = useNotification();

  const fetchSuggestions = useCallback(async () => {
    if (!token) {
      setError('Erro de autenticação. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Hardcoded branchId = 1 para demonstração. Em produção, passaria o branchId do usuário.
      const response = await fetch(`/api/inventory/purchase-suggestions?branchId=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (err: any) {
      console.error('Falha ao buscar sugestões de compra:', err);
      setError(err.message || 'Falha ao buscar sugestões de compra.');
      addToast('Falha ao carregar sugestões de compra.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addToast]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Sugestões de Pedidos de Compra
        </Typography>
        {suggestions.length === 0 ? (
          <Alert severity="info">Nenhuma sugestão de compra no momento.</Alert>
        ) : (
          <List dense>
            {suggestions.map((sug, index) => (
              <React.Fragment key={sug.variationId}>
                <ListItem>
                  <ListItemIcon>
                    <ShoppingCart />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        **{sug.productName}** ({sug.variationColor})
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Estoque Atual: {sug.currentStock}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Demanda Prevista: {sug.predictedDemand.toFixed(0)} unidades
                        </Typography>
                        <Typography variant="body2" color="primary">
                          Sugerido Comprar: {sug.suggestedQuantity} unidades
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                </ListItem>
                {index < suggestions.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </motion.div>
  );
};

export default PurchaseSuggestionsWidget;
