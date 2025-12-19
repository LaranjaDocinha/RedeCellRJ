import styled from 'styled-components';
import { motion } from 'framer-motion';

export const StyledSummaryValue = styled(motion.p)`
  font-size: ${({ theme }) => theme.typography.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.h3.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;
