import styled from 'styled-components';
import { motion } from 'framer-motion';

export const StyledPageContainer = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
  margin: 0 auto;
  max-width: 1200px; // Exemplo de largura máxima para o conteúdo da página
`;

export const StyledPageTitle = styled(motion.h1)`
  font-size: ${({ theme }) => theme.typography.h4.fontSize};
  line-height: ${({ theme }) => theme.typography.h4.lineHeight};
  font-weight: ${({ theme }) => theme.typography.h4.fontWeight};
  color: ${({ theme }) => theme.colors.onSurface};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
