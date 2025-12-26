import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Grid, 
  Divider,
  Stack,
  useTheme,
  IconButton,
  Breadcrumbs
} from '@mui/material';
import { 
  Palette as PaletteIcon, 
  CloudUpload as UploadIcon, 
  Save as SaveIcon, 
  Settings as SettingsIcon,
  Restore as ResetIcon,
  LaptopMac as LaptopIcon,
  Smartphone as MobileIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { motion } from 'framer-motion';
import { Link as MuiLink } from '@mui/material';

const BrandingPage: React.FC = () => {
  const theme = useTheme();
  const { branding, updateBranding, loading: brandingLoading } = useBranding();
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(branding.secondaryColor);
  const [fontFamily, setFontFamily] = useState(branding.fontFamily);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

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
      const response = await fetch('/api/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          logoUrl,
          primaryColor,
          secondaryColor,
          fontFamily
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        updateBranding(updatedData); // Atualiza o contexto globalmente
        alert('Identidade visual atualizada com sucesso!');
      } else {
        alert('Erro ao salvar configurações.');
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  if (brandingLoading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box p={4} sx={{ maxWidth: 1600, margin: '0 auto' }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component="button" onClick={() => {}} underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.9rem' }}>
          <SettingsIcon sx={{ fontSize: 16 }} /> Configurações
        </MuiLink>
        <Typography sx={{ fontSize: '0.9rem' }} color="text.primary">Identidade Visual</Typography>
      </Breadcrumbs>

      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h3" sx={{ letterSpacing: '-1.5px', mb: 1 }}>
            Personalização de Marca
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Adapte a Redecell com a identidade visual da sua franquia ou rede de lojas.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<ResetIcon />} sx={{ borderRadius: '12px' }}>Resetar</Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSaveBranding}
            disabled={loading}
            sx={{ borderRadius: '12px', px: 4, py: 1.5, boxShadow: '0 10px 20px rgba(25, 118, 210, 0.2)' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar Identidade'}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: Editor */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PaletteIcon color="primary" /> Paleta de Cores
              </Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">COR PRIMÁRIA</Typography>
                  <Box display="flex" gap={2} mt={1}>
                    <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)} 
                        style={{ width: 50, height: 50, border: 'none', borderRadius: '12px', cursor: 'pointer', background: 'none' }} 
                    />
                    <TextField 
                        size="small" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)} 
                        fullWidth 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} 
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">COR SECUNDÁRIA</Typography>
                  <Box display="flex" gap={2} mt={1}>
                    <input 
                        type="color" 
                        value={secondaryColor} 
                        onChange={(e) => setSecondaryColor(e.target.value)} 
                        style={{ width: 50, height: 50, border: 'none', borderRadius: '12px', cursor: 'pointer', background: 'none' }} 
                    />
                    <TextField 
                        size="small" 
                        value={secondaryColor} 
                        onChange={(e) => setSecondaryColor(e.target.value)} 
                        fullWidth 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} 
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <UploadIcon color="primary" /> Logotipo e Tipografia
              </Typography>
              <TextField
                fullWidth
                label="URL do Logotipo"
                placeholder="https://sua-empresa.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                fullWidth
                label="Família da Fonte"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                helperText="Ex: 'Inter', 'Roboto', 'Open Sans'"
              />
            </Paper>
          </Stack>
        </Grid>

        {/* Lado Direito: Live Preview */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', height: '100%', minHeight: 600, display: 'flex', flexDirection: 'column', boxShadow: 'none' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h6">Live Preview</Typography>
              <Stack direction="row" spacing={1} sx={{ bgcolor: 'background.paper', p: 0.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                <IconButton size="small" onClick={() => setPreviewMode('desktop')} color={previewMode === 'desktop' ? 'primary' : 'default'}><LaptopIcon /></IconButton>
                <IconButton size="small" onClick={() => setPreviewMode('mobile')} color={previewMode === 'mobile' ? 'primary' : 'default'}><MobileIcon /></IconButton>
              </Stack>
            </Box>

            <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
              <motion.div 
                animate={{ width: previewMode === 'desktop' ? '100%' : '320px' }}
                transition={{ type: 'spring', damping: 20 }}
                style={{ 
                    height: 500, 
                    backgroundColor: theme.palette.background.paper, 
                    borderRadius: '24px', 
                    border: `8px solid ${theme.palette.mode === 'dark' ? '#333' : '#1e1e1e'}`, 
                    overflow: 'hidden', 
                    boxShadow: '0 30px 60px rgba(0,0,0,0.1)' 
                }}
              >
                <Box sx={{ p: 0, height: '100%', fontFamily: fontFamily }}>
                  {/* Fake Topbar */}
                  <Box sx={{ height: 50, bgcolor: primaryColor, display: 'flex', alignItems: 'center', px: 2, justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {logoUrl ? <img src={logoUrl} alt="Logo" style={{ height: 20 }} /> : <Box sx={{ width: 20, height: 20, bgcolor: 'white', borderRadius: '4px' }} />}
                      <Typography variant="caption" sx={{ color: 'white', letterSpacing: 1 }}>REDECELL</Typography>
                    </Box>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                  </Box>
                  {/* Fake Content */}
                  <Box p={3}>
                    <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>Dashboard</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}><Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '12px' }}><Box sx={{ width: '40%', height: 8, bgcolor: primaryColor, borderRadius: 4, mb: 1 }} /><Box sx={{ width: '80%', height: 16, bgcolor: 'text.secondary', opacity: 0.1, borderRadius: 4 }} /></Paper></Grid>
                      <Grid size={{ xs: 6 }}><Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '12px' }}><Box sx={{ width: '40%', height: 8, bgcolor: secondaryColor, borderRadius: 4, mb: 1 }} /><Box sx={{ width: '80%', height: 16, bgcolor: 'text.secondary', opacity: 0.1, borderRadius: 4 }} /></Paper></Grid>
                    </Grid>
                    <Button variant="contained" fullWidth sx={{ mt: 4, bgcolor: primaryColor, borderRadius: '10px', textTransform: 'none', color: '#fff' }}>Botão de Exemplo</Button>
                    <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 2, color: 'text.disabled' }}>Pré-visualização em tempo real</Typography>
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrandingPage;