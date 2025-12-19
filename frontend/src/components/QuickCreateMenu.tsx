import React, { useState, useRef, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TopbarBtn } from './Topbar.styled';

const MenuContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 140%;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.elevation2};
  width: 220px;
  z-index: 1200;
  overflow: hidden;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.onSurface};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
  }
`;

const iconAnimation = {
  whileHover: { scale: 1.2 },
  whileTap: { scale: 0.9 },
};

const QuickCreateMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <MenuContainer ref={menuRef}>
      <TopbarBtn onClick={toggleMenu} aria-label="Criar novo item">
        <motion.div {...iconAnimation}>
          <FaPlus />
        </motion.div>
      </TopbarBtn>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DropdownItem to="/products/new" onClick={() => setIsOpen(false)}>Novo Produto</DropdownItem>
            <DropdownItem to="/customers/new" onClick={() => setIsOpen(false)}>Novo Cliente</DropdownItem>
            <DropdownItem to="/pos" onClick={() => setIsOpen(false)}>Nova Venda</DropdownItem>
            <DropdownItem to="/purchase-orders/new" onClick={() => setIsOpen(false)}>Nova Ordem de Compra</DropdownItem>
          </DropdownMenu>
        )}
      </AnimatePresence>
    </MenuContainer>
  );
};

export default QuickCreateMenu;
