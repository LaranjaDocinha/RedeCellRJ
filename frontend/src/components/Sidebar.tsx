import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, FaShoppingCart, FaUsers, FaBoxOpen, FaClipboardList, 
  FaUndo, FaTags, FaStar, FaGift, FaChartLine, FaTasks, FaHistory, 
  FaUserShield, FaUserCog, FaCogs, FaStore, FaTruck, FaBox, FaPercentage, 
  FaTicketAlt, FaGem, FaBiohazard, FaTrophy, FaCalendarAlt, FaUserCheck, 
  FaClock, FaMoneyBillWave, FaClipboardCheck, FaChartPie, FaMoneyBillAlt, 
  FaChartBar, FaExchangeAlt, FaBalanceScale, FaKey, FaPhone, FaLink, 
  FaWordpress, FaMobileAlt, FaGoogle, FaQuestionCircle, FaCommentDots, 
  FaCube, FaHandshake, FaHome 
} from 'react-icons/fa';
import { Tooltip } from '@mui/material';
import {
  StyledSidebar,
  SidebarNav,
  SidebarNavItem,
  SidebarNavGroup,
  SidebarNavGroupTitle,
  SidebarSearchInput
} from './Sidebar.styled';

interface SidebarProps {
  isOpen: boolean;
  isCompact: boolean;
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
  id?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Vendas',
    items: [
      { path: '/', label: 'Início', icon: <FaHome />, id: 'home-link' },
      { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, id: 'dashboard-link' },
      { path: '/pos', label: 'Ponto de Venda', icon: <FaShoppingCart />, id: 'pos-link' },
      { path: '/customers', label: 'Clientes', icon: <FaUsers />, id: 'customers-link' },
      { path: '/orders', label: 'Recepção', icon: <FaClipboardList /> },
      { path: '/returns', label: 'Retornos e Reembolsos', icon: <FaUndo /> },
    ]
  },
  {
    title: 'Estoque e Produtos',
    items: [
      { path: '/products', label: 'Produtos', icon: <FaBoxOpen /> },
      { path: '/inventory', label: 'Inventário', icon: <FaBox /> },
      { path: '/inventory/purchase-suggestions', label: 'Sugestões Compra', icon: <FaShoppingCart /> },
      { path: '/categories', label: 'Categorias', icon: <FaTags /> },
      { path: '/tags', label: 'Tags', icon: <FaStar /> },
      { path: '/product-kits', label: 'Kits de Produtos', icon: <FaCube /> },
      { path: '/quarantine', label: 'Quarentena & RMA', icon: <FaBiohazard /> },
    ]
  },
  {
    title: 'Gerenciamento',
    items: [
      { path: '/gamification', label: 'Gamificação', icon: <FaTrophy /> },
      { path: '/kanban', label: 'Kanban', icon: <FaTasks /> },
      { path: '/my-performance', label: 'Meu Desempenho', icon: <FaChartPie /> },
      { path: '/marketplace-sync', label: 'Hub Marketplace', icon: <FaStore /> },
      { path: '/branches', label: 'Filiais', icon: <FaStore /> },
      { path: '/executive-dashboard', label: 'Torre de Controle', icon: <FaChartBar />, id: 'executive-dashboard-link' },
      { path: '/settings', label: 'Configurações', icon: <FaCogs /> },
    ]
  },
  {
    title: 'Finanças',
    items: [
      { path: '/reports', label: 'Relatórios Vendas', icon: <FaChartLine /> },
      { path: '/cash-flow', label: 'Fluxo de Caixa', icon: <FaMoneyBillAlt /> },
      { path: '/print/queue', label: 'Fila de Impressão', icon: <FaClipboardCheck />, id: 'print-queue-link' },
      { path: '/expense-reimbursements', label: 'Reembolsos Equipe', icon: <FaMoneyBillWave /> },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCompact, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <StyledSidebar $isOpen={isOpen} $isCompact={isCompact}>
      {!isCompact && (
        <SidebarSearchInput
          type="text"
          placeholder="Pesquisar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      <SidebarNav>
        {filteredNavGroups.map((group) => (
          <SidebarNavGroup key={group.title}>
            {!isCompact && <SidebarNavGroupTitle>{group.title}</SidebarNavGroupTitle>}
            <ul>
              {group.items.map((item) => (
                <li key={item.path}>
                  <Tooltip title={isCompact ? item.label : ''} placement="right" arrow disableInteractive>
                    <SidebarNavItem
                      as={NavLink}
                      to={item.path}
                      id={item.id}
                      onClick={() => {
                        if (window.innerWidth < 768) onClose();
                      }}
                      $isCompact={isCompact}
                    >
                      <span className="sidebar-icon">{item.icon}</span>
                      {!isCompact && <span>{item.label}</span>}
                    </SidebarNavItem>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </SidebarNavGroup>
        ))}
      </SidebarNav>
    </StyledSidebar>
  );
};

export default Sidebar;