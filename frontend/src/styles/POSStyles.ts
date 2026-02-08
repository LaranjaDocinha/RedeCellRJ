import styled from 'styled-components';
import { motion } from 'framer-motion';
import { styled as muiStyled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const POSContainer = muiStyled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
  padding: '0.75rem',
  boxSizing: 'border-box',
}));

export const POSLayout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  gap: 0.75rem;
  overflow: hidden;
`;

// Lado Esquerdo: Busca (25%)
export const MainSection = styled.div`
  width: 25%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  gap: 1rem;
  box-sizing: border-box;
  overflow: hidden;
`;

// Lado Direito: Carrinho (75%)
export const CartSidebar = styled.aside`
  width: 75%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  box-shadow: 0 10px 40px rgba(0,0,0,0.04);
  overflow: hidden;
  box-sizing: border-box;
`;

// Toolbar Operacional
export const OperationToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

// Search Results
export const CompactSearchResult = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.palette.primary.main};
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

// Cart UI
export const CartHeader = styled.div`
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  flex-shrink: 0;
  
  h2 {
    font-size: 1.15rem;
    font-weight: 400;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

export const CartItemList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : '#fafafa'};

  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.palette.divider}; border-radius: 10px; }
`;

export const CartFooter = styled.div`
  padding: 1rem 1.5rem;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-top: 2px solid ${({ theme }) => theme.palette.divider};
  flex-shrink: 0;
`;

export const SummaryLine = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ $total }) => $total ? '0.75rem' : '0.25rem'};
  
  span:first-child {
    font-size: ${({ $total }) => $total ? '0.9rem' : '0.8rem'};
    font-weight: 400;
    color: ${({ theme, $total }) => $total ? theme.palette.text.primary : theme.palette.text.secondary};
    text-transform: uppercase;
  }

  span:last-child {
    font-size: ${({ $total }) => $total ? '2.25rem' : '1rem'};
    font-weight: 400;
    color: ${({ theme, $total }) => $total ? theme.palette.primary.main : theme.palette.text.primary};
    letter-spacing: -1px;
  }
`;

export const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  color: ${({ theme }) => theme.palette.text.disabled};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

export const HardwareStatus = styled.div<{ $online: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $online, theme }) => $online ? theme.palette.success.main : theme.palette.error.main};
  box-shadow: 0 0 8px ${({ $online, theme }) => $online ? theme.palette.success.main : theme.palette.error.main}80;
`;

export const BirthdayAlert = styled(motion.div)`
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(255, 154, 158, 0.4);
`;

export const ActionButton = muiStyled(motion.button)<{ $variant?: 'primary' | 'secondary' | 'danger' | 'outline' }>(
  ({ theme, $variant }) => ({
    width: '100%',
    padding: '1rem',
    borderRadius: '14px',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: 400,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: '0.2s',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    backgroundColor: $variant === 'primary' ? theme.palette.primary.main :
                     $variant === 'secondary' ? theme.palette.secondary.main :
                     $variant === 'danger' ? theme.palette.error.main : 'transparent',
    color: $variant === 'outline' ? 'inherit' : 'white',
    borderStyle: $variant === 'outline' ? 'solid' : 'none',
    borderWidth: $variant === 'outline' ? '1px' : '0',
    borderColor: $variant === 'outline' ? theme.palette.divider : 'transparent',
    '&:hover': {
      filter: 'brightness(1.1)',
      transform: 'translateY(-2px)',
    },
    '&:active': { transform: 'translateY(0)' },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    }
  })
);

export const QuickPickSection = styled.div`
  margin-top: 1rem;
`;

