import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
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
  width: 300px;
  z-index: 1200;
  overflow: hidden;
`;

const DropdownHeader = styled.div`
  padding: 12px 16px;
  font-weight: 600;
  border-bottom: 1px solid ${({ theme }) => theme.colors.outlineVariant};
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
`;

const iconAnimation = {
  whileHover: { scale: 1.2 },
  whileTap: { scale: 0.9 },
};

const NotificationsDropdown: React.FC = () => {
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
      <TopbarBtn onClick={toggleMenu} aria-label="Ver notificações">
        <motion.div {...iconAnimation}>
          <FaBell />
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
            <DropdownHeader>Notificações</DropdownHeader>
            <DropdownItem>Bem-vindo ao sistema!</DropdownItem>
            <DropdownItem>Seu relatório semanal está pronto.</DropdownItem>
            <DropdownItem>Produto "iPhone 15" está com estoque baixo.</DropdownItem>
          </DropdownMenu>
        )}
      </AnimatePresence>
    </MenuContainer>
  );
};

export default NotificationsDropdown;
