import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
  100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
`;

const timerGlow = keyframes`
  0% { text-shadow: 0 0 5px rgba(33, 150, 243, 0.5); }
  50% { text-shadow: 0 0 15px rgba(33, 150, 243, 0.8); }
  100% { text-shadow: 0 0 5px rgba(33, 150, 243, 0.5); }
`;

export const BoardContainer = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  overflow-x: auto;
  height: calc(100vh - 280px);
  align-items: flex-start;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar { height: 8px; }
  &::-webkit-scrollbar-thumb { 
    background: ${({ theme }) => alpha(theme.palette.primary.main, 0.2)}; 
    border-radius: 10px; 
  }
`;

export const ColumnContainer = styled(motion.div)<{ $isOverLimit?: boolean; $color?: string }>`
  min-width: 340px;
  max-width: 340px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme, $isOverLimit }) => $isOverLimit 
    ? alpha(theme.palette.error.main, 0.05)
    : theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.8)'};
  backdrop-filter: blur(12px);
  border-radius: 28px;
  border: 1px solid ${({ theme, $isOverLimit, $color }) => 
    $isOverLimit ? theme.palette.error.main : $color ? alpha($color, 0.3) : alpha(theme.palette.divider, 0.1)};
  padding: 1.25rem;
  position: relative;
  transition: all 0.3s ease;
`;

export const ColumnFooterValue = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px dashed ${({ theme }) => theme.palette.divider};
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0.8;
`;

export const CardContainer = styled(motion.div)<{ 
  $priority?: string; 
  $isAging?: boolean; 
  $color?: string;
  $isSelected?: boolean;
  $complexity?: string;
}>`
  background: ${({ theme }) => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'};
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: ${({ $isSelected }) => $isSelected ? '0 0 0 2px #1976d2, 0 12px 24px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  cursor: grab;
  position: relative;
  border: 1px solid ${({ $isSelected, theme }) => $isSelected ? '#1976d2' : alpha(theme.palette.divider, 0.1)};
  
  /* #19 Badge de Complexidade */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    background: ${({ $complexity, theme }) => 
      $complexity === 'hard' ? theme.palette.error.main : 
      $complexity === 'medium' ? theme.palette.warning.main : 'transparent'};
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.2;
    border-radius: 0 20px 0 0;
  }

  ${({ $priority }) => $priority === 'critical' && css`
    animation: ${pulse} 2s infinite;
    border: 1px solid #d32f2f;
  `}

  ${({ $isAging }) => $isAging && css`
    filter: saturate(0.5) contrast(0.8);
    background: ${({ theme }) => alpha(theme.palette.action.disabledBackground, 0.1)};
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.12);
  }
`;

export const TimerDisplay = styled.div<{ $isActive: boolean }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 900;
  color: ${({ $isActive, theme }) => $isActive ? theme.palette.primary.main : theme.palette.text.disabled};
  display: flex;
  align-items: center;
  gap: 4px;
  ${({ $isActive }) => $isActive && css`animation: ${timerGlow} 2s infinite;`}
`;

export const SLABar = styled.div<{ $percent: number; $color: string }>`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => alpha(theme.palette.divider, 0.1)};
  border-radius: 2px;
  margin-top: 12px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ $percent }) => $percent}%;
    background: ${({ $color }) => $color};
    transition: width 0.5s ease;
  }
`;

export const FloatingNote = styled.div`
  background: #fef9c3;
  color: #854d0e;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 700;
  margin-top: 8px;
  border-left: 3px solid #eab308;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;
