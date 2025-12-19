import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box sx={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', mb: 2 }}>
      <Box
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ExpandMoreIcon />
        </motion.div>
      </Box>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <Box sx={{ padding: '16px' }}>{children}</Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};