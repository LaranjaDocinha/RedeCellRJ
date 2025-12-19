import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import MarketplaceIntegrationCard from '../components/MarketplaceIntegrationCard';
import MarketplaceListingForm from '../components/MarketplaceListingForm';
import LoadingSpinner from '../components/LoadingSpinner';
// import { AppError } from '../../../backend/src/utils/errors'; // Removido, AppError é do backend
import Button from '../components/Button';
import Modal from '../components/Modal'; // Assumindo componente Modal
import { useAuth } from '../contexts/AuthContext'; // Para pegar o token de autenticação

const PageContainer = styled(motion.div)`
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h2`
  color: #333;
  text-align: center;
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #555;
  margin-top: 40px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const IntegrationList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const EmptyState = styled.p`
  text-align: center;
  color: #777;
  font-size: 1.1em;
  margin-top: 50px;
`;

interface MarketplaceIntegration {
  id: number;
  name: string;
  is_active: boolean;
  last_synced_at?: string;
  status_message?: string; // Pode vir do backend
}

interface ProductVariation {
  id: number;
  sku: string;
  name: string;
}

interface MarketplacePageProps {
  apiBaseUrl?: string;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ apiBaseUrl = '/api' }) => {
  const { authToken } = useAuth(); // Obter token de autenticação
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([]);
  const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [listingSubmitted, setListingSubmitted] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/marketplace/integrations`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar integrações.');
      }
      setIntegrations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, authToken]);

  const fetchProductVariations = useCallback(async () => {
    // Rota para buscar variações de produto para o form de listing
    try {
      const response = await fetch(`${apiBaseUrl}/products/variations?limit=1000`, { // Ex: /api/products/variations
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar variações de produto.');
      }
      setProductVariations(data);
    } catch (err: any) {
      console.error('Failed to fetch product variations:', err);
      // setError(err.message); // Não precisa quebrar a página toda se só isso falhar
    }
  }, [apiBaseUrl, authToken]);

  useEffect(() => {
    fetchIntegrations();
    fetchProductVariations();
  }, [fetchIntegrations, fetchProductVariations]);

  const handleSyncNow = async (integrationId: number) => {
    // Chama o endpoint de sincronização no backend
    if (!window.confirm(`Deseja sincronizar pedidos da integração ${integrationId} agora?`)) return;

    try {
      const response = await fetch(`${apiBaseUrl}/admin/marketplace/sync-orders/${integrationId}`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao iniciar sincronização.');
      }
      alert(data.message);
      fetchIntegrations(); // Atualizar a lista após sincronização
    } catch (err: any) {
      alert(`Erro ao sincronizar: ${err.message}`);
    }
  };

  const handleConfigure = (integrationId: number) => {
    alert(`Configurar integração ${integrationId}... (Implementação futura)`);
    // Redirecionar para uma página de configuração detalhada ou abrir modal
  };

  const handleListingSubmit = async (data: {
    marketplaceId: number;
    productVariationId: number;
    externalId: string;
    externalUrl?: string;
  }) => {
    setIsSubmittingListing(true);
    setListingError(null);
    setListingSubmitted(false);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/marketplace/listings`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Erro ao criar listing.');
      }
      setListingSubmitted(true);
      setShowListingModal(false); // Fechar modal após sucesso
      fetchIntegrations(); // Atualizar a lista para refletir possíveis listings
      alert('Mapeamento de produto criado/atualizado com sucesso!');
    } catch (err: any) {
      setListingError(err.message);
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  if (isLoading) {
    return (
      <PageContainer initial="hidden" animate="visible" variants={pageVariants}>
        <LoadingSpinner />
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando dados do Marketplace...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer initial="hidden" animate="visible" variants={pageVariants}>
        <Title>Gerenciamento de Marketplaces</Title>
        <p style={{ textAlign: 'center', color: '#e74c3c' }}>Erro: {error}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer initial="hidden" animate="visible" variants={pageVariants}>
      <Title>Gerenciamento de Marketplaces</Title>

      <SectionTitle>Integrações Ativas</SectionTitle>
      {integrations.length === 0 ? (
        <EmptyState>Nenhuma integração de marketplace configurada.</EmptyState>
      ) : (
        <IntegrationList>
          {integrations.map((integration) => (
            <MarketplaceIntegrationCard
              key={integration.id}
              integration={integration}
              onSyncNow={handleSyncNow}
              onConfigure={handleConfigure}
            />
          ))}
        </IntegrationList>
      )}

      <SectionTitle>Mapeamento de Produtos</SectionTitle>
      <Button onClick={() => setShowListingModal(true)} style={{ marginBottom: '20px' }}>
        + Novo Mapeamento
      </Button>

      <Modal
        isOpen={showListingModal}
        onClose={() => {
          setShowListingModal(false);
          setListingSubmitted(false);
          setListingError(null);
        }}
        title="Mapear Produto para Marketplace"
      >
        <MarketplaceListingForm
          marketplaceIntegrations={integrations}
          productVariations={productVariations}
          onSubmit={handleListingSubmit}
          isLoading={isSubmittingListing}
          error={listingError}
          isSubmitted={listingSubmitted}
        />
      </Modal>
    </PageContainer>
  );
};

export default MarketplacePage;
