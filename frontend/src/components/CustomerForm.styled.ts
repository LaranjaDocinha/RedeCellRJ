import styled from 'styled-components';
import { motion } from 'framer-motion';

export const StyledForm = styled(motion.create('form'))`
  background-color: ${({ theme }) => theme.palette.background.paper};
  box-shadow: ${({ theme }) => theme.shadows[1]};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const StyledFormField = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StyledLabel = styled('label')`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: 4px;
`;

export const StyledInput = styled('input')`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 12px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  color: ${({ theme }) => theme.palette.text.primary};
  background-color: ${({ theme }) => theme.palette.background.default};
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.palette.primary.main}20;
  }
`;

export const StyledTextArea = styled('textarea')`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 12px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  color: ${({ theme }) => theme.palette.text.primary};
  background-color: ${({ theme }) => theme.palette.background.default};
  transition: all 0.2s ease-in-out;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.palette.primary.main}20;
  }
`;

export const StyledButtonContainer = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
`;
