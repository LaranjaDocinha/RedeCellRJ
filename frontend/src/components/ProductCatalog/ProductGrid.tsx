import React from 'react';
import { Part } from '../../types/part';
import ProductCard from './ProductCard';
import { Skeleton, Box } from '@mui/material';

interface ProductGridProps {
  products: Part[];
  onProductClick?: (product: Part) => void;
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2, p: 2 }}>
        {Array.from(new Array(8)).map((_, index) => (
          <Box key={index}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
      gap: 2, 
      p: 2, 
      height: 'calc(100vh - 200px)', 
      overflowY: 'auto',
      width: '100%' 
    }}>
      {Array.isArray(products) && products.map((product) => (
        <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
      ))}
    </Box>
  );
};

export default ProductGrid;