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
  FaCube, FaHandshake 
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
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Vendas',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/pos', label: 'Ponto de Venda', icon: <FaShoppingCart /> },
      { path: '/customers', label: 'Clientes', icon: <FaUsers /> },
      { path: '/orders', label: 'Recepção', icon: <FaClipboardList /> },
      { path: '/returns', label: 'Retornos e Reembolsos', icon: <FaUndo /> },
    ]
  },
  {
    title: 'Catálogo',
    items: [
      { path: '/products', label: 'Produtos', icon: <FaBoxOpen /> },
      { path: '/product-kits', label: 'Kits de Produtos', icon: <FaBox /> },
      { path: '/compatibility', label: 'Películas Compatíveis', icon: <FaMobileAlt /> },
      { path: '/categories', label: 'Categorias', icon: <FaTags /> },
      { path: '/tags', label: 'Tags', icon: <FaTags /> },
      { path: '/reviews', label: 'Avaliações', icon: <FaStar /> },
    ]
  },
  {
    title: 'Marketing',
    items: [
      { path: '/promotions', label: 'Promoções', icon: <FaTags /> },
      { path: '/loyalty', label: 'Fidelidade', icon: <FaGift /> },
      { path: '/rfm-segments', label: 'Segmentos RFM', icon: <FaUsers /> },
      { path: '/leads', label: 'Gestão de Leads', icon: <FaUsers /> },
    ]
  },
  {
    title: 'Operações',
    items: [
      { path: '/inventory', label: 'Estoque', icon: <FaTasks /> },
      { path: '/quarantine', label: 'Quarentena', icon: <FaBiohazard /> },
      { path: '/suppliers', label: 'Fornecedores', icon: <FaTruck /> },
      { path: '/purchase-orders', label: 'Ordens de Compra', icon: <FaClipboardList /> },
      { path: '/branches', label: 'Filiais', icon: <FaStore /> },
      { path: '/service-orders', label: 'Ordens de Serviço', icon: <FaClipboardList /> },
      { path: '/shifts', label: 'Turnos', icon: <FaCalendarAlt /> },
      { path: '/time-clock', label: 'Ponto Eletrônico', icon: <FaClock /> },
    ]
  },
  {
    title: 'Gerenciamento',
    items: [
      { path: '/gamification', label: 'Gamificação', icon: <FaTrophy /> },
      { path: '/kanban', label: 'Kanban', icon: <FaTasks /> },
      { path: '/my-performance', label: 'Meu Desempenho', icon: <FaChartPie /> },
    ]
  },
  {
    title: 'Finanças',
    items: [
      { path: '/reports', label: 'Relatórios Vendas', icon: <FaChartLine /> },
      { path: '/cash-flow', label: 'Fluxo de Caixa', icon: <FaMoneyBillAlt /> },
      { path: '/what-if-promotion', label: 'Análise What-If', icon: <FaChartBar /> },
      { path: '/accounting-integration', label: 'Integração Contábil', icon: <FaExchangeAlt /> },
      { path: '/accounts-report', label: 'Contas a Pagar/Receber', icon: <FaMoneyBillAlt /> },
      { path: '/category-profitability', label: 'Rentabilidade Categoria', icon: <FaChartPie /> },
      { path: '/break-even', label: 'Ponto de Equilíbrio', icon: <FaBalanceScale /> },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { path: '/settings', label: 'Configurações', icon: <FaCogs /> },
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
