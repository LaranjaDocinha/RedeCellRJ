import React from 'react';
import { Box, Typography, ButtonBase, Paper, useTheme } from '@mui/material';
import { Part } from '../../types/part';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const QuickPickButton = styled(ButtonBase)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  transition: all 0.2s ease;
  width: 100%;
  height: 100%;

  &:hover {
    border-color: ${({ theme }) => theme.palette.primary.main};
    background-color: ${({ theme }) => theme.palette.action.hover};
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows[4]};
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.palette.primary.light}20;
  color: ${({ theme }) => theme.palette.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 400;
`;

interface QuickPickGridProps {
  products: Part[];
  onProductClick: (product: Part) => void;
}

const QuickPickGrid: React.FC<QuickPickGridProps> = ({ products, onProductClick }) => {
  const theme = useTheme();
  
  // Limitar aos 12 primeiros produtos ou os mais vendidos no futuro
  const quickPicks = products.slice(0, 12);

  return (
    <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
      <Typography variant="overline" sx={{ fontWeight: 400, color: 'text.secondary', mb: 2, display: 'block' }}>
        Mais Vendidos / Quick Picks
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
        gap: 2 
      }}>
        {quickPicks.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <QuickPickButton onClick={() => onProductClick(product)}>
              <IconWrapper>
                {product.name.charAt(0)}
              </IconWrapper>
              <Typography variant="body2" sx={{ fontWeight: 400, textAlign: 'center', lineHeight: 1.2 }}>
                {product.name}
              </Typography>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 400, mt: 0.5 }}>
                R$ {Number(product.price || 0).toFixed(2)}
              </Typography>
            </QuickPickButton>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default QuickPickGrid;
