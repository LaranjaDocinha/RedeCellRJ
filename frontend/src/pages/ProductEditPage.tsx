import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import ProductForm from '../components/Products/ProductForm';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <IconButton onClick={() => navigate('/products')} color="primary">
          <FaArrowLeft size={18} />
        </IconButton>
        <Typography variant="h5">Editar Produto</Typography>
      </Box>
      
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', bgcolor: '#f8f9fa' }}>
        <ProductForm 
          productId={id} 
          onSuccess={() => navigate('/products')} 
          onCancel={() => navigate('/products')}
        />
      </Paper>
    </Box>
  );
};

export default ProductEditPage;
