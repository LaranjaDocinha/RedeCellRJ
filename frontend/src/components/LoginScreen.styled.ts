
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const LoginScreenContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryLight} 100%);
  padding: 20px;
  box-sizing: border-box;
`;

export const LoginCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  h1 {
    color: ${({ theme }) => theme.colors.onSurface};
    margin-bottom: 10px;
    font-size: 2em;
  }

  p {
    color: ${({ theme }) => theme.colors.onSurface}B3; // 70% opacity
    margin-bottom: 30px;
    font-size: 1.1em;
  }
`;

export const LoginFormPlaceholder = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.onSurface}4D; // 30% opacity
  padding: 20px;
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.onSurface}99; // 60% opacity
`;
