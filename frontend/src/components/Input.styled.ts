
import styled, { css } from 'styled-components';

export const InputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const InputLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
  font-family: ${({ theme }) => theme.typography.primaryFont};
  font-size: 14px; // Body Medium
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme, $hasError }) => ($hasError ? theme.colors.error : `${theme.colors.onSurface}33`)}; // 20% opacity
  border-radius: 4px; // Small radius
  font-family: ${({ theme }) => theme.typography.primaryFont};
  font-size: 14px; // Body Medium
  color: ${({ theme }) => theme.colors.onSurface};
  background-color: ${({ theme }) => theme.colors.surface};
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 2px ${({ theme, $hasError }) => ($hasError ? `${theme.colors.error}33` : `${theme.colors.primary}33`)};
  }
`;

export const InputErrorMessage = styled.span`
  font-family: ${({ theme }) => theme.typography.primaryFont};
  font-size: 12px; // Body Small
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xxs};
  display: block;
`;
