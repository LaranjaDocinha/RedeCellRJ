import React, { useEffect, useRef, useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaTimes, FaTachometerAlt, FaShoppingCart, FaUsers, FaBoxOpen, FaClipboardList, FaUndo, FaTags, FaStar, FaGift, FaChartLine, FaTasks, FaHistory, FaUserShield, FaUserCog, FaCogs, FaStore, FaTruck, FaBox, FaPercentage, FaTicketAlt, FaGem, FaBars, FaBiohazard, FaTrophy, FaCalendarAlt, FaUserCheck, FaClock, FaMoneyBillWave, FaClipboardCheck, FaChartPie, FaMoneyBillAlt, FaChartBar, FaExchangeAlt, FaChartPie as FaChartPieIcon, FaBalanceScale, FaKey, FaPhone, FaLink, FaWordpress, FaMobileAlt, FaChartBar as FaChartBarIcon, FaGoogle, FaQuestionCircle, FaCommentDots, FaCube, FaHandshake, FaChevronDown, FaChevronRight, FaThumbtack, FaEye, FaEyeSlash, FaSpinner, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Importar motion
import {
  StyledSidebar,
  SidebarHeader,
  SidebarTitle,
  SidebarCloseBtn,
  SidebarNav,
  SidebarNavItem,
  SidebarNavGroup,
  SidebarNavGroupTitle,
  SidebarSearchInput, // Importar o novo componente de input
  ExternalLinkIcon // Importar o novo componente de ícone de link externo
} from './Sidebar.styled';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
  subItems?: NavItem[]; // Adicionar subItems opcional
  notificationCount?: number; // Adicionar notificationCount opcional
  permission?: string; // Adicionar permissão opcional
  dataTestId?: string; // Adicionar dataTestId opcional
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [ // Definir o tipo para navGroups
  {
    title: 'Vendas',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/pos', label: 'Ponto de Venda', icon: <FaShoppingCart />, permission: 'pos.access' }, // Exemplo de permissão
      { path: '/customers', label: 'Clientes', icon: <FaUsers />, permission: 'customers.view' }, // Exemplo de permissão
      { path: '/orders', label: 'Pedidos', icon: <FaClipboardList />, notificationCount: 5, permission: 'orders.view' }, // Exemplo
      { path: '/returns', label: 'Devoluções', icon: <FaUndo /> },
    ]
  },
  {
    title: 'Catálogo',
    items: [
      { path: '/products', label: 'Produtos', icon: <FaBoxOpen />, permission: 'products.view', // Exemplo de permissão
        dataTestId: 'products-menu-item',
        subItems: [ // Exemplo de subItems
          { path: '/products/list', label: 'Lista de Produtos', icon: <FaBoxOpen />, permission: 'products.view' },
          { path: '/products/add', label: 'Adicionar Produto', icon: <FaBox />, permission: 'products.create' },
          { path: '/products/categories', label: 'Categorias', icon: <FaTags />, permission: 'categories.view' },
        ]
      },
      { path: '/product-kits', label: 'Kits de Produtos', icon: <FaBox /> },
      { path: '/categories', label: 'Categorias', icon: <FaTags /> },
      { path: '/tags', label: 'Tags', icon: <FaTags /> },
      { path: '/reviews', label: 'Avaliações', icon: <FaStar />, notificationCount: 2 }, // Exemplo
    ]
  },
  {
    title: 'Marketing',
    items: [
      { path: '/discounts', label: 'Descontos', icon: <FaPercentage /> },
      { path: '/coupons', label: 'Cupons', icon: <FaTicketAlt /> },
      { path: '/loyalty', label: 'Fidelidade', icon: <FaGift /> },
      { path: '/loyalty-tiers', label: 'Níveis de Fidelidade', icon: <FaGem /> },
      { path: '/rfm-segments', label: 'Segmentos RFM', icon: <FaUsers /> },
      { path: '/marketing-automations', label: 'Automações', icon: <FaTasks /> },
      { path: '/referrals', label: 'Indicações', icon: <FaUsers /> },
      { path: '/leads', label: 'Gestão de Leads', icon: <FaUsers /> }, // Adicionado Gestão de Leads
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
      { path: '/shifts', label: 'Turnos', icon: <FaCalendarAlt /> },
      { path: '/time-clock', label: 'Ponto Eletrônico', icon: <FaClock /> },
      { path: '/expense-reimbursements', label: 'Reembolsos', icon: <FaMoneyBillWave /> },
    ]
  },
  {
    title: 'Gerenciamento',
    items: [
      { path: '/gamification', label: 'Gamificação', icon: <FaTrophy /> },
      { path: '/reports/inventory-valuation', label: 'Valorização de Estoque', icon: <FaChartLine /> },
      { path: '/kanban', label: 'Kanban', icon: <FaTasks /> },
      { path: '/audit-logs', label: 'Auditoria', icon: <FaHistory /> },
      { path: '/survey-dashboard', label: 'Satisfação', icon: <FaStar /> },
      { path: '/performance-reviews', label: 'Avaliações', icon: <FaUserCheck /> },
      { path: '/onboarding', label: 'Onboarding', icon: <FaClipboardCheck /> },
      { path: '/my-performance', label: 'Meu Desempenho', icon: <FaChartPie /> },
    ]
  },
  {
    title: 'Finanças',
    items: [
      { path: '/reports', label: 'Relatórios', icon: <FaChartLine /> },
      { path: '/cash-flow', label: 'Fluxo de Caixa', icon: <FaMoneyBillAlt /> },
      { path: '/what-if-promotion', label: 'Análise What-If', icon: <FaChartBar /> },
      { path: '/accounting-integration', label: 'Integração Contábil', icon: <FaExchangeAlt /> },
      { path: '/accounts-report', label: 'Contas a Pagar/Receber', icon: <FaMoneyBillAlt /> },
      { path: '/category-profitability', label: 'Rentabilidade por Categoria', icon: <FaChartPieIcon /> },
      { path: '/break-even', label: 'Ponto de Equilíbrio', icon: <FaBalanceScale /> },
    ]
  },
  {
    title: 'Administração',
    items: [
      { path: '/users-management', label: 'Usuários', icon: <FaUserCog />, permission: 'users.manage' }, // Exemplo de permissão
      { path: '/roles', label: 'Cargos', icon: <FaUserShield />, permission: 'roles.manage' }, // Exemplo de permissão
      { path: '/permissions', label: 'Permissões', icon: <FaUserShield />, permission: 'permissions.manage' }, // Exemplo de permissão
      { path: '/role-permissions', label: 'Builder de Funções', icon: <FaUserShield />, permission: 'roles.manage' }, // Exemplo de permissão
      { path: '/gdpr-tools', label: 'Ferramentas LGPD/GDPR', icon: <FaUserShield /> },
      { path: '/branch-settings', label: 'Configurações de Filiais', icon: <FaStore /> },
      { path: '/templates', label: 'Templates Customizáveis', icon: <FaClipboardList /> },
      { path: '/whatsapp-templates', label: 'Templates WhatsApp', icon: <FaCommentDots /> }, // Novo item
      { path: '/system-health', label: 'Monitoramento (God Mode)', icon: <FaTachometerAlt /> }, // Novo item
      { path: '/sandbox', label: 'Ambiente Sandbox', icon: <FaCube /> },
      { path: '/branding', label: 'White-labeling', icon: <FaStore /> },
      { path: '/settings', label: 'Configurações', icon: <FaCogs /> },
      { path: '/rules-engine', label: 'Motor de Regras', icon: <FaCogs /> }, // Adicionado Motor de Regras
    ]
  },
  {
    title: 'Ecossistema e Integrações',
    items: [
      { path: '/partner-api', label: 'API para Parceiros', icon: <FaKey /> },
      { path: '/ecommerce-sync', label: 'Sincronização E-commerce', icon: <FaShoppingCart /> },
      { path: '/marketplace-sync', label: 'Sincronização com Marketplaces', icon: <FaStore /> },
      { path: '/carrier-api', label: 'Integração com Operadoras', icon: <FaPhone /> },
      { path: '/webhooks', label: 'Webhooks', icon: <FaLink /> },
      { path: '/wordpress-integration', label: 'Integração WordPress/WooCommerce', icon: <FaWordpress /> },
      { path: '/mobile-app-simulation', label: 'App Móvel (PWA)', icon: <FaMobileAlt /> },
      { path: '/bi-integration', label: 'Integração BI Externa', icon: <FaChartBarIcon /> },
      { path: '/franchises', label: 'Franquias', icon: <FaStore /> },
      { path: '/google-shopping-integration', label: 'Integração Google Shopping', icon: <FaGoogle /> },
    ]
  },
  {
    title: 'Experiência do Cliente (CX) e Portal Self-Service',
    items: [
      { path: '/online-scheduling', label: 'Agendamento Online', icon: <FaCalendarAlt /> },
      { path: '/customer-portal', label: 'Portal do Cliente', icon: <FaUsers /> },
      { path: '/faqs', label: 'Base de Conhecimento (FAQ)', icon: <FaQuestionCircle /> },
      { path: '/chat-support', label: 'Chat em Tempo Real', icon: <FaCommentDots /> },
      { path: '/ar-preview', label: 'Realidade Aumentada', icon: <FaCube /> },
      { path: '/buyback-program', label: 'Programa de Recompra', icon: <FaHandshake /> },
    ]
  }
];

