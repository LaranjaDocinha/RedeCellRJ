import React from 'react';
import { motion } from 'framer-motion';
import { useCartAnimation } from '../contexts/CartAnimationContext';

interface FlyingProductProps {
  targetRect?: DOMRect;
}

export const FlyingProduct: React.FC<FlyingProductProps> = ({ targetRect }) => {
  const { animationState } = useCartAnimation();
  const { animating, imageUrl, startRect } = animationState;

  if (!animating || !startRect || !targetRect || !imageUrl) {
    return null;
  }

  const variants = {
    initial: {
      opacity: 1,
      top: startRect.top,
      left: startRect.left,
      width: startRect.width,
      height: startRect.height,
      borderRadius: '8px',
    },
    animate: {
      top: targetRect.top + targetRect.height / 2,
      left: targetRect.left + targetRect.width / 2,
      width: 0,
      height: 0,
      opacity: 0.5,
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
  };

  return (
    <motion.div
      style={{
        position: 'fixed',
        zIndex: 9999,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      initial="initial"
      animate="animate"
      variants={variants}
    />
  );
};
