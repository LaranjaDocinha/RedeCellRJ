import styled from 'styled-components';
import { motion } from 'framer-motion';

export const POSContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px); // Adjust based on your layout's header/footer height
  padding: 1.5rem;
  gap: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const POSHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ThemeToggleButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }
`;

export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const POSLayout = styled.div<{isZenMode: boolean}>`
  display: grid;
  grid-template-columns: ${({isZenMode}) => isZenMode ? '1fr 0.5fr' : '55fr 45fr'}; // Adjust as needed for Zen Mode
  gap: 1.5rem;
  height: 100%;
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
`;

// Product Section
export const ProductSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;

  @media (max-width: 1024px) {
    height: auto;
    max-height: 70vh;
  }
`;

export const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 0.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

export const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  & > div { // Target Input wrapper
    flex-grow: 1;
  }
`;

export const ProductGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
  flex-grow: 1;
`;

// Cart Section
export const CartSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;

  @media (max-width: 1024px) {
    height: auto;
  }
`;

export const CartHeader = styled.h2`
  display: flex;
  align-items: center;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin: 0;
`;

export const CartItemsList = styled(motion.div)`
  overflow-y: auto;
  flex-grow: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CartSummary = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CouponWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: stretch; // Make items stretch to the same height

  & > div { // Target the Input's wrapper
    flex-grow: 1;
  }
`;

export const TotalLine = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

export const CheckoutButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    transform: none;
  }
`;

export const EmptyCart = styled(motion.div)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
    
    svg {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
`;

export const StyledPaymentSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  select {
    padding: 0.75rem;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
    width: 100%;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
    }
  }
`;
