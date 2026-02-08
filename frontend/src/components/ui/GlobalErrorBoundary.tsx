import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '../Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #e53935;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #555;
`;

const ErrorDetails = styled.pre`
  background-color: #eee;
  padding: 1rem;
  border-radius: 8px;
  text-align: left;
  max-width: 80%;
  overflow-x: auto;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #d32f2f;
`;

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Aqui você pode enviar o erro para o Sentry
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <Title>Oops! Algo deu errado.</Title>
          <Message>
            Desculpe, ocorreu um erro inesperado na aplicação. Tente recarregar a página.
          </Message>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <ErrorDetails>{this.state.error.toString()}</ErrorDetails>
          )}
          <Button label="Recarregar Página" onClick={this.handleReload} primary />
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;