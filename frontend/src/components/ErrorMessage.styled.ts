import styled from 'styled-components';

export const ErrorMessageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.error}1A; // 10% opacity
  border: 1px solid ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.spacing.xxs};
  margin: ${({ theme }) => theme.spacing.xs} 0;
  font-family: ${({ theme }) => theme.typography.primaryFont};
`;

export const ErrorMessageText = styled.p`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
`;

export const ErrorMessageDetails = styled.p`
  font-size: 0.9em;
  color: ${({ theme }) => theme.colors.error};
`;
