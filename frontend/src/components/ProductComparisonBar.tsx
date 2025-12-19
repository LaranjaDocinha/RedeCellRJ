import React from 'react';
import { Box, Button, Chip, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useProductComparison } from '../hooks/useProductComparison';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export const ProductComparisonBar: React.FC = () => {
  const { comparisonList, removeProductFromComparison, clearComparisonList } = useProductComparison();
  const navigate = useNavigate();

  if (comparisonList.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200, // Above most content, below modals
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0px -2px 10px rgba(0,0,0,0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ mr: 2 }}>
          Comparar ({comparisonList.length} produtos):
        </Typography>
        <AnimatePresence>
          {comparisonList.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Chip
                label={product.name}
                onDelete={() => removeProductFromComparison(product.id)}
                sx={{ color: 'white', borderColor: 'white' }}
                variant="outlined"
                deleteIcon={<CloseIcon sx={{ color: 'white' }} />}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/products/compare')}
          disabled={comparisonList.length < 2}
        >
          Comparar Agora ({comparisonList.length})
        </Button>
        <Button variant="outlined" color="inherit" onClick={clearComparisonList} sx={{ color: 'white', borderColor: 'white' }}>
          Limpar
        </Button>
      </Box>
    </motion.div>
  );
};
