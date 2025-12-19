import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

interface ThemeToggleProps {
  onToggle?: () => void;
  isDarkTheme?: boolean;
}

const ToggleContainer = styled(motion.button)`
  background: ${props => (props.theme.isDarkTheme ? '#333' : '#eee')};
  border: 2px solid ${props => (props.theme.isDarkTheme ? '#555' : '#ccc')};
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  font-size: 0.8rem;
  justify-content: ${props => (props.theme.isDarkTheme ? 'flex-end' : 'flex-start')};
  align-items: center;
  padding: 5px;
  width: 60px;
  height: 30px;
  position: relative;
  transition: background 0.3s ease;
`;

const ToggleThumb = styled(motion.div)`
  background: ${props => (props.theme.isDarkTheme ? '#fff' : '#333')};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  transition: background 0.3s ease;
`;

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ onToggle, isDarkTheme }) => {
  return (
    <ToggleContainer
      onClick={onToggle}
      initial={false}
      animate={{ justifyContent: isDarkTheme ? 'flex-end' : 'flex-start' }}
      transition={{ duration: 0.2 }}
    >
      <ToggleThumb
        initial={false}
        animate={{ background: isDarkTheme ? '#fff' : '#333' }}
        transition={{ duration: 0.2 }}
      />
    </ToggleContainer>
  );
};
