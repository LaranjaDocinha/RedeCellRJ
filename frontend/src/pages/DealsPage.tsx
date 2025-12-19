import React from 'react';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import { ProductCard } from '../components/ProductCard';
import { Countdown } from '../components/Countdown';
import { CategoryFilter } from '../components/CategoryFilter';

// Mock data
const dealCategories = [
    { id: '1', name: 'Oferta Relâmpago' },
    { id: '2', name: 'Queima de Estoque' },
    { id: '3', name: 'Combos' },
];
const dealProducts = [
    {
        id: 1, name: 'Câmera Pro 4K', price: 2499.00, originalPrice: 3499.00, rating: 4.7, onAddToCart: () => {},
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1964&auto=format&fit=crop',
        endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    },
    {
        id: 2, name: 'Drone Explorer', price: 1899.00, originalPrice: 2599.00, rating: 4.8, onAddToCart: () => {},
        imageUrl: 'https://images.unsplash.com/photo-1507582020474-0a47a06355a7?q=80&w=2070&auto=format&fit=crop',
        endDate: new Date(new Date().getTime() + 5 * 60 * 60 * 1000) // 5 hours from now
    },
];

const DealsPage = () => {
  return (
    <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Ofertas e Promoções</Typography>
        <Box sx={{mb: 4}}>
            <CategoryFilter categories={dealCategories} onFilterChange={() => {}} title="Filtrar por tipo de oferta" />
        </Box>
        <Grid container spacing={3}>
            {dealProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Paper sx={{position: 'relative', borderRadius: '16px', overflow: 'hidden'}}>
                        <ProductCard {...product} />
                        <Box sx={{position: 'absolute', top: 0, left: 0, right: 0, p: 1, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', textAlign: 'center'}}>
                            <Typography variant="subtitle2">A OFERTA TERMINA EM</Typography>
                            <Countdown targetDate={product.endDate} />
                        </Box>
                        <Typography sx={{position: 'absolute', bottom: 100, right: 16, textDecoration: 'line-through', color: 'text.secondary'}}>
                            R$ {product.originalPrice.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    </Box>
  );
};

export default DealsPage;