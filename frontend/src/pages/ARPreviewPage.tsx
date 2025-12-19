import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, FormControl, InputLabel, Select, MenuItem, Card, CardMedia, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { FaCameraRetro } from 'react-icons/fa';

const ARPreviewPage: React.FC = () => {
  const [compatibleProducts, setCompatibleProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deviceId, setDeviceId] = useState('1'); // Placeholder for customer's device ID

  const { token } = useAuth();

  useEffect(() => {
    const fetchCompatibleProducts = async () => {
      if (!token || !deviceId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/ar/compatible-products/${deviceId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setCompatibleProducts(data.products);
        if (data.products.length > 0) {
          setSelectedProduct(data.products[0]);
        }
      } catch (error) {
        console.error('Error fetching compatible products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompatibleProducts();
  }, [token, deviceId]);

  const handleCaptureARPreview = async () => {
    if (!token || !selectedProduct || !deviceId) return;
    try {
      await fetch('/api/ar/log-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerId: 1, productId: selectedProduct.id }), // Placeholder customerId
      });
      alert(`Pré-visualização AR capturada para ${selectedProduct.name} (simulado)!`);
    } catch (error) {
      console.error('Error logging AR interaction:', error);
      alert('Erro ao capturar pré-visualização AR.');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Realidade Aumentada: Testar Capinhas</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Selecione seu Dispositivo e Capinha</Typography>
            <TextField
              fullWidth
              label="ID do Dispositivo (Simulado)"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Escolha uma Capinha</InputLabel>
              <Select
                value={selectedProduct ? selectedProduct.id : ''}
                onChange={(e) => setSelectedProduct(compatibleProducts.find(p => p.id === e.target.value))}
                label="Escolha uma Capinha"
              >
                {compatibleProducts.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleCaptureARPreview} startIcon={<FaCameraRetro />}>Capturar Pré-visualização</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Pré-visualização AR (Simulada)</Typography>
            {selectedProduct ? (
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  sx={{ objectFit: 'contain', backgroundColor: '#f0f0f0' }}
                />
                <CardContent>
                  <Typography variant="h6">{selectedProduct.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Visualização simulada no seu dispositivo.</Typography>
                </CardContent>
              </Card>
            ) : (
              <Typography>Selecione um produto para pré-visualizar.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ARPreviewPage;
