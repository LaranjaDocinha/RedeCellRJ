import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ForgotPasswordContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primaryLight} 0%,
    ${({ theme }) => theme.colors.primaryDark} 100%
  );
  background-size: 200% 200%;
  animation: gradientAnimation 15s ease infinite; // Reutilizar a animação se definida globalmente
  padding: ${({ theme }) => theme.spacing.md};
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
    z-index: 0;
  }
`;

const ForgotPasswordCard = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 20px;
  box-shadow: 0px 8px 32px 0 rgba(31, 38, 135, 0.37);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 15px 40px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobileL}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const ForgotPasswordPage: React.FC = () => {
  return (
    <ForgotPasswordContainer
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <ForgotPasswordCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        whileHover={{ scale: 1.02, boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.3)" }}
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Esqueceu a Senha?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Insira seu email para redefinir sua senha.
        </motion.p>
        {/* Aqui você adicionaria um formulário para o email */}
        <Link to="/login" style={{ marginTop: '16px', color: 'blue', textDecoration: 'none' }}>
          Voltar para o Login
        </Link>
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPasswordPage;
