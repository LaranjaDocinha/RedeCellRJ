import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  useTheme,
  Breadcrumbs,
  Link,
  Container
} from '@mui/material';
import {
  AssignmentReturn as ReturnIcon,
  MoneyOff as RefundIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ReturnsPage from './ReturnsPage';
import ExpenseReimbursementsPage from './ExpenseReimbursementsPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ReturnsAndRefundsPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* Header Area */}
      <Box 
        sx={{ 
          bgcolor: 'background.paper', 
          pt: 4, 
          pb: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          mb: 4
        }}
      >
        <Container maxWidth="xl">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
            <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary">Retornos e Reembolsos</Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" sx={{ mb: 3 }}>
            Gestão de Devoluções e Reembolsos
          </Typography>

          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
              },
              '& .MuiTab-root': {
                fontSize: '0.95rem',
                textTransform: 'none',
                minWidth: 160,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              }
            }}
          >
            <Tab 
              icon={<ReturnIcon sx={{ mr: 1 }} />} 
              iconPosition="start" 
              label="Devoluções (Clientes)" 
            />
            <Tab 
              icon={<RefundIcon sx={{ mr: 1 }} />} 
              iconPosition="start" 
              label="Reembolso de Despesas" 
            />
          </Tabs>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth="xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CustomTabPanel value={activeTab} index={0}>
              <ReturnsPage />
            </CustomTabPanel>
            <CustomTabPanel value={activeTab} index={1}>
              <ExpenseReimbursementsPage />
            </CustomTabPanel>
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default ReturnsAndRefundsPage;