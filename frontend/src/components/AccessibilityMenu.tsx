import React, { useState, useEffect } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, FormControlLabel, Switch, Slider, Typography, Box } from '@mui/material';
import { AccessibilityNew } from '@mui/icons-material';
import { createGlobalStyle } from 'styled-components';

// Global styles injection based on preferences
const AccessibilityGlobalStyles = createGlobalStyle<{ highContrast: boolean; fontSize: number }>`
  html {
    font-size: ${props => props.fontSize}px !important;
  }
  
  body {
    ${props => props.highContrast && `
      background-color: #000 !important;
      color: #fff !important;
      
      * {
        border-color: #fff !important;
      }
      
      .MuiPaper-root, .MuiCard-root {
        background-color: #121212 !important;
        color: #fff !important;
        border: 1px solid #fff !important;
      }
      
      a {
        color: #ffff00 !important;
        text-decoration: underline !important;
      }
      
      button {
        background-color: #000 !important;
        color: #fff !important;
        border: 2px solid #fff !important;
        font-weight: bold !important;
      }
    `}
  }
`;

const AccessibilityMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    highContrast: false,
    fontSize: 16,
    reduceMotion: false
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility_prefs');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  // Save and Apply
  useEffect(() => {
    localStorage.setItem('accessibility_prefs', JSON.stringify(preferences));
    
    // Apply reduce motion
    if (preferences.reduceMotion) {
      document.documentElement.style.setProperty('--framer-motion-duration', '0s');
      // Framer motion uses standard CSS var check usually, or we disable globally via Context
    }
  }, [preferences]);

  return (
    <>
      <AccessibilityGlobalStyles highContrast={preferences.highContrast} fontSize={preferences.fontSize} />
      
      <Fab 
        color="primary" 
        aria-label="Acessibilidade" 
        sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 11000 }}
        onClick={() => setOpen(true)}
      >
        <AccessibilityNew />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ferramentas de Acessibilidade</DialogTitle>
        <DialogContent>
          <Box mb={3} mt={1}>
            <Typography gutterBottom>Tamanho da Fonte ({preferences.fontSize}px)</Typography>
            <Slider
              value={preferences.fontSize}
              min={12}
              max={24}
              step={1}
              marks
              onChange={(_, val) => setPreferences(prev => ({ ...prev, fontSize: val as number }))}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={preferences.highContrast}
                onChange={(e) => setPreferences(prev => ({ ...prev, highContrast: e.target.checked }))}
              />
            }
            label="Alto Contraste"
            sx={{ mb: 2, display: 'block' }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.reduceMotion}
                onChange={(e) => setPreferences(prev => ({ ...prev, reduceMotion: e.target.checked }))}
              />
            }
            label="Reduzir Animações"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccessibilityMenu;
