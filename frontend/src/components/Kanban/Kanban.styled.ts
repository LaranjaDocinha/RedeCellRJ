import styled, { css } from 'styled-components';

export const BoardContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  overflow-x: auto;
  min-height: 70vh;
  align-items: flex-start;
`;

export const ColumnContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface}99; // 60% opacity
  border-radius: ${({ theme }) => theme.borderRadius.large};
  width: 300px;
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};

  h3 {
    margin-top: 0;
    padding-bottom: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}22; // 13% opacity
  }
`;

export const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 100px; // To make it a valid drop target even when empty
`;

export const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.elevation2};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  position: relative; // For actions

  p {
    margin: 0;
  }

  &:hover {
    ${({ theme }) => css`
      ${CardActions} {
        opacity: 1;
      }
    `}
  }
`;

export const CardActions = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xxs};
  right: ${({ theme }) => theme.spacing.xxs};
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
`;

export const CardActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.onSurface}99;
  cursor: pointer;
  font-size: 0.9rem;
  padding: ${({ theme }) => theme.spacing.xxs};
  border-radius: 50%;

  &:hover {
    background-color: ${({ theme }) => theme.colors.onSurface}11;
  }
`;

export const AddCardButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.primaryLight}22;
  color: ${({ theme }) => theme.colors.primaryDark};
  border: 1px dashed ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight}44;
  }
`;

export const AddCardForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface}CC;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
`;

export const AddCardTextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xxs};
  border: 1px solid ${({ theme }) => theme.colors.onSurface}44;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onBackground};
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const AddCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

export const AddCardActionButton = styled.button<{ cancel?: boolean }>`
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease-in-out;

  ${({ cancel, theme }) => cancel ? css`
    background-color: ${theme.colors.error}22;
    color: ${theme.colors.error};
    &:hover {
      background-color: ${theme.colors.error}44;
    }
  ` : css`
    background-color: ${theme.colors.primary};
    color: ${theme.colors.onPrimary};
    &:hover {
      background-color: ${theme.colors.primaryDark};
    }
  `}
`;