// Definir variantes de animação para a largura da sidebar
const sidebarVariants = {
  expanded: { width: 250 },
  compact: { width: 80 },
};

// Componente auxiliar para renderizar itens e subitens
const SidebarItem: React.FC<{ item: NavItem; isCompact: boolean; onClose: () => void; toggleSubmenu: (path: string) => void; isSubmenuExpanded: boolean }> = ({ item, isCompact, onClose, toggleSubmenu, isSubmenuExpanded }) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = window.location.pathname.startsWith(item.path);
  const [isLoading, setIsLoading] = useState(false); // Novo estado de carregamento

  const handleItemClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      toggleSubmenu(item.path);
    } else {
      setIsLoading(true); // Iniciar carregamento
      // setTimeout(() => { // Simular carregamento
        setIsLoading(false);
        onClose();
      // }, 500); // Tempo de simulação
    }
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique no ícone ative o handleItemClick do item pai
    window.open(item.path, '_blank');
  };

  return (
    <>
      <SidebarNavItem
        as={hasSubItems ? 'div' : NavLink}
        to={item.path}
        onClick={handleItemClick}
        $isCompact={isCompact}
        className={isActive ? 'active' : ''}
        data-testid={item.dataTestId}
      >
        <motion.span
          className="sidebar-icon"
          whileHover={{ rotate: 8, scale: 1.1 }} // Rotação e escala sutis ao passar o mouse
          whileTap={{ scale: 0.9 }} // Pequena escala ao clicar
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {item.icon}
        </motion.span>
        {!isCompact && item.label}
        {isLoading && !isCompact && ( // Renderizar spinner
          <FaSpinner className="loading-spinner" />
        )}
        {item.notificationCount && item.notificationCount > 0 && !isCompact && !isLoading && ( // Renderizar badge (ocultar se estiver carregando)
          <span className="notification-badge">{item.notificationCount}</span>
        )}
        {!isCompact && !hasSubItems && ( // Mostrar ícone de link externo apenas para itens sem submenus e no modo expandido
          <ExternalLinkIcon onClick={handleOpenInNewTab}>
            <FaExternalLinkAlt />
          </ExternalLinkIcon>
        )}
        {hasSubItems && !isCompact && (
          <span className="submenu-toggle-icon">
            {isSubmenuExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}
      </SidebarNavItem>
      {hasSubItems && isSubmenuExpanded && (
        <ul className="submenu" data-testid="submenu-list">
          {item.subItems?.map((subItem) => (
            <li key={subItem.path}>
              <SidebarNavItem
                as={NavLink}
                to={subItem.path}
                onClick={() => {
                  setIsLoading(true); // Iniciar carregamento para subitem
                  // setTimeout(() => {
                    setIsLoading(false);
                    onClose();
                  // }, 500);
                }}
                $isCompact={isCompact}
              >
                <span className="sidebar-icon">{subItem.icon}</span>
                {!isCompact && subItem.label}
                {isLoading && !isCompact && ( // Renderizar spinner para subitem
                  <FaSpinner className="loading-spinner" />
                )}
                {subItem.notificationCount && subItem.notificationCount > 0 && !isCompact && !isLoading && ( // Renderizar badge para subitens (ocultar se estiver carregando)
                  <span className="notification-badge">{subItem.notificationCount}</span>
                )}
                {!isCompact && ( // Mostrar ícone de link externo para subitens no modo expandido
                  <ExternalLinkIcon onClick={(e) => { e.stopPropagation(); window.open(subItem.path, '_blank'); }}>
                    <FaExternalLinkAlt />
                  </ExternalLinkIcon>
                )}
              </SidebarNavItem>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [expandedSubmenus, setExpandedSubmenus] = useState<{ [key: string]: boolean }>({}); // Estado para submenus
  const [fixedGroups, setFixedGroups] = useState<string[]>(() => { // Estado para grupos fixados
    const storedFixedGroups = localStorage.getItem('fixedSidebarGroups');
    return storedFixedGroups ? JSON.parse(storedFixedGroups) : [];
  });
  const [recentItems, setRecentItems] = useState<NavItem[]>(() => { // Estado para itens recentes
    const storedRecentItems = localStorage.getItem('recentSidebarItems');
    return storedRecentItems ? JSON.parse(storedRecentItems) : [];
  });
  const [isZenMode, setIsZenMode] = useState(false); // Novo estado para modo Zen
  const [searchTerm, setSearchTerm] = useState(''); // Novo estado para termo de pesquisa

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('fixedSidebarGroups', JSON.stringify(fixedGroups));
  }, [fixedGroups]);

  useEffect(() => { // Monitorar mudanças de rota para histórico
    const currentPath = location.pathname;
    const currentItem = navGroups.flatMap(group => group.items).find(item => item.path === currentPath);

    if (currentItem) {
      setRecentItems(prev => {
        const filtered = prev.filter(item => item.path !== currentPath); // Remover se já existe
        const newRecent = [currentItem, ...filtered.slice(0, 4)]; // Manter os 5 mais recentes
        localStorage.setItem('recentSidebarItems', JSON.stringify(newRecent));
        return newRecent;
      });
    }
  }, [location.pathname]); // Dependência para monitorar a rota

  const toggleSubmenu = useCallback((path: string) => {
    setExpandedSubmenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const toggleFixedGroup = useCallback((title: string) => { // Função para fixar/desafixar grupo
    setFixedGroups((prev) => {
      if (prev.includes(title)) {
        return prev.filter((t) => t !== title);
      } else {
        return [...prev, title];
      }
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const firstFocusable = sidebarRef.current?.querySelector('button, [href]') as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    } else {
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen || !sidebarRef.current) return;

      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }

      if (event.key === 'Tab') {
        const focusableElements = sidebarRef.current.querySelectorAll('button, [href], input'); // Incluir input na lista de elementos focáveis
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Lógica de filtragem
  const filteredNavGroups = navGroups
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        const matchesLabel = item.label.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubItem = item.subItems?.some((subItem) =>
          subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchesLabel || matchesSubItem;
      });
      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0); // Remover grupos vazios

  // Ordenar grupos: fixados primeiro, depois os não fixados
  const sortedAndFilteredNavGroups = [...filteredNavGroups].sort((a, b) => {
    const aIsFixed = fixedGroups.includes(a.title);
    const bIsFixed = fixedGroups.includes(b.title);

    if (aIsFixed && !bIsFixed) return -1;
    if (!aIsFixed && bIsFixed) return 1;
    return 0;
  });

  // Filtrar grupos para o modo Zen
  const displayedNavGroups = isZenMode
    ? sortedAndFilteredNavGroups.filter(group => fixedGroups.includes(group.title))
    : sortedAndFilteredNavGroups;

  return (
    <StyledSidebar
      as={motion.aside}
      $isOpen={isOpen}
      $isCompact={isCompact}
      ref={sidebarRef}
      role="navigation"
      aria-label="Menu Principal"
      id="main-sidebar"
      initial={false}
      animate={isCompact ? "compact" : "expanded"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <SidebarHeader>
        {/* Botão para alternar modo compacto */}
        <SidebarCloseBtn onClick={() => setIsCompact(!isCompact)} aria-label={isCompact ? "Expandir Sidebar" : "Compactar Sidebar"}>
          <FaBars />
        </SidebarCloseBtn>
        {!isCompact && <SidebarTitle>Menu</SidebarTitle>}
        {/* Botão para alternar modo Zen */}
        {!isCompact && (
          <SidebarCloseBtn onClick={() => setIsZenMode(!isZenMode)} aria-label={isZenMode ? "Sair do Modo Zen" : "Entrar no Modo Zen"}>
            {isZenMode ? <FaEyeSlash /> : <FaEye />}
          </SidebarCloseBtn>
        )}
        <SidebarCloseBtn onClick={onClose} aria-label="Fechar Sidebar">
          <FaTimes />
        </SidebarCloseBtn>
      </SidebarHeader>

      {!isCompact && ( // Mostrar barra de pesquisa apenas no modo expandido
        <SidebarSearchInput
          type="text"
          placeholder="Pesquisar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Pesquisar itens da sidebar"
        />
      )}

      <SidebarNav>
        <ul>
          {/* Seção de Itens Recentes */}
          {recentItems.length > 0 && !isZenMode && searchTerm === '' && ( // Ocultar recentes no modo Zen e ao pesquisar
            <SidebarNavGroup key="recent-items">
              {!isCompact && <SidebarNavGroupTitle>Recentes</SidebarNavGroupTitle>}
              <ul>
                {recentItems.map((item) => (
                  <li key={item.path}>
                    <SidebarItem
                      item={item}
                      isCompact={isCompact}
                      onClose={onClose}
                      toggleSubmenu={toggleSubmenu}
                      isSubmenuExpanded={!!expandedSubmenus[item.path]}
                    />
                  </li>
                ))}
              </ul>
            </SidebarNavGroup>
          )}

          {displayedNavGroups.map((group) => ( // Usar grupos filtrados
            <SidebarNavGroup key={group.title} $isFixed={fixedGroups.includes(group.title)}>
              {!isCompact && (
                <SidebarNavGroupTitle>
                  {group.title}
                  <span
                    className="pin-icon"
                    onClick={(e) => { e.stopPropagation(); toggleFixedGroup(group.title); }}
                    aria-label={fixedGroups.includes(group.title) ? "Desafixar grupo" : "Fixar grupo"}
                  >
                    <FaThumbtack />
                  </span>
                </SidebarNavGroupTitle>
              )}
              <ul>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <SidebarItem
                      item={item}
                      isCompact={isCompact}
                      onClose={onClose}
                      toggleSubmenu={toggleSubmenu}
                      isSubmenuExpanded={!!expandedSubmenus[item.path]}
                    />
                  </li>
                ))}
              </ul>
            </SidebarNavGroup>
          ))}
        </ul>
      </SidebarNav>
    </StyledSidebar>
  );
};

export default Sidebar;