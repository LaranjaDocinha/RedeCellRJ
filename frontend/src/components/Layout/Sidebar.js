import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Collapse, Tooltip } from 'reactstrap';
import { motion } from 'framer-motion';

import { useAuthStore } from '../../store/authStore'; // Importa o store do Zustand
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.scss';

// Definição base dos itens de menu
const allMenuItems = [
  { path: '/painel-administrativo', icon: 'bxs-dashboard', title: 'Painel Administrativo' },
  { path: '/pdv', icon: 'bx-cart-alt', title: 'PDV' },

  {
    title: 'Caixa e Fluxo',
    icon: 'bx-slider-alt',
    children: [
      { path: '/cashier', icon: 'bx-wallet', title: 'Abrir/Fechar Caixa' },
      { path: '/finance/cash-flow-projections', icon: 'bx-trending-up', title: 'Projeção de Caixa' },
      { path: '/finance/cash-flow-report', icon: 'bx-file-blank', title: 'Relatório de Caixa' },
    ],
  },
  {
    title: 'Agendamento',
    icon: 'bx-calendar',
    children: [
      { path: '/calendar', icon: 'bx-calendar', title: 'Agenda' },
      { path: '/quotations', icon: 'bx-file', title: 'Orçamentos' },
      { path: '/appointments/book', icon: 'bx-calendar-plus', title: 'Agendar Horário' },
      { path: '/appointments/manage', icon: 'bx-calendar-check', title: 'Gerenciar Agenda' },
    ],
  },

  {
    title: 'Pessoas',
    icon: 'bxs-group',
    children: [
      { path: '/customers', icon: 'bxs-user-detail', title: 'Clientes' },
      { path: '/suppliers', icon: 'bxs-truck', title: 'Fornecedores' },
      { path: '/technicians', icon: 'bxs-user-plus', title: 'Técnicos' },
      { path: '/users', icon: 'bxs-user-account', title: 'Usuários', roles: ['admin'] },
    ],
  },
  {
    title: 'Produtos e Estoque',
    icon: 'bxs-package',
    children: [
      { path: '/products', icon: 'bxs-package', title: 'Produtos' },
      { path: '/used-products', icon: 'bx-recycle', title: 'Produtos Usados' },
      { path: '/gift-cards', icon: 'bx-gift', title: 'Vale-Presentes' },
      { path: '/stock', icon: 'bxs-store-alt', title: 'Gerenciar Estoque' },
      { path: '/stock/transfers', icon: 'bx-transfer', title: 'Transferências de Estoque', roles: ['admin'] },
      { path: '/device-history', icon: 'bx-mobile', title: 'Histórico do Dispositivo' },
    ],
  },
  {
    title: 'Serviços',
    icon: 'bxs-wrench',
    children: [
      { path: '/repairs', icon: 'bxs-wrench', title: 'Gerenciar Reparos' },
      { path: '/repairs/warranty', icon: 'bx-check-shield', title: 'Garantias' },
      { path: '/technician-kanban', icon: 'bx-layout', title: 'Oficina (Kanban)' },
      { path: '/kanban-metrics', icon: 'bx-tachometer', title: 'Métricas do Kanban' },
    ],
  },

  {
    title: 'Financeiro',
    icon: 'bx-money-withdraw',
    children: [
      { path: '/finance/receivables', title: 'Contas a Receber' },
      { path: '/finance/payables', title: 'Contas a Pagar' },
      { path: '/expenses', icon: 'bx-dollar-circle', title: 'Despesas', roles: ['admin'] },
      { path: '/finance/bank-accounts', icon: 'bx-bank', title: 'Contas Bancárias' },
      { path: '/commissions/rules', icon: 'bx-sitemap', title: 'Regras de Comissão' },
      { path: '/commissions/calculated', icon: 'bx-calculator', title: 'Comissões Calculadas' },
      { path: '/commissions/payments', icon: 'bx-money-withdraw', title: 'Pagamento de Comissões' },
    ],
  },

  {
    title: 'Marketing e Vendas',
    icon: 'bx-target-lock',
    children: [
      { path: '/leads', icon: 'bx-user-plus', title: 'Leads', roles: ['admin'] },
      { path: '/customer-interactions', icon: 'bx-chat', title: 'Interações com Clientes', roles: ['admin'] },
      { path: '/nps/survey', icon: 'bx-smile', title: 'Pesquisa NPS' },
      { path: '/nps/reports', icon: 'bx-line-chart', title: 'Relatórios NPS' },
      { path: '/marketing/campaigns', icon: 'bx-bullhorn', title: 'Campanhas de Marketing' },
      { path: '/marketing/reports', icon: 'bx-bar-chart-square', title: 'Relatórios de Campanha' },
    ],
  },

  {
    title: 'Relatórios e Análises',
    icon: 'bx-chart',
    children: [
      { path: '/reports/profitability', icon: 'bx-line-chart', title: 'Lucratividade', roles: ['admin'] },
      { path: '/reports/sales', icon: 'bx-chart', title: 'Vendas' },
      { path: '/reports/customers', icon: 'bx-user-voice', title: 'Clientes' },
      { path: '/reports/technician-performance', icon: 'bx-user-check', title: 'Desempenho de Técnicos' },
      { path: '/reports/product-profitability', icon: 'bx-dollar', title: 'Lucratividade por Produto' },
      { path: '/reports/abc-analysis', icon: 'bx-sort-a-z', title: 'Análise ABC' },
      { path: '/bi-dashboard', icon: 'bx-area', title: 'BI Dashboard' },
    ],
  },

  {
    title: 'Aplicativos',
    icon: 'bx-extension',
    children: [
      { path: '/apps/whatsapp', icon: 'bxl-whatsapp', title: 'WhatsApp' },
      { path: '/apps/instagram', icon: 'bxl-instagram', title: 'Instagram' },
      { path: '/apps/facebook', icon: 'bxl-facebook', title: 'Facebook' },
      { path: '/apps/spotify', icon: 'bxl-spotify', title: 'Spotify' },
    ],
  },

  ];

