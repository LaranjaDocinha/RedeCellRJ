import React from 'react';
import { Paper, Button, Typography, Slide, Box, Container, CircularProgress } from '@mui/material';
import { FiSave, FiX } from 'react-icons/fi';

interface StickySaveBarProps {
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const StickySaveBar: React.FC<StickySaveBarProps> = ({ 
  isDirty, 
  onSave, 
  onReset,
  isLoading = false
}) => {
  return (
    <Slide direction="up" in={isDirty} mountOnEnter unmountOnExit>
      <Paper 
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200, // Above typical FABs but below modals
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          py: 2
        }}
      >
        <Container maxWidth="xl">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight={500}>
                    Você tem alterações não salvas.
                </Typography>
                
                <Box display="flex" gap={2}>
                    <Button 
                        variant="outlined" 
                        color="inherit" 
                        onClick={onReset}
                        disabled={isLoading}
                        startIcon={<FiX />}
                    >
                        Descartar
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={onSave}
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <FiSave />}
                    >
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </Box>
            </Box>
        </Container>
      </Paper>
    </Slide>
  );
};
