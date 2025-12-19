// frontend/src/components/LockScreen.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useInactivityTracker } from '../contexts/InactivityTrackerContext';
import Input from './Input';
import { Button } from './Button';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

const LockScreenOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  color: ${({ theme }) => theme.colors.text};
`;

const LockContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.elevation2};
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
  width: 90%;
`;

const LockTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const LockMessage = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LockForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LockScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // Assuming email is also needed for unlock
  const { login } = useAuth();
  const { unlockApp } = useInactivityTracker();
  const { addToast } = useNotification();
  const { t } = useTranslation();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Attempt to re-authenticate
      await login(email, password);
      unlockApp();
      addToast(t('unlocked_successfully'), 'success');
    } catch (error: any) {
      addToast(t('unlock_failed', { message: error.message }), 'error');
    }
  };

  return (
    <LockScreenOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LockContent
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <LockTitle>{t('app_locked_title')}</LockTitle>
        <LockMessage>{t('app_locked_message')}</LockMessage>
        <LockForm onSubmit={handleUnlock}>
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button label={t('unlock')} type="submit" />
        </LockForm>
      </LockContent>
    </LockScreenOverlay>
  );
};

export default LockScreen;
