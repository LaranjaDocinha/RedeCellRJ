import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(var(--pulse-color), 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0);
  }
`;

const PulseDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  background: ${({ $color }) => $color};
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  animation: ${pulse} 2s infinite;
  
  // Extração de RGB simplificada para o box-shadow
  --pulse-color: ${({ $color }) => $color.includes('#') ? '25, 118, 210' : '76, 175, 80'}; 
`;

interface LivePulseProps {
  color?: 'success' | 'error' | 'warning' | 'info' | string;
}

export const LivePulse: React.FC<LivePulseProps> = ({ color = '#4caf50' }) => {
  const colorMap: Record<string, string> = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  };

  const finalColor = colorMap[color] || color;

  return <PulseDot $color={finalColor} />;
};
