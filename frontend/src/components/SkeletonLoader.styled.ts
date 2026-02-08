import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

interface StyledSkeletonLoaderProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export const StyledSkeletonLoader = styled(motion.div)<StyledSkeletonLoaderProps>`
  background-color: ${({ theme }) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
  display: inline-block;
  position: relative;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.medium}; // Modern rounding

  // The Shimmer Effect Overlay
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      ${({ theme }) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)'} 20%,
      ${({ theme }) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)'} 60%,
      rgba(255, 255, 255, 0)
    );
    animation: ${shimmer} 2s infinite cubic-bezier(0.4, 0.0, 0.2, 1); // Natural ease
  }

  ${({ variant }) =>
    variant === 'text' &&
    css`
      height: 1.2em; // Matches updated Airy line-height
      width: 100%;
      margin-bottom: 0.8em;
      border-radius: 6px;
    `}

  ${({ variant }) =>
    variant === 'circle' &&
    css`
      border-radius: 50%;
      width: 48px;
      height: 48px;
    `}

  ${({ width }) => width && `width: ${width};`}
  ${({ height }) => height && `height: ${height};`}
`;
