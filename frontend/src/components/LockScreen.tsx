// frontend/src/components/LockScreen.tsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useInactivityTracker } from '../contexts/InactivityTrackerContext';
import Input from './Input';
import { Button } from './Button';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const LockScreenOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  color: ${({ theme }) => theme.colors.text};
  
  /* Login Screen Background Style */
  background: linear-gradient(
    -45deg, 
    #ee7752, #e73c7e, #23a6d5, #23d5ab
  );
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
`;

const LockContent = styled(motion.div)`
  /* Login Card Style */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 3.5rem 2.2rem;
  border-radius: 28px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
  width: 90%;
`;

const LockTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  
  /* Gradient Text Style */
  background: linear-gradient(
    -45deg, 
    #ee7752, #e73c7e, #23a6d5, #23d5ab
  );
  background-size: 400% 400%;
  background-attachment: fixed;
  animation: ${gradientAnimation} 15s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LockMessage = styled.p`
  font-size: 1rem;
  color: #666;
  font-weight: 400;
`;

const LockForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LockScreen: React.FC = () => {
  const { user, login } = useAuth();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const { unlockApp } = useInactivityTracker();
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Attempt to re-authenticate
      await login(email, password);
      unlockApp();
      showNotification(t('unlocked_successfully'), 'success');
    } catch (error: any) {
      showNotification(t('unlock_failed', { message: error.message }), 'error');
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
