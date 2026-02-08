import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const LoginScreenContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(
    -45deg, 
    #ee7752, #e73c7e, #23a6d5, #23d5ab
  );
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  padding: 0;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
`;

export const LoginCard = styled(motion.div)`
  background: ${({ theme }) => theme.themeName === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 3.5rem 2.2rem;
  border-radius: 28px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.themeName === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 380px;
  z-index: 1;
  transition: background 0.5s ease, border 0.5s ease, box-shadow 0.5s ease;

  @media (max-width: 480px) {
    padding: 2.5rem 1.8rem;
    max-width: 90%;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

export const StyledLoginTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 400;
  background: linear-gradient(
    -45deg, 
    #ee7752, #e73c7e, #23a6d5, #23d5ab
  );
  background-size: 400% 400%;
  background-attachment: fixed;
  animation: ${gradientAnimation} 15s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
`;

export const StyledLoginSubtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.themeName === 'dark' ? '#aaa' : '#666'};
  margin-bottom: 2rem;
  font-weight: 400;
`;
