import React from 'react';
import { Box, Grid, Typography, Paper, Divider, List, ListItem, ListItemText, Avatar, ListItemAvatar } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart'; // Using MUI X charts for variety

// Mock data
const user = { name: 'João da Silva' };
const recentOrders = [
    { id: '#12345', date: '20/09/2025', total: 350.50, status: 'Entregue' },
    { id: '#12346', date: '22/09/2025', total: 120.00, status: 'Enviado' },
];
const loyalty = { points: 1500, tier: 'Ouro' };
const wishlist = [
    { id: 1, name: 'Smartwatch Series 9', imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTP63_VW_34FR+watch-41-alum-midnight-nc-9s_VW_34FR_WF_CO?wid=750&hei=712&trim=1&fmt=p-jpg&qlt=95&.v=1693251270398' },
    { id: 2, name: 'Fone de Ouvido Pro', imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=572&hei=572&fmt=jpeg&qlt=95&.v=1694014871985' },
];

const UserDashboardPage = () => {
  return (
    <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Bem-vindo, {user.name}!</Typography>
        <Grid container spacing={3}>
            {/* Loyalty Program */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold">Programa de Fidelidade</Typography>
                    <Box sx={{textAlign: 'center', my: 3}}>
                        <Typography variant="h3" fontWeight="bold" color="primary">{loyalty.points}</Typography>
                        <Typography>Pontos ({loyalty.tier})</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" align="center">Continue comprando para ganhar mais recompensas!</Typography>
                </Paper>
            </Grid>

            {/* Recent Orders */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold">Pedidos Recentes</Typography>
                    <List>
                        {recentOrders.map(order => (
                            <ListItem key={order.id} secondaryAction={<Typography>{order.status}</Typography>}>
                                <ListItemText primary={`${order.id} - R$ ${order.total.toFixed(2)}`} secondary={order.date} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>

            {/* Wishlist */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2, borderRadius: '16px' }}>
                    <Typography variant="h6" fontWeight="bold">Sua Lista de Desejos</Typography>
                    <List>
                        {wishlist.map(item => (
                            <ListItem key={item.id}>
                                <ListItemAvatar>
                                    <Avatar variant="rounded" src={item.imageUrl} />
                                </ListItemAvatar>
                                <ListItemText primary={item.name} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>
        </Grid>
    </Box>
  );
};

export default UserDashboardPage;