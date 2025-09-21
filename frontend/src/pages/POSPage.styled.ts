
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const POSContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  h1 {
    color: ${({ theme }) => theme.colors.onSurface};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

export const POSLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr; // Search/Products on left, Cart/Summary on right
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr; // Stack columns on smaller screens
  }
`;

export const POSSection = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  h2 {
    color: ${({ theme }) => theme.colors.onSurface};
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}22;
    padding-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

export const SearchInputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const CartSummary = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.onSurface}22;
  padding-top: ${({ theme }) => theme.spacing.md};
  margin-top: auto; // Push to bottom of POSSection
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  h3 {
    color: ${({ theme }) => theme.colors.onSurface};
    font-size: 1.5rem;
    margin: 0;
  }
`;

export const CheckoutButton = styled(motion.button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.onSurface}44;
    cursor: not-allowed;
  }
`;
