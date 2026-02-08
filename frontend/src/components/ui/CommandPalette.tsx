import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../styles/theme';
import './CommandPalette.css';
import { 
  FaSearch, 
  FaHome, 
  FaBox, 
  FaUserFriends, 
  FaCog, 
  FaShoppingCart,
  FaMoon,
  FaSun
} from 'react-icons/fa';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();

  // Toggle com Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen} 
      label="Global Command Menu"
      className={theme === 'dark' ? 'dark' : ''}
    >
      <div className="command-wrapper">
        <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <FaSearch />
        </div>
        <Command.Input placeholder="O que você precisa?" />
        
        <Command.List>
          <Command.Empty>Nenhum resultado encontrado.</Command.Empty>

          <Command.Group heading="Ações Rápidas">
            <Command.Item onSelect={() => runCommand(() => navigate('/pos'))}>
              <FaShoppingCart />
              <span>Novo Pedido (PDV)</span>
              <Command.Shortcut>P</Command.Shortcut>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => toggleTheme())}>
              {theme === 'light' ? <FaMoon /> : <FaSun />}
              <span>Alternar Tema</span>
              <Command.Shortcut>T</Command.Shortcut>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Navegação">
            <Command.Item onSelect={() => runCommand(() => navigate('/dashboard'))}>
              <FaHome />
              <span>Dashboard</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/products'))}>
              <FaBox />
              <span>Produtos</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/customers'))}>
              <FaUserFriends />
              <span>Clientes</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/settings'))}>
              <FaCog />
              <span>Configurações</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
