import React from 'react';
import { Alert, Button } from 'reactstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erro
    console.error('Erro capturado pelo Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback personalizada
      return (
        <div
          className='d-flex flex-column align-items-center justify-content-center'
          style={{ minHeight: '200px' }}
        >
          <Alert className='text-center' color='danger'>
            <h4 className='alert-heading'>Ocorreu um erro inesperado!</h4>
            <p>Algo deu errado ao renderizar este componente.</p>
            <hr />
            <p className='mb-0'>
              Por favor, tente recarregar a página ou entre em contato com o suporte.
            </p>
          </Alert>
          {this.props.showDetails && this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', maxWidth: '80%' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
          <Button className='mt-3' color='primary' onClick={() => window.location.reload()}>
            Recarregar Página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
