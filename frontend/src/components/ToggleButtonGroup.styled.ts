import styled from 'styled-components';

export const StyledToggleButtonGroup = styled.div`
  display: inline-flex;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden; // Para que as bordas arredondadas funcionem bem com os botões internos

  & > button {
    border-radius: 0; // Remover bordas arredondadas dos botões internos
    border-right: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant}; // Separador entre botões

    &:first-of-type {
      border-top-left-radius: ${({ theme }) => theme.borderRadius.small};
      border-bottom-left-radius: ${({ theme }) => theme.borderRadius.small};
    }

    &:last-of-type {
      border-top-right-radius: ${({ theme }) => theme.borderRadius.small};
      border-bottom-right-radius: ${({ theme }) => theme.borderRadius.small};
      border-right: none; // Remover separador do último botão
    }
  }
`;
