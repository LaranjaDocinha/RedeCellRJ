import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  FormControlLabel, 
  Checkbox, 
  Button,
  Divider,
  useTheme
} from '@mui/material';
import { FaCheck, FaTimes, FaMinus } from 'react-icons/fa';

interface TechnicalChecklistProps {
  initialData?: any;
  onSave: (data: any) => void;
  readOnly?: boolean;
}

const CHECKLIST_ITEMS = [
  { key: 'screen', label: 'Tela / Touch' },
  { key: 'camera_front', label: 'Câmera Frontal' },
  { key: 'camera_back', label: 'Câmera Traseira' },
  { key: 'battery', label: 'Bateria / Carregamento' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'bluetooth', label: 'Bluetooth' },
  { key: 'audio_speaker', label: 'Alto-falante' },
  { key: 'audio_mic', label: 'Microfone' },
  { key: 'buttons', label: 'Botões Físicos' },
  { key: 'face_id', label: 'Face ID / Touch ID' },
  { key: 'proximity', label: 'Sensor Proximidade' },
  { key: 'housing', label: 'Carcaça / Vidro Traseiro' },
];

const TechnicalChecklist: React.FC<TechnicalChecklistProps> = ({ initialData = {}, onSave, readOnly = false }) => {
  const theme = useTheme();
  const [checklist, setChecklist] = useState<any>(initialData);

  const handleToggle = (key: string, status: 'ok' | 'fail' | 'unchecked') => {
    if (readOnly) return;
    setChecklist((prev: any) => ({
      ...prev,
      [key]: status
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return theme.palette.success.main;
      case 'fail': return theme.palette.error.main;
      default: return theme.palette.text.disabled;
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px' }}>
      <Typography variant="h6" gutterBottom>Checklist de Entrada</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        {CHECKLIST_ITEMS.map((item) => {
          const currentStatus = checklist[item.key] || 'unchecked';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={item.key}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 1.5, 
                  borderRadius: '12px',
                  bgcolor: 'action.hover',
                  border: `1px solid ${readOnly ? 'transparent' : theme.palette.divider}`
                }}
              >
                <Typography variant="body2">{item.label}</Typography>
                <Box>
                  {!readOnly ? (
                    <>
                      <IconButtonSmall 
                        active={currentStatus === 'ok'} 
                        color="success" 
                        onClick={() => handleToggle(item.key, 'ok')}
                      >
                        <FaCheck size={12} />
                      </IconButtonSmall>
                      <IconButtonSmall 
                        active={currentStatus === 'fail'} 
                        color="error" 
                        onClick={() => handleToggle(item.key, 'fail')}
                      >
                        <FaTimes size={12} />
                      </IconButtonSmall>
                    </>
                  ) : (
                    <StatusBadge status={currentStatus} />
                  )}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {!readOnly && (
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" onClick={() => onSave(checklist)}>
            Salvar Checklist
          </Button>
        </Box>
      )}
    </Paper>
  );
};

// Componentes auxiliares locais
const IconButtonSmall = ({ active, color, children, onClick }: any) => {
  const theme = useTheme();
  const activeColor = color === 'success' ? theme.palette.success.main : theme.palette.error.main;
  
  return (
    <Box 
      component="button"
      onClick={onClick}
      sx={{
        border: 'none',
        bgcolor: active ? activeColor : 'transparent',
        color: active ? '#fff' : theme.palette.text.disabled,
        width: 24,
        height: 24,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ml: 1,
        transition: 'all 0.2s',
        '&:hover': {
           bgcolor: active ? activeColor : theme.palette.action.hover
        }
      }}
    >
      {children}
    </Box>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
    const theme = useTheme();
    let color = theme.palette.text.disabled;
    let icon = <FaMinus size={12} />;
    
    if (status === 'ok') {
        color = theme.palette.success.main;
        icon = <FaCheck size={12} />;
    } else if (status === 'fail') {
        color = theme.palette.error.main;
        icon = <FaTimes size={12} />;
    }

    return (
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
            {icon}
        </Box>
    );
};

export default TechnicalChecklist;
