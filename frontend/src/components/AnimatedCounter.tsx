import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (val: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 1.5,
  format = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      onUpdate: (latest) => setCount(latest),
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{format(count)}</>;
};