import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

export const PageContainer = styled(motion.div)`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 64px);
  background-color: transparent;
`;

export const SectionCard = styled(Box)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-bottom: 24px;
  border: 1px solid rgba(0,0,0,0.05);
`;

export const PageHeader = styled(Box)`
  margin-bottom: 32px;
  
  h1 {
    font-size: 2rem;
    font-weight: 300;
    color: #2c3e50;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }
  
  p {
    color: #7f8c8d;
    font-size: 1rem;
  }
`;
