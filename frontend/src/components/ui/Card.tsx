import React from 'react';
import styled from 'styled-components';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  padding?: string;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  variant?: 'default' | 'glass' | 'outlined' | 'gradient';
  children: React.ReactNode;
}

// Map elevations to box-shadows
const elevations = {
  none: 'none',
  low: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  medium: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  high: '0px 10px 24px rgba(0, 0, 0, 0.15)',
};

const getBackground = (variant?: string) => {
  switch (variant) {
    case 'glass':
      return 'rgba(255, 255, 255, 0.7)';
    case 'gradient':
      return 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)';
    case 'outlined':
      return 'transparent';
    default:
      return '#ffffff';
  }
};

const StyledCard = styled(motion.div)<{ $padding?: string; $elevation?: string; $variant?: string }>`
  background: ${(props) => getBackground(props.$variant)};
  border-radius: 16px;
  padding: ${(props) => props.$padding || '24px'};
  box-shadow: ${(props) => (props.$elevation ? elevations[props.$elevation as keyof typeof elevations] : elevations.medium)};
  border: ${(props) => (props.$variant === 'outlined' ? '1px solid #e0e0e0' : '1px solid rgba(255,255,255,0.5)')};
  backdrop-filter: ${(props) => (props.$variant === 'glass' ? 'blur(12px)' : 'none')};
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0px 15px 35px rgba(0, 0, 0, 0.12);
  }
`;

export const Card: React.FC<CardProps> = ({ 
  children, 
  padding, 
  elevation = 'medium', 
  variant = 'default', 
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.4, ease: 'easeOut' },
  ...props 
}) => {
  return (
    <StyledCard
      $padding={padding}
      $elevation={elevation}
      $variant={variant}
      initial={initial}
      animate={animate}
      transition={transition}
      {...props}
    >
      {children}
    </StyledCard>
  );
};
