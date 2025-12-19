import React from 'react';
import { Box, Grid, Typography, Paper, Divider, TextField, Stack } from '@mui/material';
import { AnimatedStepper } from '../components/AnimatedStepper';

// Mock data
const cartItems = [
    { id: 1, name: 'iPhone 15 Pro Max', price: 9299.99, quantity: 1 },
    { id: 2, name: 'Capa de Silicone', price: 299.00, quantity: 1 },
];
const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const shipping = 25.00;
const total = subtotal + shipping;

const steps = [
    {
      label: 'Informações Pessoais',
      content: (
          <Stack spacing={2}>
              <TextField label="Nome Completo" variant="outlined" fullWidth />
              <TextField label="Email" variant="outlined" fullWidth />
          </Stack>
      )
    },
    {
      label: 'Endereço de Entrega',
      content: (
          <Stack spacing={2}>
              <TextField label="Endereço" variant="outlined" fullWidth />
              <TextField label="Cidade" variant="outlined" fullWidth />
              <TextField label="CEP" variant="outlined" fullWidth />
          </Stack>
      )
    },
    {
      label: 'Pagamento',
      content: (
          <Stack spacing={2}>
              <Typography>Como você gostaria de pagar?</Typography>
              <Button fullWidth sx={{backgroundColor: 'black', color: 'white', '&:hover': {backgroundColor: '#333'}}}>Pagar com <b style={{marginLeft: 4}}>G</b> Pay</Button>
              <Button fullWidth sx={{backgroundColor: 'black', color: 'white', '&:hover': {backgroundColor: '#333'}}}> Pay</Button>
              <Divider>OU</Divider>
              <TextField label="Número do Cartão" variant="outlined" fullWidth />
              <TextField label="Validade (MM/AA)" variant="outlined" />
              <TextField label="CVV" variant="outlined" />
          </Stack>
      )
    },
    {
        label: 'Revisão',
        content: <Typography>Revise seu pedido antes de finalizar.</Typography>
    }
  ];

const CheckoutPage = () => {
  return (
    <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Checkout</Typography>
        <Grid container spacing={5}>
            {/* Stepper and Forms */}
            <Grid item xs={12} md={8}>
                <AnimatedStepper steps={steps} />
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, borderRadius: '16px', position: 'sticky', top: 80 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Resumo do Pedido</Typography>
                    <Divider sx={{ my: 2 }} />
                    {cartItems.map(item => (
                        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>{item.name} (x{item.quantity})</Typography>
                            <Typography>R$ {item.price.toFixed(2)}</Typography>
                        </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Subtotal</Typography>
                        <Typography color="text.secondary">R$ {subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography color="text.secondary">Frete</Typography>
                        <Typography color="text.secondary">R$ {shipping.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight="bold">Total</Typography>
                        <Typography variant="h6" fontWeight="bold">R$ {total.toFixed(2)}</Typography>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    </Box>
  );
};

export default CheckoutPage;