const bottomMenuItems = [
  { path: '/settings', icon: 'bx-cog', title: 'Configurações', roles: ['admin'] },
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

  const linkId = `sidebar-link-${item.title.replace(/\s+/g, '-').replace(/[()]/g, '\$&')}`;

  if (hasChildren) {
    return (      <li className={isOpen ? 'menu-item open' : 'menu-item'}>
        <button className='nav-link' id={linkId} onClick={toggle}>
          <div className='nav-link-content'>
            {item.icon && <i className={`bx ${item.icon}`}></i>}
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          <div className='arrow-container'>
            {!isCollapsed && <i className='bx bx-chevron-down arrow'></i>}
          </div>
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
  const mainMenuItems = useMemo(() => {
    if (isAuthLoading) return []; // Retorna vazio enquanto a autenticação carrega
    return filterMenuByRole(allMenuItems, hasRole);
  }, [isAuthLoading, hasRole]);

  const footerMenuItems = useMemo(() => {
    if (isAuthLoading) return []; // Retorna vazio enquanto a autenticação carrega
    return filterMenuByRole(bottomMenuItems, hasRole);
  }, [isAuthLoading, hasRole]);

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-menu-open' : ''}`}
    >
      <div className='sidebar-header'>
        <motion.div animate={{ opacity: 1, width: 'auto' }}>
          {!isCollapsed && <img alt='PDV Web Logo' className='sidebar-logo' src={logoSrc} />}
        </motion.div>
      </div>
      <nav className='sidebar-nav'>
        <ul className='list-unstyled main-menu'>
          {mainMenuItems.map((item, index) =>
            item.type === 'separator' ? (
              <li key={index} className='sidebar-separator' />
            ) : (
              <SidebarItem key={index} isCollapsed={isCollapsed} item={item} />
            ),
          )}
        </ul>
        <ul className='list-unstyled footer-menu'>
          {footerMenuItems.map((item, index) => (
            <SidebarItem key={index} isCollapsed={isCollapsed} item={item} />
          ))}
        </ul>
      </nav>

      

    </aside>
  );
};

export default Sidebar;