import styled from 'styled-components';
import { motion } from 'framer-motion';

export const POSContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const POSLayout = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr; // Search section wider than cart
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const POSSection = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  h2 {
    font-size: ${({ theme }) => theme.typography.titleLarge.fontSize};
    color: ${({ theme }) => theme.colors.onSurface};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}11;
    padding-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

export const SearchInputWrapper = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const CartSummary = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};

  h3 {
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
    color: ${({ theme }) => theme.colors.onSurface};
    text-align: right;
  }
`;

export const CheckoutButton = styled(motion.button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const StyledStatusIndicator = styled(motion.div)<{ isOnline: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme, isOnline }) => (isOnline ? theme.colors.success : theme.colors.error)};

  svg {
    font-size: ${({ theme }) => theme.typography.bodyLarge.fontSize};
  }
`;

export const StyledPendingSales = styled(motion.span)`
  color: ${({ theme }) => theme.colors.warning};
  font-weight: bold;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;