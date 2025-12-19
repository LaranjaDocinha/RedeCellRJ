import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LoginScreenContainer, LoginCard, StyledLoginTitle, StyledLoginSubtitle } from '../components/LoginScreen.styled';
import Input from '../components/Input';
import { Button } from '../components/Button';
import Loading from '../components/Loading'; // Import Loading component
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

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
  title = 'Bem-vindo',
  subtitle = 'Faça login para continuar',
}) => {
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true); // Set loading to true on submit
    try {
      // 2. Include CSRF token in login request headers
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Login failed. Please try again.';
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Please contact support.';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      login(result.user, result.token, data.rememberMe);
      navigate('/');
      addToast('Login successful!', 'success');
    } catch (error: any) {
      console.error('Login failed', error);
      addToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false); // Set loading to false after request
    }
  };

  return (
    <LoginScreenContainer
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <LoginCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        whileHover={{ scale: 1.02, boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.3)" }}
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {subtitle}
        </motion.p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            aria-label="Email do usuário"
          />
          <Input
            label="Senha"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            aria-label="Senha do usuário"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}
          >
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="rememberMe">Lembrar-me</label>
          </motion.div>
          <Button
            label="Entrar"
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            aria-label="Entrar na conta"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ marginTop: '16px' }}
          >
            <Link to="/forgot-password" style={{ color: 'blue', textDecoration: 'none' }}>
              Esqueceu a senha?
            </Link>
          </motion.div>
        </form>
      </LoginCard>
    </LoginScreenContainer>
  );
};

export default LoginScreen;
