import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import './Header.scss';

import CommandBar from './CommandBar';
import NotificationCenter from './NotificationCenter';
import ProfileMenu from './ProfileMenu';
import ThemeToggle from './ThemeToggle';

import GlobalPeriodFilter from '../Common/GlobalPeriodFilter';

const Header = ({ onToggleSidebar, onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { breadcrumbTitle } = useBreadcrumb();
  const userName = "Usuário"; // Mock user name

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
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
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
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="logo-container">
          <button className="hamburger-btn desktop-toggle" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
            <i className='bx bx-menu'></i>
          </button>
          <button className="hamburger-btn mobile-toggle" onClick={onToggleMobileMenu} aria-label="Toggle Mobile Menu">
            <i className='bx bx-menu'></i>
          </button>
        </div>
        <div className="page-title-container">
          {breadcrumbTitle === 'Dashboard' ? (
             <div className="greeting-container">
               <h4 className="greeting-title">{getGreeting()}</h4>
               <p className="greeting-subtitle">Aqui está o resumo do seu negócio hoje.</p>
             </div>
          ) : (
            <h4 className="page-title">{breadcrumbTitle}</h4>
          )}
        </div>
      </div>

      <div className="topbar-center">
        {breadcrumbTitle === 'Dashboard' && <GlobalPeriodFilter />}
        <div
          className="search-input-container"
          onClick={() => setIsCommandBarOpen(true)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsCommandBarOpen(true);
            }
          }}
        >
          <i className="bx bx-search search-icon"></i>
          <input
            type="text"
            placeholder="Pesquisa global (Ctrl+K)"
            className="global-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="quick-action-btn" onClick={handleQuickActionClick} aria-label="Criar nova venda">
          <i className="bx bx-plus me-1"></i>
          <span>Nova Venda</span>
        </button>
        <ThemeToggle />
        <NotificationCenter />
        <ProfileMenu />
      </div>
      <CommandBar isOpen={isCommandBarOpen} toggle={toggleCommandBar} initialQuery={searchQuery} />
    </header>
  );
};

export default Header;
