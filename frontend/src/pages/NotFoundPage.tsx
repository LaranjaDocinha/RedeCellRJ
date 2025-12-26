import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  StyledNotFoundContainer, 
  StyledNotFoundTitle, 
  StyledNotFoundSubtitle,
  StyledNotFoundMessage, 
  ButtonContainer,
  ActionButton,
  IconWrapper,
  DecorationCircle,
  FloatingShape
} from './NotFoundPage.styled';
import { FaGhost, FaHome, FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '@mui/material/styles';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <StyledNotFoundContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <FloatingShape 
        size="200px" 
        color={theme.palette.primary.light} 
        blur="40px"
        animate={{
          x: [-100, 100, -100],
          y: [-100, 100, -100],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ top: '10%', left: '10%' }}
      />
      <FloatingShape 
        size="150px" 
        color={theme.palette.secondary?.main || theme.palette.primary.main} 
        blur="30px"
        animate={{
          x: [100, -100, 100],
          y: [100, -100, 100],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ bottom: '15%', right: '15%' }}
      />
      
      {/* Decorative background elements */}
      <DecorationCircle 
        size="400px" 
        top="-100px" 
        left="-100px" 
        color={theme.palette.primary.main} 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <DecorationCircle 
        size="300px" 
        bottom="-50px" 
        right="-50px" 
        color={theme.palette.secondary?.main || theme.palette.primary.light} 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1] 
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <IconWrapper
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <FaGhost size={100} color={theme.palette.primary.main} />
      </IconWrapper>

      <StyledNotFoundTitle
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        404
      </StyledNotFoundTitle>

      <StyledNotFoundSubtitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        Página não encontrada
      </StyledNotFoundSubtitle>

      <StyledNotFoundMessage
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Ops! O link que você seguiu pode estar quebrado ou a página pode ter sido removida. 
        Não se preocupe, acontece com os melhores exploradores!
      </StyledNotFoundMessage>

      <ButtonContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <ActionButton 
          variant="outlined" 
          color="primary"
          startIcon={<FaArrowLeft />}
          onClick={() => navigate(-1)}
        >
          Voltar
        </ActionButton>
        <ActionButton 
          variant="contained" 
          color="primary"
          startIcon={<FaHome />}
          onClick={() => navigate('/')}
        >
          Ir para o Início
        </ActionButton>
      </ButtonContainer>
    </StyledNotFoundContainer>
  );
};

export default NotFoundPage;