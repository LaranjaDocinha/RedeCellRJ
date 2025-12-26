import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

interface PurchaseSuggestionsWidgetProps {
  data: {
    purchaseSuggestions?: Array<{
      productId: string;
      productName: string;
      suggestedQuantity: number;
      reason: string;
    }>;
  };
}

const PurchaseSuggestionsWidget: React.FC<PurchaseSuggestionsWidgetProps> = ({ data }) => {
  const suggestions = data?.purchaseSuggestions || [];

  return (
    <Paper sx={{ p: 3, borderRadius: '16px', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Sugestões de Compra (IA)
      </Typography>

      {suggestions.length > 0 ? (
        <List sx={{ flexGrow: 1, overflow: 'auto', mt: 1 }}>
          {suggestions.map((item, index) => (
            <React.Fragment key={item.productId}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ShoppingCart fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.productName}</Typography>}
                  secondary={`Sugerido: ${item.suggestedQuantity} un. | ${item.reason}`}
                />
              </ListItem>
              {index < suggestions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
          <Typography variant="body2" color="text.secondary">Sem sugestões no momento</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PurchaseSuggestionsWidget;