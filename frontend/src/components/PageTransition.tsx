import React from 'react';
import { motion } from 'framer-motion';
import { useAnimationPreference } from '../contexts/AnimationPreferenceContext'; // Importar o hook

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { prefersReducedMotion } = useAnimationPreference();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : '-100%',
      scale: prefersReducedMotion ? 1 : 0.9,
    },
    in: { opacity: 1, x: 0, scale: 1 },
    out: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : '100%',
      scale: prefersReducedMotion ? 1 : 0.9,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: prefersReducedMotion ? 0.2 : 0.5, // Duração menor para movimento reduzido
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
