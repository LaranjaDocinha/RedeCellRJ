import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  LoginScreenContainer, 
  LoginCard, 
  StyledLoginTitle, 
  StyledLoginSubtitle 
} from '../components/LoginScreen.styled';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { 
  TextField, 
  FormControlLabel, 
  Checkbox, 
  InputAdornment, 
  IconButton,
  Box,
  useTheme 
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

interface LoginScreenProps {
  title?: string;
  subtitle?: string;
}

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres').required('Senha é obrigatória'),
  rememberMe: yup.boolean().optional(),
});

const LoginScreen: React.FC<LoginScreenProps> = ({
  title = 'RedeCellRJ',
  subtitle = 'Gestão Inteligente de PDV',
}) => {
  const { login } = useAuth();
  const theme = useTheme();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha na autenticação');
      }

      const result = await response.json();
      login(result.user, result.token, data.rememberMe);
      navigate('/');
      showNotification('Bem-vindo de volta!', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Erro ao entrar. Verifique suas credenciais.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginScreenContainer>
      <LoginCard
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <StyledLoginTitle>{title}</StyledLoginTitle>
        <StyledLoginSubtitle>{subtitle}</StyledLoginSubtitle>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="E-mail"
              variant="outlined"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                }
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                }
              }}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              px: 0.5 
            }}>
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} color="primary" size="small" />}
                    label={<Box component="span" sx={{ fontSize: '0.9rem', fontWeight: 500, color: theme.palette.text.secondary }}>Lembrar-me</Box>}
                  />
                )}
              />
              <Link to="/forgot-password" style={{ 
                fontSize: '0.85rem', 
                color: theme.palette.primary.main, 
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Esqueceu a senha?
              </Link>
            </Box>

            <Button
              label="Entrar"
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              size="large"
              primary
              style={{ 
                padding: '14px', 
                fontSize: '1.1rem', 
                borderRadius: '16px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)'
              }}
            />
          </Box>
        </form>
      </LoginCard>
    </LoginScreenContainer>
  );
};

export default LoginScreen;
