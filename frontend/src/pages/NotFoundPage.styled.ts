import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const StyledNotFoundContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onBackground};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const StyledNotFoundTitle = styled(motion.h1)`
  font-size: ${({ theme }) => theme.typography.displayLarge.fontSize};
  font-weight: ${({ theme }) => theme.typography.displayLarge.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const StyledNotFoundMessage = styled(motion.p)`
  font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
  color: ${({ theme }) => theme.colors.onBackground}80;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const StyledNotFoundLink = styled(Link)`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;
