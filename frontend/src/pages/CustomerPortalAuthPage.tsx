import React, { useState } from 'react';
import CustomerPortalLayout from '../components/CustomerPortalLayout';
import CustomerAuthForm from '../components/CustomerAuthForm';
import { useNavigate } from 'react-router-dom'; // Assumindo react-router-dom

interface CustomerPortalAuthPageProps {
  // Poderia ter uma prop para a URL da API
  apiBaseUrl?: string; 
}

const CustomerPortalAuthPage: React.FC<CustomerPortalAuthPageProps> = ({ apiBaseUrl = '/api' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (osId: string, identity: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/portal/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ osId, identity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao autenticar. Verifique os dados.');
      }

      // Se sucesso, redireciona para a página de rastreamento com o token
      navigate(`/portal/${data.token}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomerPortalLayout title="Acompanhar Ordem de Serviço">
      <CustomerAuthForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </CustomerPortalLayout>
  );
};

export default CustomerPortalAuthPage;
