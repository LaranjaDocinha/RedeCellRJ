import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IconMorphProps {
  icon: React.ReactNode;
  keyId: string;
}

export const IconMorph: React.FC<IconMorphProps> = ({ icon, keyId }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={keyId}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {icon}
      </motion.div>
    </AnimatePresence>
  );
};
