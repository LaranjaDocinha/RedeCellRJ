import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Typography, Link, useTheme, Box } from '@mui/material';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export const SmartBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  
  // Ignorar breadcrumbs no Dashboard ou Login
  if (location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/login') {
      return null;
  }

  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    pos: 'PDV',
    products: 'Produtos',
    customers: 'Clientes',
    settings: 'Configurações',
    reports: 'Relatórios',
    'service-orders': 'Ordens de Serviço',
    users: 'Usuários',
    roles: 'Perfis de Acesso',
    permissions: 'Permissões',
    inventory: 'Estoque',
    categories: 'Categorias',
    tags: 'Tags',
    suppliers: 'Fornecedores',
    promotions: 'Promoções',
    returns: 'Devoluções',
    loyalty: 'Fidelidade',
    'product-kits': 'Kits de Produtos',
    compatibility: 'Compatibilidade',
    branches: 'Filiais',
    'whatsapp-templates': 'Templates WhatsApp',
    'system-health': 'Saúde do Sistema',
    'custom-dashboard': 'Dashboard Personalizado',
    leads: 'Leads (CRM)',
    'rule-engine': 'Motor de Regras',
    referrals: 'Indicações',
    gamification: 'Gamificação',
    'time-clock': 'Ponto Eletrônico',
    quarantine: 'Quarentena',
    reviews: 'Avaliações',
    'cash-flow': 'Fluxo de Caixa',
    'mobile-app-simulation': 'App Mobile',
    'tech-bench': 'Bancada Técnica'
  };

  const getReadableName = (value: string) => {
      // Se for um ID (uuid ou numero), mostra encurtado ou 'Detalhes'
      if (value.match(/^[0-9a-fA-F-]{10,}$/) || !isNaN(Number(value))) {
          return 'Detalhes';
      }
      return routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Breadcrumbs 
            separator={<FiChevronRight size={14} color={theme.palette.text.secondary} />} 
            aria-label="breadcrumb"
            sx={{ 
                '& .MuiBreadcrumbs-li': {
                    display: 'flex',
                    alignItems: 'center'
                }
            }}
        >
        <Link 
            component={RouterLink} 
            to="/dashboard" 
            color="inherit" 
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
            <FiHome size={14} />
        </Link>
        {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const name = getReadableName(value);

            return last ? (
            <Typography color="text.primary" key={to} variant="body2" fontWeight={500}>
                {name}
            </Typography>
            ) : (
            <Link 
                component={RouterLink} 
                to={to} 
                color="inherit" 
                underline="hover" 
                key={to}
                variant="body2"
            >
                {name}
            </Link>
            );
        })}
        </Breadcrumbs>
    </Box>
  );
};
