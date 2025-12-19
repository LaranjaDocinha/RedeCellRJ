import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 2000;
`;

export const SearchContainer = styled(motion.div)`
  width: 100%;
  max-width: 600px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

export const SearchInputWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}22;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  svg {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.onSurface}99;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.onSurface};

  &:focus {
    outline: none;
  }
`;

export const ResultsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

export const ResultGroupTitle = styled.h4`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin: 0;
  color: ${({ theme }) => theme.colors.onSurface}99;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ResultItem = styled.div<{ isSelected: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background: ${theme.colors.primary}22;
    `}

  &:hover {
    background: ${({ theme }) => theme.colors.primary}11;
  }
`;

export const NoResults = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.onSurface}99;
`;
