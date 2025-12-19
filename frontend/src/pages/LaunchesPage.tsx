import React from 'react';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import { ProductCard } from '../components/ProductCard';
import { Countdown } from '../components/Countdown';

// Mock data
const newProduct = {
    id: 1, name: 'Super Fone X', price: 1299.00, rating: 4.9, onAddToCart: () => {},
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop'
};
const preOrderProduct = {
    id: 2, name: 'Hyper Console 2', price: 4999.00, rating: 5.0, onAddToCart: () => {},
    imageUrl: 'https://images.unsplash.com/photo-1593344484962-796b931a8b33?q=80&w=2070&auto=format&fit=crop',
    launchDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
};

const LaunchesPage = () => {
  return (
    <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Lançamentos e Pré-vendas</Typography>
        
        {/* Pre-order Section */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <img src={preOrderProduct.imageUrl} alt={preOrderProduct.name} style={{width: 200, height: 200, objectFit: 'cover', borderRadius: '16px'}} />
            <Box>
                <Typography variant="h5" fontWeight="bold">{preOrderProduct.name}</Typography>
                <Typography color="text.secondary" gutterBottom>Lançamento em breve!</Typography>
                <Countdown targetDate={preOrderProduct.launchDate} />
            </Box>
        </Paper>

        {/* New Releases Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>Novidades</Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
                <Box sx={{position: 'relative'}}>
                    <ProductCard {...newProduct} />
                    <Chip label="NOVO" color="primary" sx={{position: 'absolute', top: 16, right: 16, fontWeight: 'bold'}} />
                </Box>
            </Grid>
            {/* Add more new products here */}
        </Grid>
    </Box>
  );
};

export default LaunchesPage;