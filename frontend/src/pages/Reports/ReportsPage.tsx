import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Divider,
  useTheme,
  alpha,
  Stack,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { 
  FaChartLine, 
  FaWrench, 
  FaBoxes, 
  FaUsers, 
  FaShieldAlt, 
  FaFileExport, 
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaInfoCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'react-apexcharts';

// Componentes de Relatórios (serão criados nos próximos passos)
import FinanceReports from './components/FinanceReports';
import OSReports from './components/OSReports';
import InventoryReports from './components/InventoryReports';
import SalesReports from './components/SalesReports';
import AuditReports from './components/AuditReports';

type ReportCategory = 'finance' | 'os' | 'inventory' | 'sales' | 'audit';

const ReportsPage: React.FC = () => {
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('finance');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const categories = [
    { id: 'finance', label: 'Financeiro', icon: <FaChartLine />, color: theme.palette.success.main },
    { id: 'os', label: 'Assistência Técnica', icon: <FaWrench />, color: theme.palette.primary.main },
    { id: 'inventory', label: 'Estoque', icon: <FaBoxes />, color: theme.palette.warning.main },
    { id: 'sales', label: 'Vendas & Clientes', icon: <FaUsers />, color: theme.palette.info.main },
    { id: 'audit', label: 'Auditoria & RH', icon: <FaShieldAlt />, color: theme.palette.error.main },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      
      {/* Sidebar de Navegação de BI */}
      <Paper 
        elevation={0}
        sx={{ 
          width: isSidebarOpen ? 280 : 80, 
          borderRight: '1px solid', 
          borderColor: 'divider',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
          {isSidebarOpen && <Typography variant="h6" fontWeight={800}>Intelligence BI</Typography>}
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaFilter size={16} />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List sx={{ px: 1.5, py: 2 }}>
          {categories.map((cat) => (
            <ListItem key={cat.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id as ReportCategory)}
                sx={{
                  borderRadius: '12px',
                  color: activeCategory === cat.id ? cat.color : 'text.secondary',
                  bgcolor: activeCategory === cat.id ? alpha(cat.color, 0.1) : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: alpha(cat.color, 0.15),
                    '&:hover': { bgcolor: alpha(cat.color, 0.2) }
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {cat.icon}
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary={cat.label} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ mt: 'auto', p: 3 }}>
          {isSidebarOpen && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
                EXPORTAÇÃO GLOBAL
              </Typography>
              <Button fullWidth variant="contained" size="small" startIcon={<FaFileExport />} sx={{ borderRadius: '8px' }}>
                Relatório Full
              </Button>
            </Paper>
          )}
        </Box>
      </Paper>

      {/* Área Principal do Relatório */}
      <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
        
        {/* Header Dinâmico */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 1 }}>
            <Link underline="hover" color="inherit" href="/">Home</Link>
            <Typography color="text.primary">Relatórios</Typography>
            <Typography color="primary" fontWeight={700}>
              {categories.find(c => c.id === activeCategory)?.label}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4" fontWeight={900} letterSpacing="-1px">
            {categories.find(c => c.id === activeCategory)?.label} Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Insights avançados e métricas de performance em tempo real.
          </Typography>
        </Box>

        {/* Renderização Condicional do Conteúdo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Aqui entrarão os componentes específicos de cada categoria */}
            {activeCategory === 'finance' && <FinanceReports />}
            {activeCategory === 'os' && <OSReports />}
            {activeCategory === 'inventory' && <InventoryReports />}
            {activeCategory === 'sales' && <SalesReports />}
            {activeCategory === 'audit' && <AuditReports />}
          </motion.div>
        </AnimatePresence>

      </Box>
    </Box>
  );
};



export default ReportsPage;