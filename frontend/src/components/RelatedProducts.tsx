import React from 'react';
import { Box, Typography, Grid, Paper, Checkbox } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Mock data
const relatedProductsData = [
  { id: 1, name: 'Capa de Silicone', price: 299.00, imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MPU63?wid=532&hei=582&fmt=png-alpha&.v=1693011682392' },
  { id: 2, name: 'Carregador MagSafe', price: 499.00, imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHXH3?wid=532&hei=582&fmt=png-alpha&.v=1693011682392' },
];

const mainProduct = {
    name: 'iPhone 15 Pro Max',
    price: 9299.99,
}

const MiniProductCard: React.FC<{ product: typeof relatedProductsData[0] }> = ({ product }) => (
    <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', width: 250 }}>
        <Checkbox defaultChecked />
        <img src={product.imageUrl} alt={product.name} style={{ width: 50, height: 50, marginRight: 8 }} />
        <Box>
            <Typography variant="body2" fontWeight="bold">{product.name}</Typography>
            <Typography variant="body2">R$ {product.price.toFixed(2)}</Typography>
        </Box>
    </Paper>
);

export const RelatedProducts: React.FC = () => {
    const total = mainProduct.price + relatedProductsData.reduce((sum, p) => sum + p.price, 0);

  return (
    <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '16px' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Compre Junto</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
        <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', width: 250 }}>
            <Checkbox checked disabled />
            <Typography variant="body2" fontWeight="bold" sx={{ml: 1}}>{mainProduct.name}</Typography>
        </Paper>
        <AddIcon color="disabled" />
        <MiniProductCard product={relatedProductsData[0]} />
        <AddIcon color="disabled" />
        <MiniProductCard product={relatedProductsData[1]} />
      </Box>
      <Box sx={{textAlign: 'right'}}>
        <Typography>Total: <Typography component="span" variant="h5" fontWeight="bold">R$ {total.toFixed(2)}</Typography></Typography>
      </Box>
    </Box>
  );
};