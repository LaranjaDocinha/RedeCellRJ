import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';

const BrandingPage: React.FC = () => {
  const { branding, updateBranding, loading: brandingLoading } = useBranding();
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(branding.secondaryColor);
  const [fontFamily, setFontFamily] = useState(branding.fontFamily);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    setLogoUrl(branding.logoUrl);
    setPrimaryColor(branding.primaryColor);
    setSecondaryColor(branding.secondaryColor);
    setFontFamily(branding.fontFamily);
  }, [branding]);

  const handleSaveBranding = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Simulate API call to save branding settings
      const res = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ logoUrl, primaryColor, secondaryColor, fontFamily }),
      });
      const data = await res.json();
      if (data.success) {
        updateBranding({ logoUrl, primaryColor, secondaryColor, fontFamily });
        alert('Configurações de branding salvas com sucesso!');
      } else {
        alert(data.message || 'Erro ao salvar configurações de branding.');
      }
    } catch (error) {
      console.error('Error saving branding settings:', error);
      alert('Erro ao salvar configurações de branding.');
    } finally {
      setLoading(false);
    }
  };

  if (brandingLoading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>White-labeling para Franquias</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Personalizar Marca</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL do Logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Cor Primária"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Cor Secundária"
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Fonte (Font Family)"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <Button variant="contained" onClick={handleSaveBranding} disabled={loading}>Salvar Configurações</Button>
            {loading && <CircularProgress sx={{ ml: 2 }} size={24} />}
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', backgroundColor: secondaryColor, color: primaryColor, fontFamily: fontFamily }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: primaryColor, fontFamily: fontFamily }}>Pré-visualização</Typography>
                {logoUrl && <img src={logoUrl} alt="Logo Preview" style={{ maxWidth: '100px', marginBottom: '16px' }} />}
                <Typography variant="h5" sx={{ color: primaryColor, fontFamily: fontFamily }}>Título da Aplicação</Typography>
                <Button variant="contained" sx={{ mt: 2, backgroundColor: primaryColor, color: secondaryColor, fontFamily: fontFamily }}>Botão Exemplo</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default BrandingPage;
