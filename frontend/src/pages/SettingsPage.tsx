import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  useTheme,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  useMediaQuery,
  Tabs,
  Tab
} from '@mui/material';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  Badge as BadgeIcon,
  WhatsApp as WhatsAppIcon,
  Description as DescriptionIcon,
  Store as StoreIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Rule as RuleIcon,
  Dns as DnsIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  ArrowForwardIos as ArrowIcon,
  Webhook as WebhookIcon,
  BugReport as DebugIcon,
  IntegrationInstructions as IntegrationIcon,
  ContactSupport as SupportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GeneralSettings from './GeneralSettings';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
  isComponent?: boolean;
}

interface SettingCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('team');
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const categories: SettingCategory[] = [
    {
      id: 'team',
      title: 'Equipe e Segurança',
      icon: <PeopleIcon />,
      items: [
        { id: 'users', title: 'Usuários', description: 'Gerencie acessos, perfis e logins dos colaboradores.', icon: <PeopleIcon color="primary" />, path: '/users' },
        { id: 'roles', title: 'Cargos e Funções', description: 'Defina níveis hierárquicos e responsabilidades.', icon: <BadgeIcon color="primary" />, path: '/roles' },
        { id: 'permissions', title: 'Permissões', description: 'Controle granular de ações e visualizações.', icon: <SecurityIcon color="primary" />, path: '/permissions' },
        { id: 'audit', title: 'Auditoria', description: 'Rastreie alterações e atividades do sistema.', icon: <HistoryIcon color="primary" />, path: '/audit-logs' },
        { id: 'reviews', title: 'Avaliações', description: 'Feedback e métricas de desempenho da equipe.', icon: <SecurityIcon color="primary" />, path: '/performance-reviews' },
      ]
    },
    {
      id: 'company',
      title: 'Minha Empresa',
      icon: <StoreIcon />,
      items: [
        { id: 'branches', title: 'Filiais e Lojas', description: 'Unidades de negócio e estoques regionais.', icon: <StoreIcon color="success" />, path: '/branches' },
        { id: 'branding', title: 'Identidade Visual', description: 'Logos, cores e personalização da marca.', icon: <PaletteIcon color="success" />, path: '/branding' },
        { id: 'general', title: 'Parâmetros Gerais', description: 'Moeda, fuso horário e regras globais.', icon: <SettingsIcon color="success" />, isComponent: true },
      ]
    },
    {
      id: 'comm',
      title: 'Comunicação',
      icon: <WhatsAppIcon />,
      items: [
        { id: 'whatsapp', title: 'WhatsApp', description: 'Templates e automações de mensagens.', icon: <WhatsAppIcon sx={{ color: '#25D366' }} />, path: '/whatsapp-templates' },
        { id: 'pdf-templates', title: 'Documentos e PDFs', description: 'Layouts de recibos, orçamentos e etiquetas.', icon: <DescriptionIcon color="secondary" />, path: '/templates' },
      ]
    },
    {
      id: 'integrations',
      title: 'Integrações',
      icon: <IntegrationIcon />,
      items: [
        { id: 'marketplaces', title: 'Hub Marketplace', description: 'Mercado Livre, Shopee e plataformas externas.', icon: <StoreIcon color="info" />, path: '/marketplace-sync' },
        { id: 'ecommerce', title: 'E-commerce', description: 'Sincronização com loja virtual própria.', icon: <StoreIcon color="info" />, path: '/ecommerce-sync' },
        { id: 'partner-api', title: 'API & Developers', description: 'Chaves de acesso e webhooks para parceiros.', icon: <RuleIcon color="info" />, path: '/partner-api' },
      ]
    },
    {
      id: 'system',
      title: 'Avançado',
      icon: <DnsIcon />,
      items: [
        { id: 'rules', title: 'Motor de Regras', description: 'Automações lógicas e fluxos de trabalho.', icon: <RuleIcon color="warning" />, path: '/rules-engine' },
        { id: 'health', title: 'Saúde Técnica', description: 'Status dos serviços e logs de erro.', icon: <DnsIcon color="warning" />, path: '/system-health' },
        { id: 'webhooks', title: 'Webhooks', description: 'Eventos em tempo real para o ecossistema.', icon: <WebhookIcon color="warning" />, path: '/webhooks' },
      ]
    }
  ];

  const activeCategory = useMemo(() => 
    categories.find(c => c.id === activeCategoryId) || categories[0],
  [activeCategoryId]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return activeCategory.items;
    const allItems = categories.flatMap(c => c.items);
    return allItems.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, activeCategory]);

  const handleItemClick = (item: SettingItem) => {
    if (item.isComponent) {
      setActiveComponent(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (activeComponent === 'general') {
    return (
      <Box p={4} sx={{ maxWidth: 1200, margin: '0 auto' }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component="button" onClick={() => setActiveComponent(null)} underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.9rem', fontWeight: 600 }}>
            <SettingsIcon sx={{ fontSize: 16 }} /> Configurações
          </MuiLink>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }} color="text.primary">Gerais</Typography>
        </Breadcrumbs>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, mb: 4, letterSpacing: '-1px' }}>Configurações Gerais</Typography>
        <GeneralSettings />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      {/* Header Minimalista */}
      <Box sx={{ p: 3, pb: 1, maxWidth: 1600, margin: '0 auto', width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Ajustes</Typography>
            <Typography variant="caption" color="text.secondary">Configurações globais do ecossistema</Typography>
          </Box>
          <TextField
            placeholder="Filtrar..."
            size="small"
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              disableUnderline: false,
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', maxWidth: 1600, margin: '0 auto', width: '100%', px: 3, pb: 3 }}>
        {/* Sidebar Slim */}
        {!isMobile && !searchTerm && (
          <Box sx={{ width: 240, pr: 3, pt: 1 }}>
            <List sx={{ p: 0 }}>
              {categories.map((cat) => (
                <ListItemButton
                  key={cat.id}
                  selected={activeCategoryId === cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  sx={{ 
                    borderRadius: '8px', 
                    mb: 0.5, 
                    py: 1,
                    transition: 'all 0.2s',
                    color: activeCategoryId === cat.id ? 'primary.main' : 'text.secondary',
                    bgcolor: 'transparent',
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'action.hover' },
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    },
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                    {React.cloneElement(cat.icon as React.ReactElement, { sx: { fontSize: 20 } })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={cat.title} 
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: activeCategoryId === cat.id ? 700 : 500 }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        {/* Área de Conteúdo Focada - Coluna Única */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={searchTerm ? 'search' : activeCategoryId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%', maxWidth: '800px' }} // Limita a largura para não esticar demais
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {searchTerm ? `Resultados para "${searchTerm}"` : activeCategory.title}
                </Typography>
                <Divider sx={{ flexGrow: 1, opacity: 0.4 }} />
              </Box>

              <Grid container spacing={1.5}>
                {filteredItems.map((item, idx) => (
                  <Grid size={{ xs: 12 }} key={item.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card 
                        elevation={0}
                        sx={{ 
                          borderRadius: '12px', 
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            transform: 'translateX(4px)' // Efeito de deslize lateral no hover
                          }
                        }}
                      >
                        <CardActionArea 
                          onClick={() => handleItemClick(item)} 
                          sx={{ p: 1 }}
                        >
                          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: '12px !important', px: 2 }}>
                            <Box sx={{ 
                              width: 40,
                              height: 40,
                              borderRadius: '8px', 
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              opacity: 0.8
                            }}>
                              {React.cloneElement(item.icon as React.ReactElement, { sx: { fontSize: 20, color: 'inherit' } })}
                            </Box>
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 700, 
                                  lineHeight: 1.2, 
                                  mb: 0.2,
                                  fontSize: '0.95rem'
                                }}
                              >
                                {item.title}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  display: 'block',
                                  fontSize: '0.8rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {item.description}
                              </Typography>
                            </Box>
                            <ArrowIcon sx={{ fontSize: 14, color: 'text.disabled', opacity: 0.5 }} />
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;