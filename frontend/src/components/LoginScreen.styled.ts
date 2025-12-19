import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const LoginScreenContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primaryLight} 0%,
    ${({ theme }) => theme.colors.primaryDark} 100%
  );
  background-size: 200% 200%;
  animation: ${gradientAnimation} 15s ease infinite;
  padding: ${({ theme }) => theme.spacing.md};
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
    z-index: 0;
  }
`;

export const LoginCard = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 20px;
  box-shadow: 0px 8px 32px 0 rgba(31, 38, 135, 0.37);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobileL}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

export const StyledLoginTitle = styled(motion.h1)`
  font-size: ${({ theme }) => theme.typography.headlineLarge.fontSize};
  font-weight: ${({ theme }) => theme.typography.headlineLarge.fontWeight};
  color: ${({ theme }) => theme.colors.onSurface};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const StyledLoginSubtitle = styled(motion.p)`
  font-size: ${({ theme }) => theme.typography.bodyLarge.fontSize};
  color: ${({ theme }) => theme.colors.onSurface}80;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const LoginFormPlaceholder = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.onSurface}4D; // 30% opacity
  padding: 20px;
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.onSurface}99; // 60% opacity
`;
