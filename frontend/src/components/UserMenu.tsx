import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const MenuContainer = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 50px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
  }
`;

const Avatar = styled(FaUserCircle)`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.primary};
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.elevation2};
  width: 200px;
  z-index: 1200;
  overflow: hidden;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.onSurface};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  color: ${({ theme }) => theme.colors.error};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.errorContainer};
  }
`;

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
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
      <MenuButton onClick={toggleMenu}>
        <Avatar />
        <span style={{ fontWeight: 500 }}>{user?.name || 'Usuário'}</span>
        <FaChevronDown size={14} />
      </MenuButton>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DropdownItem to="/profile" onClick={() => setIsOpen(false)}>
              <FaUserCircle />
              Meu Perfil
            </DropdownItem>
            <DropdownItem to="/settings" onClick={() => setIsOpen(false)}>
              <FaCog />
              Configurações
            </DropdownItem>
            <LogoutButton onClick={logout}>
              <FaSignOutAlt />
              Sair
            </LogoutButton>
          </DropdownMenu>
        )}
      </AnimatePresence>
    </MenuContainer>
  );
};

export default UserMenu;
