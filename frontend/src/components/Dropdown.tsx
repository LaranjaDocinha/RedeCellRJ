import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@mui/material';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Box onClick={() => setIsOpen(!isOpen)} sx={{ cursor: 'pointer' }}>
        {trigger}
      </Box>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 1000,
              marginTop: '8px',
              backgroundColor: 'white',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Dropdown;
