import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Collapse, Tooltip } from 'reactstrap';
import { motion } from 'framer-motion';

import { useAuthStore } from '../../store/authStore'; // Importa o store do Zustand
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.scss';

// Definição base dos itens de menu
const allMenuItems = [
  { path: '/dashboard', icon: 'bxs-dashboard', title: 'Dashboard' },
  { path: '/admin-dashboard', icon: 'bxs-dashboard', title: 'Admin Dashboard' }, // Novo item de menu
  { path: '/pdv', icon: 'bx-cart-alt', title: 'PDV' },
  { type: 'separator', title: 'Operacional' },
  {
    title: 'Caixa',
    icon: 'bx-slider-alt',
    children: [{ path: '/cashier', icon: 'bx-wallet', title: 'Abrir/Fechar Caixa' }],
  },
  { type: 'separator', title: 'Cadastros' },
  {
    title: 'Gerenciamento',
    icon: 'bxs-edit',
    children: [
      { path: '/products', icon: 'bxs-package', title: 'Produtos' },
      { path: '/customers', icon: 'bxs-user-detail', title: 'Clientes' },
      { path: '/suppliers', icon: 'bxs-truck', title: 'Fornecedores' },
      { path: '/technicians', icon: 'bxs-user-plus', title: 'Técnicos' },
      { path: '/purchase-orders', icon: 'bx-notepad', title: 'Ordens de Compra', roles: ['admin'] }, // Protegido
      { path: '/users', icon: 'bxs-user-account', title: 'Usuários', roles: ['admin'] }, // Protegido
    ],
  },
  { type: 'separator', title: 'Serviços e Vendas' },
  { path: '/repairs', icon: 'bxs-wrench', title: 'Reparos' },
  { path: '/sales-history', icon: 'bx-history', title: 'Histórico de Vendas' },
  { path: '/returns', icon: 'bx-revision', title: 'Devoluções' },
  { path: '/stock', icon: 'bxs-store-alt', title: 'Gerenciar Estoque' },
  { type: 'separator', title: 'Financeiro e Relatórios' },
  {
    title: 'Financeiro',
    icon: 'bx-money-withdraw',
    roles: ['admin'], // Protegido
    children: [
      { path: '/api/finance/receivables', title: 'Contas a Receber' },
      { path: '/finance/payables', title: 'Contas a Pagar' },
    ],
  },
  { path: '/reports', icon: 'bx-chart', title: 'Relatórios' },
  { type: 'separator', title: 'Configurações' },
  { path: '/settings', icon: 'bx-cog', title: 'Configurações' },
];

// Componente recursivo para filtrar itens de menu com base nas permissões
const filterMenuByRole = (menuItems, hasRole) => {
  return menuItems.reduce((acc, item) => {
    // Se o item não tem roles definidas, ele é público
    const isAllowed = !item.roles || hasRole(item.roles);

    if (isAllowed) {
      // Se o item tem filhos, filtra os filhos também
      if (item.children) {
        const filteredChildren = filterMenuByRole(item.children, hasRole);
        // Só adiciona o item pai se ele tiver filhos visíveis
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      } else {
        acc.push(item);
      }
    }
    return acc;
  }, []);
};

const SidebarItem = ({ item, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const location = useLocation();

  const hasChildren = item.children && item.children.length > 0;

  useEffect(() => {
    if (hasChildren) {
      const isActive = item.children.some((child) => location.pathname.startsWith(child.path));
      setIsOpen(isActive);
    }
  }, [location, hasChildren, item.children]);

  const toggle = () => setIsOpen(!isOpen);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const linkId = `sidebar-link-${item.title.replace(/\s+/g, '-')}`;

  if (hasChildren) {
    return (
      <li className={isOpen ? 'menu-item open' : 'menu-item'}>
        <button className='nav-link' id={linkId} onClick={toggle}>
          {item.icon && <i className={`bx ${item.icon}`}></i>}
          {!isCollapsed && <span>{item.title}</span>}
          {!isCollapsed && <i className='bx bx-chevron-down arrow'></i>}
        </button>
        {isCollapsed && (
          <Tooltip
            isOpen={tooltipOpen}
            placement='right'
            target={linkId}
            toggle={toggleTooltip}
            transition={{ timeout: 300 }}
          >
            {item.title}
          </Tooltip>
        )}
        <Collapse isOpen={isOpen}>
          <ul className='list-unstyled submenu'>
            {item.children.map((child, index) => (
              <li key={index}>
                <NavLink className='nav-link' to={child.path}>
                  {child.icon && <i className={`bx ${child.icon}`}></i>}
                  <span>{child.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </Collapse>
      </li>
    );
  }

  return (
    <li className='menu-item'>
      <NavLink className='nav-link' id={linkId} to={item.path}>
        {item.icon && <i className={`bx ${item.icon}`}></i>}
        {!isCollapsed && <span>{item.title}</span>}
      </NavLink>
      {isCollapsed && (
        <Tooltip
          isOpen={tooltipOpen}
          placement='right'
          target={linkId}
          toggle={toggleTooltip}
          transition={{ timeout: 300 }}
        >
          {item.title}
        </Tooltip>
      )}
    </li>
  );
};

const Sidebar = ({ isCollapsed, isMobileOpen }) => {
  const { hasRole, isAuthLoading } = useAuthStore();
  const { theme } = useTheme();

  const logoSrc = theme === 'dark' ? '/Dark-mode-logo.png' : '/redecellrj.png';

  // Filtra os itens de menu com base na permissão do usuário.
  // useMemo garante que o filtro não seja re-executado a cada renderização.
  const menuItems = useMemo(() => {
    if (isAuthLoading) return []; // Retorna vazio enquanto a autenticação carrega
    return filterMenuByRole(allMenuItems, hasRole);
  }, [isAuthLoading, hasRole]);

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
    >
      <div className='sidebar-header'>
        <motion.div animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}>
          {!isCollapsed && <img alt='PDV Web Logo' className='sidebar-logo' src={logoSrc} />}
        </motion.div>
      </div>
      <nav className='sidebar-nav'>
        <ul className='list-unstyled'>
          {menuItems.map((item, index) =>
            item.type === 'separator' ? (
              <li key={index} className='sidebar-separator' />
            ) : (
              <SidebarItem key={index} isCollapsed={isCollapsed} item={item} />
            ),
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
