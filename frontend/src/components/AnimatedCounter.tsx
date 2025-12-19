import React, { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, prefix = 'R$ ', decimals = 2 }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const from = parseFloat(node.textContent?.replace(prefix, '').replace(',', '.') || '0');
    
    const controls = animate(from, value, {
      duration: 0.5,
      onUpdate(latest) {
        node.textContent = `${prefix}${latest.toFixed(decimals)}`;
      }
    });

    return () => controls.stop();
  }, [value, prefix, decimals]);

  return <motion.span ref={nodeRef} />;
};

export default AnimatedCounter;
