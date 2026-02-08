import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button as MuiButton, 
  CircularProgress, 
  Stack, 
  IconButton, 
  Tooltip, 
  useTheme, 
  alpha,
  Link as MuiLink,
  Divider
} from '@mui/material';
import { 
  Email, 
  ArrowBack, 
  LockReset, 
  SupportAgent, 
  CheckCircleOutline, 
  MarkEmailRead,
  Dns
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginScreenContainer, LoginCard } from '../components/LoginScreen.styled';
import { Button } from '../components/Button';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { ThemeToggle } from '../components/ThemeToggle';

// Schema de Validação
const forgotSchema = z.object({
  email: z.string().email('Insira um e-mail corporativo válido').nonempty('O e-mail é obrigatório'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema)
  });

  const emailValue = watch('email');

  // Timer de Cooldown
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Atalho ESC para voltar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/login');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    try {
      // Chamada real para o backend
      await api.post('/auth/request-password-reset', { email: data.email });
      
      setIsSuccess(true);
      setCooldown(60); // 60 segundos de espera para reenviar
      addNotification('Link de recuperação enviado com sucesso!', 'success');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao solicitar recuperação. Contate a TI.';
      addNotification(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = () => {
    const message = encodeURIComponent("Olá, suporte de TI! Estou com problemas para acessar o Redecell PDV.");
    window.open(`https://wa.me/5521993336523?text=${message}`, '_blank');
  };

  // Estilo Transparente dos Inputs (O mesmo do Login)
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      borderRadius: '14px',
      fontFamily: '"Inter", sans-serif',
      transition: 'border-color 0.3s ease',
      '& fieldset': {
        borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '& input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
        WebkitTextFillColor: `${theme.palette.text.primary} !important`,
        transition: 'background-color 5000s ease-in-out 0s',
      }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
  };

  return (
    <LoginScreenContainer>
      <ThemeToggle />
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header com Ícone Animado */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <Box 
              sx={{ 
                display: 'inline-flex', 
                p: 2, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mb: 2,
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              {isSuccess ? <MarkEmailRead sx={{ fontSize: 40 }} /> : <LockReset sx={{ fontSize: 40 }} />}
            </Box>
          </motion.div>
          
          <Typography variant="h5" fontWeight={600} sx={{ letterSpacing: '-0.5px', color: 'text.primary' }}>
            {isSuccess ? 'E-mail Enviado!' : 'Recuperar Acesso'}
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 1, maxWidth: '280px', mx: 'auto', color: 'text.secondary' }}>
            {isSuccess 
              ? `Verifique a caixa de entrada de ${emailValue} para redefinir sua senha.` 
              : 'Informe seu e-mail para receber as instruções de reset.'}
          </Typography>
        </Box>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form 
              key="form"
              onSubmit={handleSubmit(onSubmit)} 
              style={{ width: '100%' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="E-mail"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                  autoFocus
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email color="primary" sx={{ opacity: 0.7 }} /></InputAdornment>,
                  }}
                  sx={inputSx}
                />

                <Button
                  label={isLoading ? "" : "ENVIAR LINK MÁGICO"}
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                  variant="contained"
                  sx={{ 
                    py: 1.8, 
                    borderRadius: '14px', 
                    fontWeight: 600,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}` 
                  }}
                >
                  {isLoading && <CircularProgress size={24} color="inherit" />}
                </Button>
              </Stack>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ width: '100%', textAlign: 'center' }}
            >
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: '12px', mb: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} justifyContent="center" color="success.main">
                  <CheckCircleOutline fontSize="small" />
                  <Typography variant="caption" fontWeight={600}>Link válido por 30 minutos</Typography>
                </Stack>
              </Box>

              <Button
                label={cooldown > 0 ? `Reenviar em ${cooldown}s` : "REENVIAR E-MAIL"}
                onClick={handleSubmit(onSubmit)}
                disabled={cooldown > 0 || isLoading}
                variant="outlined"
                fullWidth
                sx={{ borderRadius: '14px', py: 1.5 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rodapé de Navegação */}
        <Box sx={{ mt: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <MuiLink 
            component={RouterLink} 
            to="/login" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              textDecoration: 'none', 
              color: 'text.secondary',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <ArrowBack fontSize="small" /> Voltar para o Login
          </MuiLink>

          <Divider sx={{ width: '50%', opacity: 0.5 }} />

          <Tooltip title="Falar com o TI no WhatsApp">
            <MuiButton 
              startIcon={<SupportAgent />} 
              size="small" 
              onClick={handleContactSupport}
              sx={{ 
                color: 'text.disabled', 
                textTransform: 'none',
                '&:hover': { color: 'primary.main', bgcolor: 'transparent' } 
              }}
            >
              Problemas técnicos? Contatar TI
            </MuiButton>
          </Tooltip>

          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', mt: 1 }}>
             <Dns style={{ fontSize: 10 }} /> IAM Service: Online
          </Typography>
        </Box>

      </LoginCard>
    </LoginScreenContainer>
  );
};

export default ForgotPasswordPage;