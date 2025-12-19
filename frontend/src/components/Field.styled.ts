import styled from 'styled-components';

export const FormFieldContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const FieldLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
  font-family: ${({ theme }) => theme.typography.primaryFont};
  font-size: 14px; // Body Medium
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const ErrorMessageText = styled.p`
  font-family: ${({ theme }) => theme.typography.primaryFont};
  font-size: 12px; // Body Small
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xxs};
  display: block;
`;
