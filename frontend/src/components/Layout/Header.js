import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useBreadcrumb } from '../../context/BreadcrumbContext';
import './Header.scss';

import GlobalPeriodFilter from '../Common/GlobalPeriodFilter';

import CommandBar from './CommandBar';
import NotificationCenter from './NotificationCenter';
import ProfileMenu from './ProfileMenu';
import ThemeToggle from './ThemeToggle';

const Header = ({ onToggleSidebar, onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { breadcrumbTitle } = useBreadcrumb();
  const userName = 'Usuário'; // Mock user name

  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCommandBar = () => {
    setIsCommandBarOpen(!isCommandBarOpen);
    if (!isCommandBarOpen) {
      setSearchQuery(''); // Limpa a pesquisa ao abrir
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandBar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandBarOpen]);

  const handleQuickActionClick = (e) => {
    // Ripple effect logic
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }
    button.appendChild(circle);

    // Navigate after a short delay to allow ripple to be seen
    setTimeout(() => {
      navigate('/pdv');
    }, 300);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Bom dia, ${userName}!`;
    if (hour < 18) return `Boa tarde, ${userName}!`;
    return `Boa noite, ${userName}!`;
  };

  return (
    <header className='topbar'>
      <div className='topbar-left'>
        <div className='logo-container'>
          <button
            aria-label='Toggle Sidebar'
            className='hamburger-btn desktop-toggle'
            onClick={onToggleSidebar}
          >
            <i className='bx bx-menu'></i>
          </button>
          <button
            aria-label='Toggle Mobile Menu'
            className='hamburger-btn mobile-toggle'
            onClick={onToggleMobileMenu}
          >
            <i className='bx bx-menu'></i>
          </button>
        </div>
        <div className='page-title-container'>
          {breadcrumbTitle === 'Dashboard' ? (
            <div className='greeting-container'>
              <h4 className='greeting-title'>{getGreeting()}</h4>
              <p className='greeting-subtitle'>Aqui está o resumo do seu negócio hoje.</p>
            </div>
          ) : (
            <h4 className='page-title'>{breadcrumbTitle}</h4>
          )}
        </div>
      </div>

      <div className='topbar-center'>
        {breadcrumbTitle === 'Dashboard' && <GlobalPeriodFilter />}
        <div
          className='search-input-container'
          role='button'
          tabIndex={0}
          onClick={() => setIsCommandBarOpen(true)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsCommandBarOpen(true);
            }
          }}
        >
          <i className='bx bx-search search-icon'></i>
          <input
            className='global-search-input'
            placeholder='Pesquisa global (Ctrl+K)'
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className='topbar-right'>
        <button
          aria-label='Criar nova venda'
          className='quick-action-btn'
          onClick={handleQuickActionClick}
        >
          <i className='bx bx-plus me-1'></i>
          <span>Nova Venda</span>
        </button>
        <ThemeToggle />
        <NotificationCenter />
        <ProfileMenu />
      </div>
      <CommandBar initialQuery={searchQuery} isOpen={isCommandBarOpen} toggle={toggleCommandBar} />
    </header>
  );
};

export default Header;
