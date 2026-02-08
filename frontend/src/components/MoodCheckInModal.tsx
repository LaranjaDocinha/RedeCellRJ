import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  Typography, 
  Box, 
  IconButton, 
  TextField, 
  Button, 
  Stack, 
  useTheme, 
  alpha,
} from '@mui/material';
import { 
  SentimentVeryDissatisfied, 
  SentimentDissatisfied, 
  SentimentSatisfied, 
  SentimentSatisfiedAlt, 
  SentimentVerySatisfied,
  Close as CloseIcon,
  AutoAwesome
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const MoodCheckInModal: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const checkMoodStatus = async () => {
        try {
            const res = await api.get('/mood/status');
            if (!res.data.checkedIn) {
                setTimeout(() => setOpen(true), 2000);
            }
        } catch (e) {
            console.error('Mood status check failed', e);
        }
    };
    checkMoodStatus();
  }, []);

  const moods = [
    { level: 1, icon: <SentimentVeryDissatisfied />, label: 'Muito Mal', color: '#FF4D4F' },
    { level: 2, icon: <SentimentDissatisfied />, label: 'Mal', color: '#FFA940' },
    { level: 3, icon: <SentimentSatisfied />, label: 'Neutro', color: '#FFEC3D' },
    { level: 4, icon: <SentimentSatisfiedAlt />, label: 'Bem', color: '#73D13D' },
    { level: 5, icon: <SentimentVerySatisfied />, label: 'Excelente', color: '#36CFC9' },
  ];

  const handleSubmit = async () => {
    if (mood === null) return;
    try {
        await api.post('/mood/record', { moodLevel: mood, comment });
        setOpen(false);
    } catch (e) {
        console.error('Failed to record mood', e);
    }
  };

  return (
    <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="xs" 
        fullWidth 
        PaperProps={{ 
            sx: { 
                borderRadius: '32px', 
                overflow: 'hidden',
                bgcolor: 'background.paper',
                boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
            } 
        }}
    >
      <Box sx={{ position: 'relative', p: 4, textAlign: 'center' }}>
        <IconButton 
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', top: 16, right: 16, color: 'text.disabled' }}
        >
            <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ mb: 3 }}>
            <Box 
                sx={{ 
                    display: 'inline-flex', 
                    p: 1.5, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 2
                }}
            >
                <AutoAwesome />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 400, letterSpacing: '-0.5px' }}>
                Como vai o seu dia?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, px: 2 }}>
                Sua resposta é anônima e ajuda a melhorar o ambiente para todos.
            </Typography>
        </Box>

        <Stack spacing={2} sx={{ my: 4 }}>
            {moods.map((m) => {
                const isSelected = mood === m.level;
                return (
                    <Box
                        key={m.level}
                        component={motion.div}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMood(m.level)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: '20px',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: isSelected ? m.color : alpha(theme.palette.divider, 0.1),
                            bgcolor: isSelected ? alpha(m.color, 0.05) : 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                bgcolor: isSelected ? alpha(m.color, 0.08) : alpha(theme.palette.action.hover, 0.05)
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                display: 'flex',
                                p: 1,
                                borderRadius: '12px',
                                bgcolor: isSelected ? m.color : alpha(m.color, 0.1),
                                color: isSelected ? '#fff' : m.color,
                                transition: 'all 0.3s'
                            }}
                        >
                            {React.cloneElement(m.icon as React.ReactElement, { sx: { fontSize: 28 } })}
                        </Box>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                flexGrow: 1, 
                                textAlign: 'left',
                                fontWeight: isSelected ? 500 : 400,
                                color: isSelected ? m.color : 'text.primary'
                            }}
                        >
                            {m.label}
                        </Typography>
                        {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: m.color }} />
                            </motion.div>
                        )}
                    </Box>
                );
            })}
        </Stack>

        <AnimatePresence>
            {mood !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <TextField 
                        fullWidth 
                        multiline 
                        rows={2} 
                        placeholder="Algo que queira nos contar? (opcional)" 
                        variant="standard"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        InputProps={{
                            disableUnderline: true,
                            sx: { 
                                p: 2, 
                                borderRadius: '16px', 
                                bgcolor: theme.palette.action.hover,
                                fontSize: '0.9rem'
                            }
                        }}
                        sx={{ mt: 1, mb: 4 }}
                    />

                    <Button 
                        fullWidth 
                        variant="contained" 
                        size="large" 
                        onClick={handleSubmit}
                        sx={{ 
                            borderRadius: '16px', 
                            py: 2, 
                            fontWeight: 400,
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                        }}
                    >
                        Finalizar Check-in
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>

        {mood === null && (
            <Button 
                fullWidth 
                variant="text" 
                onClick={() => setOpen(false)}
                sx={{ color: 'text.disabled', fontWeight: 400, textTransform: 'none' }}
            >
                Responder depois
            </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default MoodCheckInModal;
