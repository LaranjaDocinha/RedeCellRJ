import React from 'react';
import styled from 'styled-components';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import { Close, Dashboard, ShoppingCart, Build, Person, Print } from '@mui/icons-material';
import { IconButton, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const BarContainer = styled.div`
  display: flex;
  background: ${({ theme }) => alpha(theme.palette.background.paper, 0.8)};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 5px 10px;
  gap: 5px;
  position: sticky;
  top: 64px;
  z-index: 1000;
  overflow-x: auto;
  &::-webkit-scrollbar { height: 0; }
`;

const TabItem = styled(motion.div)<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 15px;
  background: ${props => props.active ? props.theme.palette.primary.main : 'transparent'};
  color: ${props => props.active ? props.theme.palette.primary.contrastText : props.theme.palette.text.secondary};
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.85rem;
  border: 1px solid ${props => props.active ? 'transparent' : 'rgba(0,0,0,0.05)'};

  &:hover {
    background: ${props => props.active ? props.theme.palette.primary.main : alpha(props.theme.palette.primary.main, 0.1)};
  }
`;

const WorkspaceBar: React.FC = () => {
  const { tabs, activeTabId, removeTab } = useWorkspace();
  const navigate = useNavigate();

  const getIcon = (path: string) => {
    if (path.includes('dashboard')) return <Dashboard sx={{ fontSize: 16 }} />;
    if (path.includes('pos')) return <ShoppingCart sx={{ fontSize: 16 }} />;
    if (path.includes('service-orders')) return <Build sx={{ fontSize: 16 }} />;
    if (path.includes('customers')) return <Person sx={{ fontSize: 16 }} />;
    if (path.includes('print')) return <Print sx={{ fontSize: 16 }} />;
    return null;
  };

  if (tabs.length === 0) return null;

  return (
    <BarContainer>
      {tabs.map((tab) => (
        <TabItem 
            key={tab.id} 
            active={tab.id === activeTabId}
            onClick={() => navigate(tab.path)}
            whileTap={{ scale: 0.95 }}
        >
          {getIcon(tab.path)}
          {tab.label}
          <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
            sx={{ color: 'inherit', p: 0.2, ml: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}
          >
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </TabItem>
      ))}
    </BarContainer>
  );
};

export default WorkspaceBar;
