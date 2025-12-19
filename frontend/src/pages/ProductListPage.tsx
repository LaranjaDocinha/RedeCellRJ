import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { useProducts } from '../hooks/useProducts';
import { Box, Typography, Grid, Pagination } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import LabelPrintModal from '../components/ProductCatalog/LabelPrintModal';
import ShelfLabelModal from '../components/ProductCatalog/ShelfLabelModal'; // Added import
import ProductCardSkeleton from '../components/ProductCardSkeleton'; // Added import

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error, page, totalPages, setPage, setFilters } = useProducts();
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isShelfLabelModalOpen, setIsShelfLabelModalOpen] = useState(false); // Added state

  // const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setFilters((prev) => ({ ...prev, search: event.target.value }));
  // };

  if (loading) return (
    <Grid container spacing={3} sx={{p:3}}>
      {Array.from(new Array(6)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <ProductCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
  if (error) return <div>Error loading products</div>;

  return (
    <ErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Produtos</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
             <Button variant="outlined" onClick={() => setIsShelfLabelModalOpen(true)}>
                Imprimir Gôndola (QR)
             </Button>
             <Button variant="outlined" onClick={() => setIsLabelModalOpen(true)}>
                Imprimir Etiquetas (ZPL)
             </Button>
             <Button variant="contained" onClick={() => navigate('/products/new')}>
                Novo Produto
             </Button>
          </Box>
        </Box>

        {/* Add Filters UI here if needed */}
        
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard product={product} onClick={() => navigate(`/products/${product.id}`)} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Box>

        <LabelPrintModal 
            open={isLabelModalOpen} 
            onClose={() => setIsLabelModalOpen(false)} 
            products={products} 
        />

        <ShelfLabelModal 
            open={isShelfLabelModalOpen} 
            onClose={() => setIsShelfLabelModalOpen(false)} 
            products={products} 
        />
      </Box>
    </ErrorBoundary>
  );
};

export default ProductListPage;
