import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styled from 'styled-components';

export const GlowCard = styled(motion.div)`
  position: relative;
  border-radius: 24px;
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      600px circle at var(--mouse-x) var(--mouse-y),
      ${({ theme }) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'},
      transparent 40%
    );
    z-index: 0;
    pointer-events: none;
  }
`;

export const InteractiveGlow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    
    // Update CSS variables for the pseudo-element
    (currentTarget as HTMLElement).style.setProperty("--mouse-x", `${clientX - left}px`);
    (currentTarget as HTMLElement).style.setProperty("--mouse-y", `${clientY - top}px`);
  }

  return (
    <GlowCard
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </GlowCard>
  );
};
