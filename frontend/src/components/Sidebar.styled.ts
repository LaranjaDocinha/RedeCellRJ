import styled, { css } from 'styled-components';

export const SidebarNavItem = styled.a<{ $isCompact?: boolean }>` // Adicionar $isCompact
  display: flex; /* Use flexbox for alignment */
  align-items: center; /* Vertically center icon and text */
  gap: ${({ theme, $isCompact }) => ($isCompact ? '0' : theme.spacing.md)}; /* Espaçamento ajustado */
  padding: 10px 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 500;
  font-size: 14px;
  justify-content: ${({ $isCompact }) => ($isCompact ? 'center' : 'flex-start')}; // Centralizar ícone no modo compacto

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}20; // 12% opacity of primary
    color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.elevation2}; /* Sombra mais pronunciada no hover */
  }

  &.active {
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryLight} 100%); /* Gradiente sutil e premium */
    color: ${({ theme }) => theme.colors.onPrimary};
    box-shadow: 0 2px 4px ${({ theme }) => theme.colors.primary}40;
    border-left: 5px solid ${({ theme }) => theme.colors.primary}; /* Linha vertical colorida aprimorada */
    padding-left: 11px; /* Ajustar padding para compensar a borda */

    .sidebar-icon {
      filter: drop-shadow(0 0 5px ${({ theme }) => theme.colors.onPrimary}); /* Sombra mais pronunciada para ícone ativo */
    }
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.primary}40; /* Flash de cor ao clicar */
    transition: background-color 0.1s ease;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary}; /* Contorno de foco personalizado */
    outline-offset: 2px;
  }

  .loading-spinner {
    margin-left: auto; /* Empurra o spinner para a direita */
    animation: spin 1s linear infinite; /* Animação de rotação */
    font-size: 0.9em;
    color: ${({ theme }) => theme.colors.primary};
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .notification-badge {
    background-color: ${({ theme }) => theme.colors.error}; /* Cor de destaque para notificações */
    color: ${({ theme }) => theme.colors.onPrimary};
    font-size: 0.7em;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: auto; /* Empurra o badge para a direita */
    min-width: 20px; /* Garante largura mínima para números de 1 dígito */
    text-align: center;
  }

  .submenu-toggle-icon {
    margin-left: auto; /* Empurra o ícone para a direita */
    display: flex;
    align-items: center;
    transition: transform 0.2s ease-in-out;
  }

  & + ul.submenu { // Estilos para o submenu
    list-style: none;
    padding-left: 20px; /* Indentação para subitens */
    margin: 0;

    li {
      .sidebar-icon {
        font-size: 0.8em; /* Ícones menores para subitens */
      }
      a { // Estilos para os itens do submenu
        padding-top: 8px;
        padding-bottom: 8px;
        font-size: 13px;
        &.active {
          border-left: 2px solid ${({ theme }) => theme.colors.secondary}; /* Borda menor para subitens ativos */
          padding-left: 18px; /* Ajustar padding */
        }
      }
    }
  }
`;

export const StyledSidebar = styled.aside<{ $isOpen: boolean; $isCompact: boolean }>`
  width: ${({ $isCompact }) => ($isCompact ? '80px' : '250px')}; /* Largura ajustada */
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.surface} 0%,
    ${({ theme }) => theme.colors.background} 100%
  );
  color: ${({ theme }) => theme.colors.onSurface};
  position: fixed;
  top: 64px; /* Altura da Topbar */
  height: calc(100% - 64px); /* Ocupa o restante da tela */
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  /* transition: left 0.3s ease-in-out, width 0.3s ease-in-out; */ /* Removido */
  z-index: 1100;
  display: flex;
  flex-direction: column;
  left: ${({ $isOpen }) => ($isOpen ? '0' : '-250px')};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    top: 56px; /* Altura da Topbar em telas menores */
    height: calc(100% - 56px);
    width: 250px; /* Em telas menores, a sidebar sempre expande */
    left: ${({ $isOpen }) => ($isOpen ? '0' : '-250px')};
  }
`;

export const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}1F; // 12% opacity

  ${StyledSidebar}[$isCompact="true"] & { // Estilos para SidebarHeader quando sidebar está compacta
    justify-content: center; // Centralizar o botão de alternância
  }
`;

export const SidebarTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
`;

export const SidebarCloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.onSurface}1F;
  }

  ${StyledSidebar}[$isCompact="true"] & {
    &:first-child { /* O botão de alternância */
      margin-right: 0;
    }
    &:last-child { /* O botão de fechar */
      display: none; /* Ocultar botão de fechar no modo compacto */
    }
  }
`;

export const SidebarSearchInput = styled.input`
  width: calc(100% - ${({ theme }) => theme.spacing.sm} * 2); /* Largura total menos padding */
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  margin: 0 ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.onSurface}33; /* Borda sutil */
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

export const SidebarNav = styled.nav`
  flex-grow: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  overflow-y: auto; /* Allow scrolling for long menus */

  /* Estilos da Scrollbar Customizada */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary}80; /* Cor principal com transparência */
    border-radius: 10px;
    &:hover {
      background: ${({ theme }) => theme.colors.primary}; /* Cor principal no hover */
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

export const SidebarNavGroup = styled.li<{ $isFixed?: boolean }>` // Adicionar $isFixed
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg}; /* Espaçamento maior antes do separador */
  border-bottom: 2px solid ${({ theme }) => theme.colors.onSurface}1A; /* Separador mais perceptível */
  &:last-child {
    border-bottom: none; /* Remover borda do último grupo */
  }

  ${({ $isFixed }) => $isFixed && css` // Estilos para grupo fixado
    position: sticky;
    top: 0; /* Fixar no topo */
    background-color: ${({ theme }) => theme.colors.surface}; /* Manter fundo visível */
    z-index: 100; /* Garantir que fique acima de outros itens ao rolar */
    box-shadow: ${({ theme }) => theme.shadows.elevation1};
    margin-bottom: 0; /* Remover margem inferior para grupos fixados */
    padding-bottom: ${({ theme }) => theme.spacing.sm}; /* Ajustar padding */
    border-bottom: none; /* Remover borda inferior */
  `}
`;

export const SidebarNavGroupTitle = styled.h3`
  font-size: 1.1rem; /* Título do grupo mais proeminente */
  font-weight: 700; /* Mais negrito */
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 16px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex; /* Para alinhar título e ícone de pin */
  justify-content: space-between;
  align-items: center;

  ${StyledSidebar}[$isCompact="true"] & { // Ocultar título do grupo no modo compacto
    display: none;
  }

  .pin-icon {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
    font-size: 0.9em;
    transition: color 0.2s ease;
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export const ExternalLinkIcon = styled.span`
  margin-left: auto; /* Empurra o ícone para a direita */
  font-size: 0.8em;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease, color 0.2s ease;

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.primary};
  }
`;