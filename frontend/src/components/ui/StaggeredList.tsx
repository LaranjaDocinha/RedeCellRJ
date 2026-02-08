import React from 'react';
import { motion } from 'framer-motion';

interface StaggeredContainerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({ 
  children, 
  delay = 0.05,
  className 
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggeredItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const item = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    },
  };

  return <motion.div variants={item}>{children}</motion.div>;
};
