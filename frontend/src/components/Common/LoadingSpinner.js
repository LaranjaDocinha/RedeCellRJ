
import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ size = 24, color = '#fff' }) => {
  const spinnerVariants = {
    start: {
      rotate: 0,
    },
    end: {
      rotate: 360,
      transition: {
        loop: Infinity,
        ease: 'linear',
        duration: 1,
      },
    },
  };

  return (
    <motion.div
      className="loading-spinner"
      style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }}
      variants={spinnerVariants}
      animate="end"
    />
  );
};

export default LoadingSpinner;
