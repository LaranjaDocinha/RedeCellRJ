import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import Button from '../components/Button';
import Dropdown from '../components/Dropdown'; // Assumindo Dropdown existente

const FormContainer = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 20px auto;
`;

const Title = styled(motion.h3)`
  text-align: center;
  color: #333;
  margin-bottom: 10px;
`;

const ErrorMessage = styled(motion.p)`
  color: #e74c3c;
  text-align: center;
  font-size: 0.9em;
`;

const SuccessMessage = styled(motion.p)`
  color: #28a745;
  text-align: center;
  font-size: 0.9em;
`;

interface MarketplaceListingFormProps {
  marketplaceIntegrations: Array<{ id: number; name: string }>;
  productVariations: Array<{ id: number; sku: string; name: string }>;
  onSubmit: (data: {
    marketplaceId: number;
    productVariationId: number;
    externalId: string;
    externalUrl?: string;
  }) => void;
  isLoading?: boolean;
  error?: string;
  isSubmitted?: boolean;
}

const MarketplaceListingForm: React.FC<MarketplaceListingFormProps> = ({
  marketplaceIntegrations,
  productVariations,
  onSubmit,
  isLoading = false,
  error,
  isSubmitted = false,
}) => {
  const [marketplaceId, setMarketplaceId] = useState<number | ''>('');
  const [productVariationId, setProductVariationId] = useState<number | ''>('');
  const [externalId, setExternalId] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (marketplaceId && productVariationId && externalId) {
      onSubmit({
        marketplaceId: Number(marketplaceId),
        productVariationId: Number(productVariationId),
        externalId,
        externalUrl: externalUrl || undefined,
      });
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren", // Anima o container primeiro
        staggerChildren: 0.1, // Depois anima os filhos sequencialmente
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (isSubmitted) {
    return (
      <SuccessMessage variants={messageVariants} initial="hidden" animate="visible">
        Mapeamento de produto criado/atualizado com sucesso!
      </SuccessMessage>
    );
  }

  return (
    <FormContainer
      variants={formVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
    >
      <Title variants={itemVariants}>Mapear Produto para Marketplace</Title>
      {error && (
        <ErrorMessage variants={messageVariants} initial="hidden" animate="visible">
          {error}
        </ErrorMessage>
      )}

      <motion.div variants={itemVariants}>
        <Dropdown
          label="Integração de Marketplace"
          options={marketplaceIntegrations.map((integration) => ({
            value: integration.id,
            label: integration.name,
          }))}
          value={marketplaceId}
          onChange={(e) => setMarketplaceId(Number(e.target.value))}
          placeholder="Selecione o Marketplace"
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Dropdown
          label="Variação de Produto Interna (SKU)"
          options={productVariations.map((pv) => ({
            value: pv.id,
            label: `${pv.sku} - ${pv.name}`,
          }))}
          value={productVariationId}
          onChange={(e) => setProductVariationId(Number(e.target.value))}
          placeholder="Selecione a Variação de Produto"
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="ID Externo do Anúncio (Marketplace)"
          placeholder="ID do anúncio no Mercado Livre, Shopee, etc."
          value={externalId}
          onChange={(e) => setExternalId(e.target.value)}
          type="text"
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="URL do Anúncio (Opcional)"
          placeholder="Link direto para o anúncio no Marketplace"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          type="url"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Mapeamento'}
        </Button>
      </motion.div>
    </FormContainer>
  );
};

export default MarketplaceListingForm;

