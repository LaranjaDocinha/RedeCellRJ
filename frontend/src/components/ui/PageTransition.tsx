import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 8,
    scale: 0.995,
    filter: 'blur(4px)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: 'blur(0px)'
  },
  exit: { 
    opacity: 0, 
    y: -8,
    scale: 0.995,
    filter: 'blur(4px)'
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'circOut',
  duration: 0.3,
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
};
