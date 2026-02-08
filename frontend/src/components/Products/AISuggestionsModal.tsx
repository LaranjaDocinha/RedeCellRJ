import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Paper,
  alpha,
  useTheme,
  IconButton,
  CircularProgress
} from '@mui/material';
import { FaRobot, FaTimes, FaLightbulb, FaShoppingCart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
  item: string;
  action: string;
  reason: string;
}

interface AISuggestionsModalProps {
  open: boolean;
  onClose: () => void;
  suggestions: Suggestion[];
  loading: boolean;
}

export const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({ open, onClose, suggestions, loading }) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
            <FaRobot color={theme.palette.primary.main} size={24} />
            <Typography variant="h6" fontWeight={400}>Sugestões do Consultor IA</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><FaTimes /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 0 }}>
        {loading ? (
            <Box textAlign="center" py={10}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary" mt={2}>Consultando padrões de consumo...</Typography>
            </Box>
        ) : (
            <Stack spacing={2}>
                <AnimatePresence>
                    {suggestions.map((s, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: i * 0.1 }}
                        >
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '16px', bgcolor: alpha(theme.palette.primary.main, 0.02), borderLeft: `6px solid ${theme.palette.primary.main}` }}>
                                <Typography variant="subtitle2" fontWeight={400} color="primary">{s.item}</Typography>
                                <Typography variant="h6" fontWeight={400} sx={{ my: 0.5 }}>{s.action}</Typography>
                                <Box display="flex" gap={1} mt={1}>
                                    <FaLightbulb color={theme.palette.warning.main} size={14} />
                                    <Typography variant="caption" color="text.secondary" lineHeight={1.4}>{s.reason}</Typography>
                                </Box>
                            </Paper>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 400 }}>Fechar</Button>
        <Button variant="contained" startIcon={<FaShoppingCart />} sx={{ borderRadius: '12px', px: 3, fontWeight: 400 }}>
            Gerar Ordens de Compra
        </Button>
      </DialogActions>
    </Dialog>
  );
};

