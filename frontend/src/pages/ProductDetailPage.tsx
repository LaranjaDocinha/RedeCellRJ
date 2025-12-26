import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Divider } from '@mui/material';
import { ImageGallery } from '../components/ImageGallery';
import { ProductInfo } from '../components/ProductInfo';
import { ProductReviews } from '../components/ProductReviews';
import { RelatedProducts } from '../components/RelatedProducts';
import { ReviewForm } from '../components/ReviewForm';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useProduct } from '../hooks/useProduct';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ErrorBoundary'; // Import ErrorBoundary

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, isError } = useProduct(id || '');
  const { addRecentlyViewed } = useRecentlyViewed();
  const [mainImageUrl, setMainImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (product) {
      addRecentlyViewed({ id: product.id.toString(), name: product.name, imageUrl: product.variations[0]?.image_url || '/placeholder.png' });
      setMainImageUrl(product.variations[0]?.image_url || '/placeholder.png'); // Set initial main image
    }
  }, [product, addRecentlyViewed]);

  const handleSelectedVariationChange = (imageUrl: string) => {
    setMainImageUrl(imageUrl);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !product) {
    return <Box sx={{ p: 4 }}>Produto não encontrado ou erro ao carregar.</Box>;
  }

  return (
    <ErrorBoundary> {/* Wrap the main content with ErrorBoundary */}
      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ImageGallery images={product.variations.map(v => v.image_url || '/placeholder.png')} selectedImage={mainImageUrl} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ProductInfo product={product} onChangeSelectedVariation={handleSelectedVariationChange} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
              <ProductReviews />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
              <ReviewForm />
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Grid container>
          <Grid size={{ xs: 12 }}>
              <RelatedProducts />
          </Grid>
        </Grid>

        {/* <RecentlyViewed /> */} {/* This component is not imported, commenting out for now */}
      </Box>
    </ErrorBoundary>
  );
};

export default ProductDetailPage;
