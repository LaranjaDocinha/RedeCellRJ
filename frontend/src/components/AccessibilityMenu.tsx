import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, FormControlLabel, Switch, Slider, Typography, Box, IconButton } from '@mui/material';
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

interface AccessibilityMenuProps {
  open: boolean;
  onClose: () => void;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ open, onClose }) => {
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
    
    if (preferences.reduceMotion) {
      document.documentElement.style.setProperty('--framer-motion-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--framer-motion-duration');
    }
  }, [preferences]);

  return (
    <>
      <AccessibilityGlobalStyles highContrast={preferences.highContrast} fontSize={preferences.fontSize} />
      
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Acessibilidade</DialogTitle>
        <DialogContent>
          <Box mb={3} mt={1}>
            <Typography variant="body2" fontWeight={700} gutterBottom>Tamanho da Fonte ({preferences.fontSize}px)</Typography>
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
            label={<Typography variant="body2" fontWeight={700}>Alto Contraste</Typography>}
            sx={{ mb: 2, display: 'block' }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.reduceMotion}
                onChange={(e) => setPreferences(prev => ({ ...prev, reduceMotion: e.target.checked }))}
              />
            }
            label={<Typography variant="body2" fontWeight={700}>Reduzir Animações</Typography>}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccessibilityMenu;