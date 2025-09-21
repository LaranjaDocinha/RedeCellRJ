import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoginScreenContainer, LoginCard, LoginFormPlaceholder } from './LoginScreen.styled';
import Input from './Input'; // Assuming Input component is now default export
import { Button } from './Button'; // Assuming Button component is now named export
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import useHapticFeedback from '../hooks/useHapticFeedback'; // Import useHapticFeedback

interface LoginScreenProps {
  title?: string;
  subtitle?: string;
}

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres').required('Senha é obrigatória'),
});

export const LoginScreen: React.FC<LoginScreenProps> = ({
  title = 'Bem-vindo',
  subtitle = 'Faça login para continuar',
}) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      // TODO: Show error message to user
    }
  };

  return (
    <LoginScreenContainer
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <LoginCard>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {t('welcome')} {/* Translate title */}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {t('login_prompt')} {/* Translate subtitle */}
        </motion.p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label={t('email')} {/* Translate email label */}
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label={t('password')} {/* Translate password label */}
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Button label={t('enter')} type="submit" /> {/* Translate button label */}
        </form>
      </LoginCard>
    </LoginScreenContainer>
  );
};
