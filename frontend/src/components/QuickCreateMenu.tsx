import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FaPlus, 
  FaBoxOpen, 
  FaUserPlus, 
  FaShoppingCart, 
  FaFileInvoiceDollar, 
  FaTools,
  FaTimes
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TopbarBtn } from './Topbar.styled';
import { useTheme, Box, Typography, TextField, InputAdornment } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSound } from '../contexts/SoundContext';
import { FaSearch } from 'react-icons/fa';

const meshGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const MenuContainer = styled.div`
  position: relative;
`;

const StyledTopbarBtn = styled(TopbarBtn)<{ $isOpen: boolean }>`
  position: relative;
  z-index: 1301;
  background: ${({ theme, $isOpen }) => $isOpen 
    ? theme.palette.primary.main 
    : 'transparent'};
  color: ${({ theme, $isOpen }) => $isOpen ? 'white' : 'inherit'};
  
  ${({ $isOpen }) => !$isOpen && css`
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 12px;
      padding: 2px;
      background: linear-gradient(45deg, #2196f3, #f44336, #4caf50, #2196f3);
      background-size: 300% 300%;
      animation: ${meshGradient} 4s ease infinite;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0.5;
    }
  `}
`;

const FloatingMenu = styled(motion.div)`
  position: absolute;
  top: 60px;
  right: -10px;
  width: 300px;
  background: ${({ theme }) => theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 30, 0.85)' 
    : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => alpha(theme.palette.divider, 0.1)};
  border-radius: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 1300;
  padding: 16px;
`;

const SearchField = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 14px;
    background: ${({ theme }) => alpha(theme.palette.action.hover, 0.5)};
    font-size: 0.8rem;
    margin-bottom: 12px;
  }
`;

const ActionItem = styled(motion.div)<{ $color: string }>`
  display: flex;
  align-items: center;
  padding: 10px 14px;
  gap: 14px;
  border-radius: 18px;
  cursor: pointer;
  margin-bottom: 4px;
  border: 1px solid transparent;

  &:hover {
    background: ${({ $color }) => alpha($color, 0.08)};
    border-color: ${({ $color }) => alpha($color, 0.2)};
    transform: scale(1.02);
  }

  .icon-wrapper {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $color }) => alpha($color, 0.12)};
    color: ${({ $color }) => $color};
    box-shadow: 0 4px 12px ${({ $color }) => alpha($color, 0.2)};
  }

  .text-content {
    flex: 1;
    .title {
      font-size: 0.85rem;
      font-weight: 400;
      display: block;
    }
    .description {
      font-size: 0.7rem;
      opacity: 0.7;
    }
  }

  .shortcut {
    font-size: 0.6rem;
    font-weight: 400;
    padding: 3px 6px;
    border-radius: 6px;
    background: ${({ theme }) => theme.palette.action.selected};
    opacity: 0.5;
  }
`;

const QuickCreateMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { playSound } = useSound();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const actions = useMemo(() => [
    {
      id: 'sale',
      title: 'Nova Venda',
      description: 'PDV Rápido',
      icon: <FaShoppingCart />,
      path: '/pos',
      color: '#4caf50',
      shortcut: '⌥V'
    },
    {
      id: 'product',
      title: 'Novo Produto',
      description: 'Gestão de Inventário',
      icon: <FaBoxOpen />,
      path: '/products/new',
      color: '#2196f3',
      shortcut: '⌥P'
    },
    {
      id: 'customer',
      title: 'Novo Cliente',
      description: 'Fidelização CRM',
      icon: <FaUserPlus />,
      path: '/customers/new',
      color: '#00bcd4',
      shortcut: '⌥C'
    },
    {
      id: 'order',
      title: 'Nova O.S.',
      description: 'Assistência Técnica',
      icon: <FaTools />,
      path: '/orders/new',
      color: '#ff9800',
      shortcut: '⌥O'
    },
    {
      id: 'purchase',
      title: 'Compra',
      description: 'Entrada de Estoque',
      icon: <FaFileInvoiceDollar />,
      path: '/purchase-orders/new',
      color: '#9c27b0',
      shortcut: '⌥K'
    }
  ], []);

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = () => {
    if (!isOpen) playSound('buttonClick');
    setIsOpen(!isOpen);
    setSearch('');
  };

  return (
    <MenuContainer ref={menuRef}>
      <StyledTopbarBtn 
        $isOpen={isOpen}
        onClick={handleToggle} 
        aria-label="Ações Rápidas"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {isOpen ? <FaTimes /> : <FaPlus />}
        </motion.div>
      </StyledTopbarBtn>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 1250, background: 'rgba(0,0,0,0.05)' }}
            />
            <FloatingMenu
              initial={{ opacity: 0, y: -20, scale: 0.9, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, rotateX: -15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <SearchField 
                fullWidth size="small" placeholder="O que deseja fazer?" 
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><FaSearch size={12} /></InputAdornment>
                }}
              />
              
              {filteredActions.map((action, idx) => (
                <ActionItem
                  key={action.id}
                  $color={action.color}
                  onClick={() => {
                    playSound('buttonClick');
                    navigate(action.path);
                    setIsOpen(false);
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <div className="icon-wrapper">{action.icon}</div>
                  <div className="text-content">
                    <span className="title">{action.title}</span>
                    <span className="description">{action.description}</span>
                  </div>
                  <div className="shortcut">{action.shortcut}</div>
                </ActionItem>
              ))}
            </FloatingMenu>
          </>
        )}
      </AnimatePresence>
    </MenuContainer>
  );
};

export default QuickCreateMenu;
