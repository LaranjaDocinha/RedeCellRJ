import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LoginScreenContainer, 
  LoginCard, 
} from '../components/LoginScreen.styled';
import { 
  Box,
  useTheme,
  Chip,
  Stack,
  Link,
  Typography,
  Tooltip,
  Fab
} from '@mui/material';
import { 
  Language,
  Shield,
  Fingerprint,
  SupportAgent as SupportIcon,
  RocketLaunch,
  WifiOff,
  CheckCircle
} from '@mui/icons-material';
import { FaWhatsapp } from 'react-icons/fa';
import { isBiometricSupported, authenticateBiometric } from '../utils/biometricAuth';
import { LoginForm } from '../features/auth/ui/LoginForm';
import { Button as MuiButton } from '@mui/material';
import { ThemeToggle } from '../components/ThemeToggle';

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFocused, setIsFocused] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    isBiometricSupported().then(supported => setIsBiometricAvailable(!!supported));
  }, []);
  const [isError, setIsError] = useState(false); // Can be triggered by form failure if needed

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
        window.removeEventListener('online', handleStatus);
        window.removeEventListener('offline', handleStatus);
    };
  }, []);

  return (
    <LoginScreenContainer>
      <ThemeToggle />
      {/* Botão de Ajuda Direta */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Tooltip title="Suporte Técnico">
              <Fab color="primary" size="small">
                  <SupportIcon />
              </Fab>
          </Tooltip>
      </Box>

      {/* Aviso Offline */}
      <AnimatePresence>
          {!isOnline && (
              <motion.div initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }} style={{ position: 'fixed', top: 20, zIndex: 2000 }}>
                  <Chip icon={<WifiOff />} label="MODO OFFLINE ATIVADO" color="error" sx={{ fontWeight: 400 }} />
              </motion.div>
          )}
      </AnimatePresence>

      <motion.div
        animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <LoginCard elevation={0}>
          <LoginForm onFocusChange={setIsFocused} isError={isError} />

          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main', justifyContent: 'center', fontWeight: 400, mb: 1.5 }}>
                <CheckCircle sx={{ fontSize: 12 }} /> SERVIDOR OPERACIONAL (V2.4.0)
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, justifyContent: 'center', color: 'text.secondary', opacity: 0.7, mb: 2.5 }}>
                <Shield sx={{ fontSize: 14 }} /> Ambiente Seguro com Criptografia de Ponta a Ponta
            </Typography>
            <MuiButton 
                startIcon={<FaWhatsapp />} 
                size="small"
                sx={{ 
                    fontSize: '0.8rem', 
                    color: '#25D366', 
                    fontWeight: 600, 
                    textTransform: 'none', 
                    p: 0, 
                    minWidth: 'auto', 
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } 
                }}
            >
                Ajuda via WhatsApp
            </MuiButton>
          </Box>
        </LoginCard>
      </motion.div>
    </LoginScreenContainer>
  );
};

export default LoginScreen;