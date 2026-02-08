import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  alpha,
  useTheme,
  Paper
} from '@mui/material';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  Badge as BadgeIcon,
  Settings as SettingsIcon,
  Dns as DnsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes unificados
import GeneralSettings from './GeneralSettings';
import UserList from '../components/UserList';
import RoleList from '../components/RoleList';
import PermissionList from '../components/PermissionList';
import AuditLogsPage from './AuditLogsPage'; // Reutilizamos a página inteira como aba
import SystemHealthPage from './SystemHealthPage';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Geral', icon: <SettingsIcon />, component: <GeneralSettings /> },
    { label: 'Usuários', icon: <PeopleIcon />, component: <UserList /> },
    { label: 'Cargos', icon: <BadgeIcon />, component: <RoleList /> },
    { label: 'Permissões', icon: <SecurityIcon />, component: <PermissionList /> },
    { label: 'Auditoria', icon: <HistoryIcon />, component: <AuditLogsPage /> }, 
    { label: 'Saúde', icon: <DnsIcon />, component: <SystemHealthPage /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
            <Typography variant="h4" fontWeight={400} sx={{ letterSpacing: '-1.5px', background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Configurações do Ecossistema
            </Typography>
            <Typography variant="body2" color="text.secondary">Controle administrativo e técnico centralizado</Typography>
        </Box>
      </Stack>

      <Paper sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: theme.shadows[4] }}>
        <Tabs 
            value={activeTab} 
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
                px: 2, 
                pt: 1, 
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderBottom: `1px solid ${theme.palette.divider}`
            }}
        >
            {tabs.map((tab, idx) => (
                <Tab 
                    key={idx} 
                    label={tab.label} 
                    icon={tab.icon} 
                    iconPosition="start" 
                    sx={{ fontWeight: 400, minHeight: 60 }} 
                />
            ))}
        </Tabs>

        <Box sx={{ p: 4 }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                >
                    {tabs[activeTab].component}
                </motion.div>
            </AnimatePresence>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
