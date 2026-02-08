import React from 'react';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { Box, Typography, Grid, Paper, Avatar } from '@mui/material';

export const RecentlyViewed: React.FC = () => {
    const { recentlyViewedItems } = useRecentlyViewed();

    if (recentlyViewedItems.length === 0) {
        return null; // Don't render if there are no items
    }

    return (
        <Paper sx={{ p: 2, mt: 4, borderRadius: '16px' }}>
            <Typography variant="h6" fontWeight={400} gutterBottom>Vistos Recentemente</Typography>
            <Grid container spacing={2}>
                {recentlyViewedItems.map(item => (
                    <Grid item key={item.id} xs>
                        <Box sx={{textAlign: 'center'}}>
                            <Avatar src={item.imageUrl} variant="rounded" sx={{width: 80, height: 80, margin: 'auto'}} />
                            <Typography variant="caption" display="block" noWrap>{item.name}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

