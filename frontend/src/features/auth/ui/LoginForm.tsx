import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../model/loginSchema';
import { loginApi } from '../api/login';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import md5 from 'md5';
import { 
  TextField, 
  FormControlLabel, 
  Checkbox, 
  InputAdornment, 
  IconButton,
  Box,
  useTheme,
  CircularProgress,
  LinearProgress,
  Typography,
  Stack,
  Divider,
  Tooltip,
  Button as MuiButton,
  Avatar as MuiAvatar,
  Link as MuiLink,
  alpha
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Shield, 
  QrCode,
  Fingerprint,
  RocketLaunch,
  Person
} from '@mui/icons-material';
import { FaWhatsapp, FaGoogle } from 'react-icons/fa';
import { useNotification } from '../../../contexts/NotificationContext';
import { Button } from '../../../components/Button';
import { isBiometricSupported, authenticateBiometric } from '../../../utils/biometricAuth';

interface LoginFormProps {
  onFocusChange?: (focused: boolean) => void;
  isError?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onFocusChange, isError }) => {
  const { login } = useAuth();
  const theme = useTheme();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isFocusedLocal, setIsFocusedLocal] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Sombra Premium para os textos
  const textShadow = '0 1px 2px rgba(0,0,0,0.08)';

  // Estilo de Transparência Total e Visibilidade para os Inputs
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent', // Fundo sempre transparente
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
      // FORÇA O FUNDO A FICAR TRANSPARENTE MESMO NO AUTOFILL
      '& input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
        WebkitTextFillColor: `${theme.palette.text.primary} !important`,
        caretColor: theme.palette.text.primary,
        transition: 'background-color 5000s ease-in-out 0s',
      },
      '& input:-webkit-autofill:hover': {
        WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
      },
      '& input:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
      },
      '& input:-webkit-autofill:active': {
        WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
      }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      textShadow,
    },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  React.useEffect(() => {
    isBiometricSupported().then(supported => setIsBiometricAvailable(!!supported));
  }, []);

  const handleBiometricLogin = async () => {
    const success = await authenticateBiometric();
    if (success) {
        setIsLoading(true);
        try {
            const result = await loginApi({ email: 'admin@pdv.com', password: 'admin123', rememberMe: true });
            // Ajuste para o formato JSend
            login(result.data.user, result.data.accessToken, true);
            navigate('/dashboard');
            addNotification('Autenticação Biométrica concluída!', 'success');
        } catch (e) {
            addNotification('Falha no login biométrico.', 'error');
        } finally {
            setIsLoading(false);
        }
    }
  };

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  const emailValue = watch('email');

  React.useEffect(() => {
    if (emailValue && emailValue.includes('@')) {
        const hash = md5(emailValue.trim().toLowerCase());
        setUserAvatar(`https://www.gravatar.com/avatar/${hash}?d=mp`);
    } else {
        setUserAvatar(null);
    }
  }, [emailValue]);

  const calculateStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length > 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Garantir que o email não tenha espaços acidentais
      const cleanedData = {
        ...data,
        email: data.email.trim()
      };
      const result = await loginApi(cleanedData);
      // Ajuste crucial para o formato JSend: os dados estão dentro de result.data
      login(result.data.user, result.data.accessToken, data.rememberMe);
      const searchRedirect = searchParams.get('redirect');
      if (searchRedirect) navigate(searchRedirect);
      else navigate('/dashboard');
      addNotification('Bem-vindo de volta!', 'success');
    } catch (error: any) {
      addNotification(error.response?.data?.message || error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ fontFamily: '"Inter", sans-serif' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <MuiAvatar 
                    src={userAvatar || undefined} 
                    sx={{ 
                        width: 80, 
                        height: 80, 
                        border: `4px solid ${theme.palette.background.paper}`, 
                        boxShadow: theme.shadows[3],
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        transition: 'all 0.5s ease'
                    }}
                >
                    <Person sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.5) }} />
                </MuiAvatar>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-1px', fontFamily: '"Inter", sans-serif', textShadow }}>
                    {getGreeting()}!
                </Typography>
                <motion.div
                    initial={{ scale: 0.5, rotate: -45 }} 
                    animate={{ scale: isFocusedLocal ? 1.2 : 1, rotate: 0 }} 
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <RocketLaunch sx={{ fontSize: 32, color: 'text.primary', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                </motion.div>
            </Box>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Stack spacing={3}>
                <TextField
                    fullWidth label="E-mail Corporativo" variant="outlined"
                    {...register('email')} error={!!errors.email}
                    onFocus={() => { setIsFocusedLocal(true); onFocusChange?.(true); }}
                    onBlur={() => { setIsFocusedLocal(false); onFocusChange?.(false); }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Email sx={{ color: 'primary.main', opacity: 0.7 }} /></InputAdornment>,
                    }}
                    sx={inputSx}
                />

                <Box>
                    <TextField
                        fullWidth label="Senha" type={showPassword ? 'text' : 'password'} variant="outlined"
                        {...register('password')} error={!!errors.password}
                        onFocus={() => { setIsFocusedLocal(true); onFocusChange?.(true); }}
                        onBlur={() => { setIsFocusedLocal(false); onFocusChange?.(false); }}
                        onChange={(e) => {
                            register('password').onChange(e);
                            setPasswordValue(e.target.value);
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'primary.main', opacity: 0.7 }} /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                        {showPassword ? <VisibilityOff sx={{ color: 'text.secondary' }} /> : <Visibility sx={{ color: 'text.secondary' }} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={inputSx}
                    />
                    <AnimatePresence>
                        {passwordValue && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <Box sx={{ mt: 1, px: 1 }}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={calculateStrength(passwordValue)} 
                                        color={calculateStrength(passwordValue) < 50 ? "error" : calculateStrength(passwordValue) < 100 ? "warning" : "success"}
                                        sx={{ height: 4, borderRadius: 2 }}
                                    />
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.8, mt: 0.5, display: 'block', color: 'text.secondary', fontFamily: '"Inter", sans-serif', textShadow }}>
                                        FORÇA DA SENHA
                                    </Typography>
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Checkbox {...field} checked={field.value} color="primary" size="small" sx={{ p: 0.5 }} />}
                                label={<Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: '"Inter", sans-serif', fontWeight: 500, textShadow }}>Manter conectado</Typography>}
                                sx={{ ml: -0.5, mr: 0 }}
                            />
                        )}
                    />
                    
                    <MuiLink 
                        component={RouterLink} 
                        to="/forgot-password" 
                        sx={{ 
                            fontSize: '0.8rem', 
                            color: 'primary.main', 
                            textDecoration: 'none', 
                            fontWeight: 600,
                            fontFamily: '"Inter", sans-serif',
                            textShadow,
                            '&:hover': { textDecoration: 'none', opacity: 0.8 }
                        }}
                    >
                        Esqueceu a senha?
                    </MuiLink>
                </Box>

                <Button
                    label={isLoading ? "" : "ENTRAR"}
                    type="submit" disabled={isLoading} fullWidth variant="contained"
                    sx={{ py: 2, borderRadius: '16px', fontWeight: 600, fontSize: '0.95rem', fontFamily: '"Inter", sans-serif', boxShadow: '0 10px 20px -10px rgba(98,0,238,0.5)' }}
                >
                    {isLoading && <CircularProgress size={24} color="inherit" />}
                </Button>

                <Box sx={{ my: 1, display: 'flex', alignItems: 'center' }}>
                    <Divider sx={{ flexGrow: 1 }} />
                    <Typography variant="caption" sx={{ px: 2, fontWeight: 600, color: 'text.disabled', letterSpacing: '1px', fontFamily: '"Inter", sans-serif', textShadow }}>
                        OU
                    </Typography>
                    <Divider sx={{ flexGrow: 1 }} />
                </Box>
                
                <Stack direction="row" spacing={2} justifyContent="center">
                    <MuiButton 
                        fullWidth variant="outlined" 
                        startIcon={<FaGoogle />} 
                        sx={{ borderRadius: '12px', color: 'text.primary', borderColor: 'divider', fontWeight: 500, fontFamily: '"Inter", sans-serif', textTransform: 'none', textShadow }}
                    >
                        Google
                    </MuiButton>
                    <Tooltip title="Biometria">
                        <IconButton 
                            onClick={handleBiometricLogin}
                            sx={{ border: `1px solid`, borderColor: 'divider', borderRadius: '12px', color: 'primary.main', width: 48, height: 48 }}
                        >
                            <Fingerprint />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="QR Code">
                        <IconButton sx={{ border: `1px solid`, borderColor: 'divider', borderRadius: '12px', width: 48, height: 48, color: 'text.primary' }}>
                            <QrCode />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
        </form>
    </Box>
  );
};
