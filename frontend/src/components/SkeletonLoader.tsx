import React from 'react';
import { StyledSkeletonLoader } from './SkeletonLoader.styled';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circle' | 'rect';
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  variant = 'rect',
  className,
}) => {
  return (
    <StyledSkeletonLoader
      width={width}
      height={height}
      variant={variant}
      className={className}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
    />
  );
};

export default SkeletonLoader;
