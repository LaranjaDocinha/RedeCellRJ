import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ size = 24, color = '#fff' }) => {
  const spinnerVariants = {
    start: {
      rotate: 0,
      scale: 0.8, // Começa um pouco menor
    },
    end: {
      rotate: 360,
      scale: 1, // Aumenta para o tamanho normal
      transition: {
        loop: Infinity,
        ease: 'easeInOut', // Easing mais suave
        duration: 1.2, // Duração um pouco maior
        repeatDelay: 0.1, // Pequeno atraso antes de repetir
      },
    },
  };

  return (
    <motion.div
      animate='end'
      className='loading-spinner'
      style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }}
      variants={spinnerVariants}
    />
  );
};

export default LoadingSpinner;
