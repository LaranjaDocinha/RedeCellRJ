import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MotionWrapperProps {
  children: React.ReactNode;
  enableTilt?: boolean; // Se deve ativar o efeito 3D de inclinação
  scaleOnHover?: number; // Quanto deve crescer no hover (ex: 1.05)
  className?: string;
  onClick?: () => void;
}

/**
 * Wrapper de alta performance para micro-interações orgânicas.
 * Aplica física de mola (Spring Physics) e efeito de inclinação 3D opcional.
 */
export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  enableTilt = false,
  scaleOnHover = 1.02,
  className,
  onClick,
}) => {
  // Tilt Logic
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Física da mola para suavizar o movimento do mouse
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Transforma posição do mouse em rotação
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !enableTilt) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!enableTilt) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: scaleOnHover }}
      whileTap={{ scale: 0.98 }}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }} // Organic snap
    >
      {children}
    </motion.div>
  );
};
