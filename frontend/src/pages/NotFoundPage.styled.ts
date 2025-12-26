import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

export const StyledNotFoundContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => 
    theme.palette.mode === 'light' 
      ? `radial-gradient(circle at center, #ffffff 0%, #f0f2f5 100%)`
      : `radial-gradient(circle at center, #1a202c 0%, #0a0c10 100%)`
  };
  color: ${({ theme }) => theme.palette.text.primary};
  text-align: center;
  padding: 2rem;
  overflow: hidden;
  position: relative;
`;

export const IconWrapper = styled(motion.div)`
  margin-bottom: 2rem;
  filter: drop-shadow(0 0 20px ${({ theme }) => theme.palette.primary.main}44);
`;

export const StyledNotFoundTitle = styled(motion.h1)`
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 300; /* Light weight as per user preference */
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, ${({ theme }) => theme.palette.primary.main} 0%, ${({ theme }) => theme.palette.primary.dark} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
  letter-spacing: -5px;
`;

export const StyledNotFoundSubtitle = styled(motion.h2)`
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.palette.text.primary};
`;

export const StyledNotFoundMessage = styled(motion.p)`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: 3rem;
  max-width: 500px;
  line-height: 1.6;
`;

export const ButtonContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const ActionButton = styled(Button)`
  && {
    padding: 0.8rem 2rem;
    border-radius: 12px;
    text-transform: none;
    font-size: 1rem;
    font-weight: 400; /* No bold */
    box-shadow: ${({ theme }) => theme.customShadows.elevation2};
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.customShadows.elevation3};
    }
  }
`;

export const FloatingShape = styled(motion.div)<{ size: string; color: string; blur: string }>`
  position: absolute;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background: ${({ color }) => color};
  filter: blur(${({ blur }) => blur});
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.1;
`;

export const DecorationCircle = styled(motion.div)<{ size: string; top?: string; left?: string; right?: string; bottom?: string; color: string }>`
  position: absolute;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  top: ${({ top }) => top};
  left: ${({ left }) => left};
  right: ${({ right }) => right};
  bottom: ${({ bottom }) => bottom};
  border-radius: 50%;
  background: ${({ color }) => color};
  filter: blur(80px);
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
`;
