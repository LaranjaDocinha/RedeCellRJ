import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Box, Paper, Typography } from '@mui/material';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const StyledPageContainer = styled(Box)`
  background: ${({ theme }) => theme.palette.mode === 'dark' 
    ? `radial-gradient(circle at 50% 0%, #1e1e1e 0%, ${theme.palette.background.default} 100%)` 
    : 'radial-gradient(circle at 50% 0%, #e3f2fd 0%, #f5f5f5 100%)'};
  min-height: 100vh;
  padding: 2rem;
`;

export const GlassCard = styled(motion.create(Paper))`
  background: ${({ theme }) => theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.palette.primary.main}40;
  }
`;

export const XPProgressBar = styled(Box)<{ $progress: number }>`
  height: 12px;
  width: 100%;
  background: ${({ theme }) => theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'};
  border-radius: 6px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ $progress }) => $progress}%;
    background: linear-gradient(90deg, #2196f3, #00bcd4, #2196f3);
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
    border-radius: 6px;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const RankBadge = styled(Box)<{ $color: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  font-weight: 400;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid ${({ $color }) => $color}40;
`;

export const LeaderboardItem = styled(motion.create('div'))<{ $isUser: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
  background: ${({ $isUser, theme }) => $isUser 
    ? (theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)')
    : 'transparent'};
  border-radius: 16px;
  margin-bottom: 0.5rem;
  border: 1px solid ${({ $isUser, theme }) => $isUser ? theme.palette.primary.main : 'transparent'};
`;

export const MissionCard = styled(GlassCard)`
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle at top right, ${({ theme }) => theme.palette.primary.main}10, transparent 70%);
    pointer-events: none;
  }
`;

export const FloatingIcon = styled(motion.create('div'))`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.1));
`;

export const StatValue = styled(Typography)`
  font-weight: 400 !important;
  letter-spacing: -1px;
  background: linear-gradient(135deg, ${({ theme }) => theme.palette.primary.main}, ${({ theme }) => theme.palette.secondary.main});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;