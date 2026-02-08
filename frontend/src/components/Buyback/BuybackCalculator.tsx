import React, { useState } from 'react';
import { Box, Typography, Card, Grid, Checkbox, FormControlLabel, Button, TextField } from '@mui/material';
import AnimatedCounter from '../AnimatedCounter';

const BuybackCalculator: React.FC = () => {
  const [basePrice, setBasePrice] = useState(2000); // Ex: iPhone 11 base
  const [conditions, setConditions] = useState({
    screenCracked: false,
    batteryService: false,
    faceIdBroken: false,
    housingScratched: false
  });
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    // Simulating API call locally for UI demo (logic mirrors backend)
    let penalty = 0;
    if (conditions.screenCracked) penalty += 0.20;
    if (conditions.batteryService) penalty += 0.10;
    if (conditions.faceIdBroken) penalty += 0.15;
    if (conditions.housingScratched) penalty += 0.05;
    penalty = Math.min(penalty, 0.70);
    const finalPrice = basePrice * (1 - penalty);

    setResult({
      finalPrice,
      rating: penalty < 0.1 ? 'Excelente' : 'Regular'
    });
  };

  return (
    <Card sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Calculadora de Trade-In (Buyback)</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Preço Base de Revenda (R$)" 
            type="number" 
            fullWidth 
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>Condições do Aparelho:</Typography>
          <Box display="flex" flexDirection="column">
            <FormControlLabel control={<Checkbox checked={conditions.screenCracked} onChange={(e) => setConditions({...conditions, screenCracked: e.target.checked})} />} label="Tela Quebrada (-20%)" />
            <FormControlLabel control={<Checkbox checked={conditions.batteryService} onChange={(e) => setConditions({...conditions, batteryService: e.target.checked})} />} label="Bateria < 80% (-10%)" />
            <FormControlLabel control={<Checkbox checked={conditions.faceIdBroken} onChange={(e) => setConditions({...conditions, faceIdBroken: e.target.checked})} />} label="FaceID / TouchID Ruim (-15%)" />
            <FormControlLabel control={<Checkbox checked={conditions.housingScratched} onChange={(e) => setConditions({...conditions, housingScratched: e.target.checked})} />} label="Carcaça Riscada (-5%)" />
          </Box>

          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={calculate}>
            Calcular Oferta
          </Button>
        </Grid>

        <Grid item xs={12} md={6} display="flex" alignItems="center" justifyContent="center">
          {result ? (
            <Box textAlign="center">
              <Typography color="textSecondary">Oferta Sugerida</Typography>
              <Typography variant="h2" color="primary" sx={{ fontWeight: 400 }}>
                R$ <AnimatedCounter value={result.finalPrice} />
              </Typography>
              <Typography variant="overline" display="block" sx={{ mt: 1, fontSize: '1.2rem', color: result.rating === 'Excelente' ? 'green' : 'orange' }}>
                Condição: {result.rating}
              </Typography>
            </Box>
          ) : (
            <Typography color="textSecondary">Preencha os dados para calcular.</Typography>
          )}
        </Grid>
      </Grid>
    </Card>
  );
};

export default BuybackCalculator;

