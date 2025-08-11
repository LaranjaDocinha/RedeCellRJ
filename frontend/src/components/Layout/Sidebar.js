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

  { type: 'separator', title: 'Operações Diárias' }, // New separator
  { path: '/pdv', icon: 'bx-cart-alt', title: 'PDV' },
  {
    title: 'Caixa e Fluxo', // Combined
    icon: 'bx-slider-alt',
    children: [
      { path: '/cashier', icon: 'bx-wallet', title: 'Abrir/Fechar Caixa' },
      { path: '/finance/cash-flow-projections', icon: 'bx-trending-up', title: 'Projeção de Caixa' },
      { path: '/finance/cash-flow-report', icon: 'bx-file-blank', title: 'Relatório de Caixa' },
    ],
  },
  { path: '/calendar', icon: 'bx-calendar', title: 'Agenda' },
  { path: '/quotations', icon: 'bx-file', title: 'Orçamentos' }, // Moved up

  { type: 'separator', title: 'Gestão' }, // New separator
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
    title: 'Produtos e Estoque', // Combined
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
    title: 'Serviços', // New parent for repairs and related
    icon: 'bxs-wrench',
    children: [
      { path: '/repairs', icon: 'bxs-wrench', title: 'Gerenciar Reparos' },
      { path: '/repairs/warranty', icon: 'bx-check-shield', title: 'Garantias' },
      { path: '/technician-kanban', icon: 'bx-layout', title: 'Oficina (Kanban)' },
      { path: '/kanban-metrics', icon: 'bx-tachometer', title: 'Métricas do Kanban' },
      { path: '/appointments/book', icon: 'bx-calendar-plus', title: 'Agendar Horário' },
      { path: '/appointments/manage', icon: 'bx-calendar-check', title: 'Gerenciar Agenda' },
    ],
  },

  { type: 'separator', title: 'Financeiro' }, // Separator for Finance
  {
    title: 'Contas a Pagar/Receber', // Combined
    icon: 'bx-money-withdraw',
    roles: ['admin'],
    children: [
      { path: '/finance/receivables', title: 'Contas a Receber' },
      { path: '/finance/payables', title: 'Contas a Pagar' },
      { path: '/expenses', icon: 'bx-dollar-circle', title: 'Despesas', roles: ['admin'] },
      { path: '/finance/bank-accounts', icon: 'bx-bank', title: 'Contas Bancárias' },
    ],
  },
  {
    title: 'Comissões',
    icon: 'bx-sitemap',
    children: [
      { path: '/commissions/rules', icon: 'bx-sitemap', title: 'Regras de Comissão' },
      { path: '/commissions/calculated', icon: 'bx-calculator', title: 'Comissões Calculadas' },
      { path: '/commissions/payments', icon: 'bx-money-withdraw', title: 'Pagamento de Comissões' },
    ],
  },

  { type: 'separator', title: 'Marketing e CRM' }, // New separator
  {
    title: 'CRM',
    icon: 'bxs-group',
    children: [
      { path: '/leads', icon: 'bx-user-plus', title: 'Leads', roles: ['admin'] },
      { path: '/customer-interactions', icon: 'bx-chat', title: 'Interações com Clientes', roles: ['admin'] },
      { path: '/nps/survey', icon: 'bx-smile', title: 'Pesquisa NPS' },
      { path: '/nps/reports', icon: 'bx-line-chart', title: 'Relatórios NPS' },
    ],
  },
  {
    title: 'Marketing',
    icon: 'bx-bullhorn',
    children: [
      { path: '/marketing/campaigns', icon: 'bx-bullhorn', title: 'Campanhas de Marketing' },
      { path: '/marketing/reports', icon: 'bx-bar-chart-square', title: 'Relatórios de Campanha' },
    ],
  },

  { type: 'separator', title: 'Relatórios e BI' }, // Separator for Reports & BI
  { path: '/reports', icon: 'bx-chart', title: 'Visão Geral' },
  {
    title: 'Relatórios Detalhados',
    icon: 'bx-line-chart',
    children: [
      { path: '/reports/profitability', icon: 'bx-line-chart', title: 'Lucratividade', roles: ['admin'] },
      { path: '/reports/sales', icon: 'bx-chart', title: 'Vendas' },
      { path: '/reports/customers', icon: 'bx-user-voice', title: 'Clientes' },
      { path: '/reports/technician-performance', icon: 'bx-user-check', title: 'Desempenho de Técnicos' },
      { path: '/reports/product-profitability', icon: 'bx-dollar', title: 'Lucratividade por Produto' },
      { path: '/reports/abc-analysis', icon: 'bx-sort-a-z', title: 'Análise ABC' },
    ],
  },
  { path: '/bi-dashboard', icon: 'bx-area', title: 'BI Dashboard' },
  { path: '/audit-logs', icon: 'bx-file', title: 'Logs de Auditoria', roles: ['admin'] },
  { path: '/roles-and-permissions', icon: 'bxs-key', title: 'Papéis e Permissões', roles: ['admin'] },
];

// Define a new constant for settings menu items
const settingsMenuItems = [
  { type: 'separator', title: 'Configurações' },
  { path: '/settings', icon: 'bx-cog', title: 'Configurações' },
  { path: '/settings/login-customization', icon: 'bx-palette', title: 'Personalizar Login', roles: ['admin'] },
  { path: '/settings/checklist-templates', icon: 'bx-check-square', title: 'Templates de Checklist', roles: ['admin'] },
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
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-menu-open' : ''}`}
    >
      <div className='sidebar-header'>
        <motion.div animate={{ opacity: 1, width: 'auto' }}>
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

      {/* New section for fixed settings at the bottom */}
      <nav className='sidebar-footer-nav'>
        <ul className='list-unstyled'>
          {filterMenuByRole(settingsMenuItems, hasRole).map((item, index) =>
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
