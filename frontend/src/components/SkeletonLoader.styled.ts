
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

interface StyledSkeletonLoaderProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export const StyledSkeletonLoader = styled(motion.div)<StyledSkeletonLoaderProps>`
  background-color: ${({ theme }) => theme.colors.onSurface}1A; // Light gray for skeleton
  background-image: linear-gradient(
    to right,
    ${({ theme }) => theme.colors.onSurface}1A 0%,
    ${({ theme }) => theme.colors.onSurface}33 20%,
    ${({ theme }) => theme.colors.onSurface}1A 40%
  );
  background-repeat: no-repeat;
  background-size: 1000px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 4px;

  ${({ variant }) =>
    variant === 'text' &&
    css`
      height: 1em;
      width: 100%;
      margin-bottom: 0.5em;
    `}

  ${({ variant }) =>
    variant === 'circle' &&
    css`
      border-radius: 50%;
      width: 50px;
      height: 50px;
    `}

  ${({ width }) => width && `width: ${width};`}
  ${({ height }) => height && `height: ${height};`}
`;
